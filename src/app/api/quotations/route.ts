import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const quotes = await db.invoice.findMany({
    where: { type: 'QUOTE' },
    include: { customer: true, items: { include: { item: true } } },
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(quotes)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'sales.create')
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { customerId, date, items, discount, discountType, notes, validUntil } = body

  if (!customerId || !items?.length) {
    return NextResponse.json({ error: 'العميل والأصناف مطلوبة' }, { status: 400 })
  }

  const settingRow = await db.setting.findUnique({ where: { key: 'system' } })
  const settings = settingRow ? JSON.parse(settingRow.value) : { taxRate: 14 }

  const subtotal = items.reduce((s: number, it: any) => s + it.total, 0)
  let discountAmount = 0
  if (discountType === 'PERCENT') {
    discountAmount = subtotal * (Math.min(Math.max(discount || 0, 0), 100) / 100)
  } else {
    discountAmount = Math.max(0, Math.min(discount || 0, subtotal))
  }
  const taxableAmount = subtotal - discountAmount
  const taxAmount = taxableAmount * (settings.taxRate / 100)
  const total = taxableAmount + taxAmount

  let quoteNo = ''
  for (let i = 0; i < 5; i++) {
    const count = await db.invoice.count({ where: { type: 'QUOTE' } })
    const candidate = `QUO-${String(6000 + count + i).padStart(5, '0')}`
    const exists = await db.invoice.findUnique({ where: { invoiceNo: candidate } })
    if (!exists) { quoteNo = candidate; break }
  }

  // Quotation does NOT affect inventory, customer balance, or accounting
  const quote = await db.invoice.create({
    data: {
      invoiceNo: quoteNo,
      customerId,
      date: new Date(date),
      dueDate: validUntil ? new Date(validUntil) : null,
      subtotal,
      discount: discountAmount,
      discountType: discountType || 'FIXED',
      taxRate: settings.taxRate,
      taxAmount,
      total,
      paidAmount: 0,
      status: 'UNPAID',
      type: 'QUOTE',
      notes,
      items: {
        create: items.map((it: any) => ({
          itemId: it.itemId,
          quantity: it.quantity,
          price: it.price,
          discount: it.discount || 0,
          total: it.total,
        }))
      },
    },
    include: { items: true },
  })

  await logAudit(auth, 'عرض سعر', 'المبيعات', `${quoteNo} - ${total}`, req)
  return NextResponse.json(quote)
}

// Convert quotation to invoice
export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'sales.create')
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { id, action } = body

  if (action === 'convert') {
    // Convert quote to invoice
    const quote = await db.invoice.findUnique({
      where: { id },
      include: { items: true }
    })
    if (!quote || quote.type !== 'QUOTE') {
      return NextResponse.json({ error: 'عرض السعر غير موجود' }, { status: 404 })
    }

    // Validate stock
    for (const it of quote.items) {
      const item = await db.item.findUnique({ where: { id: it.itemId } })
      if (!item || item.qtyOnHand < it.quantity) {
        return NextResponse.json({
          error: `المخزون غير كافٍ لـ "${item?.name || it.itemId}"`
        }, { status: 400 })
      }
    }

    // Change type to SALES (this triggers inventory deduction via invoice flow)
    const invoice = await db.invoice.update({
      where: { id },
      data: { type: 'SALES' }
    })

    // Now process as a real sale (decrement inventory, update customer balance, accounting)
    try {
      await db.$transaction(async (tx) => {
        await tx.customer.update({
          where: { id: quote.customerId },
          data: { balance: { increment: quote.total } }
        })

        for (const it of quote.items) {
          await tx.item.update({
            where: { id: it.itemId },
            data: { qtyOnHand: { decrement: it.quantity } }
          })
          await tx.stockMovement.create({
            data: {
              itemId: it.itemId, type: 'OUT', quantity: it.quantity,
              reference: quote.invoiceNo, date: new Date(),
            }
          })
        }

        // Journal entry
        const accounts = await tx.account.findMany()
        const arAcc = accounts.find(a => a.code === '1102')
        const salesAcc = accounts.find(a => a.code === '4100')
        const vatAcc = accounts.find(a => a.code === '2102')
        const jeCount = await tx.journalEntry.count()
        if (arAcc && salesAcc && vatAcc) {
          await tx.journalEntry.create({
            data: {
              entryNo: `JE-${String(jeCount + 1).padStart(4, '0')}`,
              date: new Date(),
              description: `فاتورة مبيعات ${quote.invoiceNo}`,
              totalDebit: quote.total, totalCredit: quote.total, status: 'POSTED',
              lines: { create: [
                { accountId: arAcc.id, debit: quote.total, credit: 0 },
                { accountId: salesAcc.id, debit: 0, credit: quote.subtotal - quote.discount },
                { accountId: vatAcc.id, debit: 0, credit: quote.taxAmount },
              ]}
            }
          })
          await tx.account.update({ where: { id: arAcc.id }, data: { balance: { increment: quote.total } } })
          await tx.account.update({ where: { id: salesAcc.id }, data: { balance: { increment: quote.subtotal - quote.discount } } })
          await tx.account.update({ where: { id: vatAcc.id }, data: { balance: { increment: quote.taxAmount } } })
        }
      })

      await logAudit(auth, 'تحويل عرض سعر لفاتورة', 'المبيعات', quote.invoiceNo, req)
      return NextResponse.json(invoice)
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
