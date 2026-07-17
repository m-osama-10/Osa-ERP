import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

// GET warehouse transfers
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const transfers = await db.stockMovement.findMany({
    where: { type: 'TRANSFER' },
    
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(transfers)
}

// POST warehouse transfer
export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'inventory.edit')
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { itemId, quantity, fromWarehouseId, toWarehouseId, notes } = body

  if (!itemId || !quantity || quantity <= 0) {
    return NextResponse.json({ error: 'الصنف والكمية مطلوبة' }, { status: 400 })
  }

  const item = await db.item.findUnique({ where: { id: itemId } })
  if (!item) return NextResponse.json({ error: 'الصنف غير موجود' }, { status: 404 })

  if (item.qtyOnHand < quantity) {
    return NextResponse.json({
      error: `الكمية المطلوبة (${quantity}) أكبر من المخزون المتاح (${item.qtyOnHand})`
    }, { status: 400 })
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // Create transfer record as stock movement
      const movement = await tx.stockMovement.create({
        data: {
          itemId,
          type: 'TRANSFER',
          quantity,
          fromWarehouseId: fromWarehouseId || null,
          toWarehouseId: toWarehouseId || null,
          reference: notes || 'تحويل بين المخازن',
          date: new Date(),
        }
      })

      // In a single-warehouse system, transfer is just a record
      // In multi-warehouse, we'd update warehouse-specific stock
      // For now, qtyOnHand stays the same (it's a location change)

      return movement
    })

    await logAudit(auth, 'تحويل مخزون', 'المخازن', `${item.name}: ${quantity} وحدة`, req)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
