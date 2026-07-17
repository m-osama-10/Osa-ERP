import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const returns = await db.invoice.findMany({
    where: { type: 'RETURN' },
    include: { customer: true, items: { include: { item: true } } },
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(returns)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'sales.create')
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { customerId, date, items, notes, originalInvoiceId } = body

  if (!customerId || !items?.length) {
    return NextResponse.json({ error: 'العميل والأصناف مطلوبة' }, { status: 400 })
  }

  const settingRow = await db.setting.findUnique({ where: { key: 'system' } })
  const settings = settingRow ? JSON.parse(settingRow.value) : { taxRate: 14 }

  const subtotal = items.reduce((s: number, it: any) => s + it.total, 0)
  const taxAmount = subtotal * (settings.taxRate / 100)
  const total = subtotal + taxAmount

  let returnNo = ''
  for (let i = 0; i < 5; i++) {
    const count = await db.invoice.count({ where: { type: 'RETURN' } })
    const candidate = `RTN-${String(5000 + count + i).padStart(5, '0')}`
    const exists = await db.invoice.findUnique({ where: { invoiceNo: candidate } })
    if (!exists) { returnNo = candidate; break }
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const itemIds = items.map((it: any) => it.itemId)
      const itemRecords = await tx.item.findMany({ where: { id: { in: itemIds } } })
      const itemMap = new Map(itemRecords.map(i => [i.id, i]))

      const salesReturn = await tx.invoice.create({
        data: {
          invoiceNo: returnNo,
          customerId,
          date: new Date(date),
          subtotal, discount: 0, taxRate: settings.taxRate,
          taxAmount, total, paidAmount: 0,
          status: 'COMPLETED', type: 'RETURN', notes,
          items: {
            create: items.map((it: any) => ({
              itemId: it.itemId,
              quantity: it.quantity,
              price: it.price,
              discount: 0,
              total: it.total,
            }))
          },
        },
        include: { items: true },
      })

      // Increase inventory (customer returns goods)
      for (const it of items) {
        const item = itemMap.get(it.itemId)
        if (!item) continue
        await tx.item.update({
          where: { id: it.itemId },
          data: { qtyOnHand: { increment: it.quantity } }
        })
        await tx.stockMovement.create({
          data: {
            itemId: it.itemId, type: 'IN', quantity: it.quantity,
            reference: returnNo, date: new Date(date),
          }
        })
      }

      // Update customer balance (reduce what they owe)
      await tx.customer.update({
        where: { id: customerId },
        data: { balance: { decrement: total } }
      })

      // Accounting: Dr Sales Returns / Cr Accounts Receivable
      const accounts = await tx.account.findMany()
      const arAcc = accounts.find(a => a.code === '1102')
      const salesAcc = accounts.find(a => a.code === '4100')
      const jeCount = await tx.journalEntry.count()
      if (arAcc && salesAcc) {
        await tx.journalEntry.create({
          data: {
            entryNo: `JE-${String(jeCount + 1).padStart(4, '0')}`,
            date: new Date(date),
            description: `مرتجع مبيعات ${returnNo}`,
            totalDebit: total, totalCredit: total, status: 'POSTED',
            lines: { create: [
              { accountId: salesAcc.id, debit: total, credit: 0 },
              { accountId: arAcc.id, debit: 0, credit: total },
            ]}
          }
        })
        await tx.account.update({ where: { id: salesAcc.id }, data: { balance: { decrement: total } } })
        await tx.account.update({ where: { id: arAcc.id }, data: { balance: { decrement: total } } })
      }

      return salesReturn
    })

    await logAudit(auth, 'مرتجع مبيعات', 'المبيعات', `${returnNo} - ${total}`, req)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
