import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

// GET stock adjustments
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const movements = await db.stockMovement.findMany({
    where: { type: 'ADJUST' },
    
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(movements)
}

// POST stock adjustment
export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'inventory.edit')
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { itemId, newQty, reason, type } = body // type: 'COUNT' | 'DAMAGE' | 'EXPIRE' | 'ADJUST'

  if (!itemId || newQty === undefined) {
    return NextResponse.json({ error: 'الصنف والكمية الجديدة مطلوبة' }, { status: 400 })
  }

  const item = await db.item.findUnique({ where: { id: itemId } })
  if (!item) return NextResponse.json({ error: 'الصنف غير موجود' }, { status: 404 })

  const diff = newQty - item.qtyOnHand
  const adjustType = diff > 0 ? 'IN' : 'OUT'

  try {
    const result = await db.$transaction(async (tx) => {
      await tx.item.update({
        where: { id: itemId },
        data: { qtyOnHand: newQty }
      })

      const movement = await tx.stockMovement.create({
        data: {
          itemId,
          type: 'ADJUST',
          quantity: Math.abs(diff),
          reference: `${type || 'ADJUST'}: ${reason || 'تسوية مخزون'}`,
          date: new Date(),
        }
      })

      // Accounting: Dr/Cr Inventory vs Adjustment account
      const accounts = await tx.account.findMany()
      const invAcc = accounts.find(a => a.code === '1103')
      if (invAcc) {
        const jeCount = await tx.journalEntry.count()
        await tx.journalEntry.create({
          data: {
            entryNo: `JE-${String(jeCount + 1).padStart(4, '0')}`,
            date: new Date(),
            description: `تسوية مخزون - ${item.name} (${reason || ''})`,
            totalDebit: Math.abs(diff) * item.costPrice,
            totalCredit: Math.abs(diff) * item.costPrice,
            status: 'POSTED',
            lines: { create: [
              { accountId: invAcc.id, debit: diff > 0 ? Math.abs(diff) * item.costPrice : 0, credit: diff < 0 ? Math.abs(diff) * item.costPrice : 0 },
              { accountId: invAcc.id, debit: diff < 0 ? Math.abs(diff) * item.costPrice : 0, credit: diff > 0 ? Math.abs(diff) * item.costPrice : 0 },
            ]}
          }
        })
      }

      return movement
    })

    await logAudit(auth, 'تسوية مخزون', 'المخازن', `${item.name}: ${item.qtyOnHand} → ${newQty}`, req)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
