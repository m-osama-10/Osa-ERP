import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

// GET purchase returns
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const returns = await db.purchase.findMany({
    where: { status: "RETURN" },
    include: { supplier: true, items: { include: { item: true } } },
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(returns)
}

// POST create purchase return
export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'suppliers.create')
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { supplierId, date, items, notes, purchaseId } = body

  if (!supplierId || !items?.length) {
    return NextResponse.json({ error: 'المورد والأصناف مطلوبة' }, { status: 400 })
  }

  const settingRow = await db.setting.findUnique({ where: { key: 'system' } })
  const settings = settingRow ? JSON.parse(settingRow.value) : { taxRate: 14 }

  const subtotal = items.reduce((s: number, it: any) => s + it.total, 0)
  const taxAmount = subtotal * (settings.taxRate / 100)
  const total = subtotal + taxAmount

  let returnNo = ''
  for (let i = 0; i < 5; i++) {
    const count = await db.purchase.count({ where: { status: "RETURN" } })
    const candidate = `PRN-${String(3000 + count + i).padStart(5, '0')}`
    const exists = await db.purchase.findUnique({ where: { purchaseNo: candidate } })
    if (!exists) { returnNo = candidate; break }
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const itemIds = items.map((it: any) => it.itemId)
      const itemRecords = await tx.item.findMany({ where: { id: { in: itemIds } } })
      const itemMap = new Map(itemRecords.map(i => [i.id, i]))

      const purchaseReturn = await tx.purchase.create({
        data: {
          purchaseNo: returnNo,
          supplierId,
          date: new Date(date),
          subtotal, taxAmount, total,
          paidAmount: 0,
          status: "RETURN",
          notes,
          items: {
            create: items.map((it: any) => ({
              itemId: it.itemId,
              quantity: it.quantity,
              price: it.price,
              total: it.total,
            }))
          },
        },
        include: { items: true },
      })

      // Decrease inventory (return to supplier)
      for (const it of items) {
        const item = itemMap.get(it.itemId)
        if (!item) continue
        await tx.item.update({
          where: { id: it.itemId },
          data: { qtyOnHand: { decrement: it.quantity } }
        })
        await tx.stockMovement.create({
          data: {
            itemId: it.itemId, type: 'OUT', quantity: it.quantity,
            reference: returnNo, date: new Date(date),
          }
        })
      }

      // Update supplier balance (decrease what we owe)
      await tx.supplier.update({
        where: { id: supplierId },
        data: { balance: { decrement: total } }
      })

      // Accounting entry: Dr Accounts Payable / Cr Inventory
      const accounts = await tx.account.findMany()
      const apAcc = accounts.find(a => a.code === '2101')
      const invAcc = accounts.find(a => a.code === '1103')
      const jeCount = await tx.journalEntry.count()
      if (apAcc && invAcc) {
        await tx.journalEntry.create({
          data: {
            entryNo: `JE-${String(jeCount + 1).padStart(4, '0')}`,
            date: new Date(date),
            description: `مرتجع شراء ${returnNo}`,
            totalDebit: total, totalCredit: total, status: 'POSTED',
            lines: { create: [
              { accountId: apAcc.id, debit: total, credit: 0 },
              { accountId: invAcc.id, debit: 0, credit: total },
            ]}
          }
        })
        await tx.account.update({ where: { id: apAcc.id }, data: { balance: { decrement: total } } })
        await tx.account.update({ where: { id: invAcc.id }, data: { balance: { decrement: total } } })
      }

      return purchaseReturn
    })

    await logAudit(auth, 'مرتجع شراء', 'المشتريات', `${returnNo} - ${total}`, req)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
