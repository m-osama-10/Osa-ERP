import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const purchases = await db.purchase.findMany({
    include: { supplier: true, items: { include: { item: true } } },
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(purchases)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'suppliers.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { supplierId, date, items, notes, paidAmount } = body

  if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'المورد والأصناف مطلوبة' }, { status: 400 })
  }

  const settingRow = await db.setting.findUnique({ where: { key: 'system' } })
  const settings = settingRow ? JSON.parse(settingRow.value) : { taxRate: 14 }

  const subtotal = items.reduce((s: number, it: any) => s + it.total, 0)
  const taxRate = settings.taxRate || 14
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  let purchaseNo = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await db.purchase.count()
    const candidate = `PUR-${String(2000 + count + attempt).padStart(5, '0')}`
    const exists = await db.purchase.findUnique({ where: { purchaseNo: candidate } })
    if (!exists) { purchaseNo = candidate; break }
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // Get cost prices for stock valuation
      const itemIds = items.map((it: any) => it.itemId)
      const itemRecords = await tx.item.findMany({ where: { id: { in: itemIds } } })
      const itemMap = new Map(itemRecords.map(i => [i.id, i]))

      const purchase = await tx.purchase.create({
        data: {
          purchaseNo, supplierId,
          date: new Date(date),
          subtotal, taxAmount, total,
          paidAmount: paidAmount || 0,
          status: (paidAmount || 0) >= total ? 'PAID' : (paidAmount || 0) > 0 ? 'PARTIAL' : 'UNPAID',
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

      // Update supplier balance
      await tx.supplier.update({
        where: { id: supplierId },
        data: { balance: { increment: total - (paidAmount || 0) } }
      })

      // Increase inventory + update cost price + create stock movements
      for (const it of items) {
        const item = itemMap.get(it.itemId)
        if (!item) continue

        // Calculate weighted average cost
        const oldTotal = item.costPrice * item.qtyOnHand
        const newTotal = it.price * it.quantity
        const newQty = item.qtyOnHand + it.quantity
        const avgCost = newQty > 0 ? (oldTotal + newTotal) / newQty : it.price

        await tx.item.update({
          where: { id: it.itemId },
          data: {
            qtyOnHand: { increment: it.quantity },
            costPrice: avgCost, // Update to weighted average cost
          }
        })
        await tx.stockMovement.create({
          data: {
            itemId: it.itemId, type: 'IN', quantity: it.quantity,
            reference: purchaseNo, date: new Date(date),
          }
        })
      }

      return purchase
    })

    await logAudit(auth, 'إنشاء فاتورة شراء', 'المشتريات', `${purchaseNo} - Total: ${total}`, req)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: 'فشل إنشاء الفاتورة', details: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'suppliers.edit')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, notes, status } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const purchase = await db.purchase.update({ where: { id }, data: { notes, status } })
  return NextResponse.json(purchase)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'suppliers.delete')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const purchase = await db.purchase.findUnique({ where: { id } })
  if (!purchase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.purchaseItem.deleteMany({ where: { purchaseId: id } })
  await db.purchase.delete({ where: { id } })
  await logAudit(auth, 'حذف فاتورة شراء', 'المشتريات', purchase.purchaseNo, req)
  return NextResponse.json({ success: true })
}
