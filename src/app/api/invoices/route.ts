import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const invoices = await db.invoice.findMany({
    include: { customer: true, items: { include: { item: true } } },
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'sales.create')
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { customerId, date, dueDate, items, discount, discountType, notes, type, paidAmount } = body

  if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'العميل والأصناف مطلوبة' }, { status: 400 })
  }

  // Validate stock availability before creating invoice
  const stockItemIds = items.map((it: any) => it.itemId)
  const stockItems = await db.item.findMany({ where: { id: { in: stockItemIds } } })
  for (const it of items) {
    const item = stockItems.find(i => i.id === it.itemId)
    if (!item) {
      return NextResponse.json({ error: `الصنف غير موجود` }, { status: 400 })
    }
    if (item.qtyOnHand < it.quantity) {
      return NextResponse.json({
        error: `الكمية المطلوبة من "${item.name}" (${it.quantity}) أكبر من المخزون المتاح (${item.qtyOnHand})`
      }, { status: 400 })
    }
  }

  // Get system settings for tax rate
  const settingRow = await db.setting.findUnique({ where: { key: 'system' } })
  const settings = settingRow ? JSON.parse(settingRow.value) : { taxRate: 14 }

  const subtotal = items.reduce((s: number, it: any) => s + it.total, 0)
  // Apply discount: FIXED (amount) or PERCENT (%)
  let discountAmount = 0
  if (discountType === 'PERCENT') {
    discountAmount = subtotal * (Math.min(Math.max(discount || 0, 0), 100) / 100)
  } else {
    discountAmount = Math.max(0, Math.min(discount || 0, subtotal))
  }
  const taxableAmount = subtotal - discountAmount
  const taxRate = settings.taxRate || 14
  const taxAmount = taxableAmount * (taxRate / 100)
  const total = taxableAmount + taxAmount

  // Look up accounts (cache could be added)
  const accounts = await db.account.findMany()
  const findAcc = (code: string) => accounts.find(a => a.code === code)
  const arAcc = findAcc('1102') // Accounts Receivable
  const salesAcc = findAcc('4100') // Sales
  const vatAcc = findAcc('2102') // VAT Payable
  const cashAcc = findAcc('1101') // Cash
  const cogsAcc = findAcc('5100') // COGS
  const invAcc = findAcc('1103') // Inventory

  // Generate unique invoice number (retry on collision)
  let invoiceNo = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await db.invoice.count()
    const candidate = `INV-${String(1000 + count + attempt).padStart(5, '0')}`
    const exists = await db.invoice.findUnique({ where: { invoiceNo: candidate } })
    if (!exists) { invoiceNo = candidate; break }
  }
  if (!invoiceNo) return NextResponse.json({ error: 'فشل توليد رقم فاتورة فريد' }, { status: 500 })

  // Get cost prices for COGS (snapshot at sale time)
  const itemIds = items.map((it: any) => it.itemId)
  const itemRecords = await db.item.findMany({ where: { id: { in: itemIds } } })
  const itemMap = new Map(itemRecords.map(i => [i.id, i]))

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Create invoice + items + snapshot costPrice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNo,
          customerId,
          date: new Date(date),
          dueDate: dueDate ? new Date(dueDate) : null,
          subtotal,
          discount: discountAmount,
          discountType: discountType || 'FIXED',
          taxRate,
          taxAmount,
          total,
          paidAmount: paidAmount || 0,
          status: paidAmount >= total ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
          type: type || 'SALES',
          notes,
          items: {
            create: items.map((it: any) => {
              const item = itemMap.get(it.itemId)
              return {
                itemId: it.itemId,
                quantity: it.quantity,
                price: it.price,
                discount: it.discount || 0,
                discountType: it.discountType || 'FIXED',
                total: it.total,
              }
            })
          },
        },
        include: { items: true },
      })

      // 2. Update customer balance
      await tx.customer.update({
        where: { id: customerId },
        data: { balance: { increment: total - (paidAmount || 0) } }
      })

      // 3. Decrement inventory + create stock movements
      const cogsTotal = items.reduce((s: number, it: any) => {
        const item = itemMap.get(it.itemId)
        return s + (item ? item.costPrice * it.quantity : 0)
      }, 0)

      for (const it of items) {
        const item = itemMap.get(it.itemId)
        if (!item) continue
        await tx.item.update({
          where: { id: it.itemId },
          data: { qtyOnHand: { decrement: it.quantity } }
        })
        await tx.stockMovement.create({
          data: {
            itemId: it.itemId,
            type: 'OUT',
            quantity: it.quantity,
            reference: invoiceNo,
            date: new Date(date),
          }
        })
      }

      // 4. Create journal entry (balanced: Dr AR / Cr Revenue / Cr VAT)
      if (arAcc && salesAcc && vatAcc) {
        const jeCount = await tx.journalEntry.count()
        await tx.journalEntry.create({
          data: {
            entryNo: `JE-${String(jeCount + 1).padStart(4, '0')}`,
            date: new Date(date),
            description: `فاتورة مبيعات ${invoiceNo}`,
            reference: invoiceNo,
            totalDebit: total,
            totalCredit: total,
            status: 'POSTED',
            lines: {
              create: [
                { accountId: arAcc.id, debit: total, credit: 0, description: `ذمم مدينة - ${invoiceNo}` },
                { accountId: salesAcc.id, debit: 0, credit: taxableAmount, description: `إيراد مبيعات` },
                { accountId: vatAcc.id, debit: 0, credit: taxAmount, description: `ضريبة قيمة مضافة` },
              ]
            }
          }
        })
        // Update account balances
        await tx.account.update({ where: { id: arAcc.id }, data: { balance: { increment: total } } })
        await tx.account.update({ where: { id: salesAcc.id }, data: { balance: { increment: taxableAmount } } })
        await tx.account.update({ where: { id: vatAcc.id }, data: { balance: { increment: taxAmount } } })

        // COGS journal entry (Dr COGS / Cr Inventory)
        if (cogsAcc && invAcc && cogsTotal > 0) {
          const jeCount2 = await tx.journalEntry.count()
          await tx.journalEntry.create({
            data: {
              entryNo: `JE-${String(jeCount2 + 1).padStart(4, '0')}`,
              date: new Date(date),
              description: `تكلفة بضاعة مباعة - ${invoiceNo}`,
              reference: invoiceNo,
              totalDebit: cogsTotal,
              totalCredit: cogsTotal,
              status: 'POSTED',
              lines: {
                create: [
                  { accountId: cogsAcc.id, debit: cogsTotal, credit: 0 },
                  { accountId: invAcc.id, debit: 0, credit: cogsTotal },
                ]
              }
            }
          })
          await tx.account.update({ where: { id: cogsAcc.id }, data: { balance: { increment: cogsTotal } } })
          await tx.account.update({ where: { id: invAcc.id }, data: { balance: { decrement: cogsTotal } } })
        }
      }

      // 5. If paid, create cash transaction + payment journal
      if (paidAmount > 0 && cashAcc && arAcc) {
        await tx.transaction.create({
          data: {
            type: 'RECEIPT',
            cashId: null, // would be set if specific cash chosen
            amount: paidAmount,
            date: new Date(date),
            description: `تحصيل فاتورة ${invoiceNo}`,
            refType: 'INVOICE',
            refId: invoice.id,
          }
        })
        await tx.account.update({ where: { id: cashAcc.id }, data: { balance: { increment: paidAmount } } })
        await tx.account.update({ where: { id: arAcc.id }, data: { balance: { decrement: paidAmount } } })
      }

      return invoice
    })

    await logAudit(auth, 'إنشاء فاتورة', 'المبيعات', `Invoice ${invoiceNo} - Total: ${total}`, req)
    return NextResponse.json(result)
  } catch (e: any) {
    console.error('Invoice creation failed:', e)
    return NextResponse.json({ error: 'فشل إنشاء الفاتورة', details: e.message }, { status: 500 })
  }
}
