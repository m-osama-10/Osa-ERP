import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'representatives.manage')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  if (!body.repId) return NextResponse.json({ error: 'المندوب مطلوب' }, { status: 400 })

  const visit = await db.repVisit.create({
    data: {
      repId: body.repId,
      customerId: body.customerId || null,
      customerName: body.customerName || null,
      visitDate: new Date(),
      status: body.status || 'VISITED',
      collectedAmount: body.collectedAmount || 0,
      notes: body.notes,
      gpsLat: body.gpsLat || null,
      gpsLng: body.gpsLng || null,
    }
  })

  // Update rep totals
  await db.representative.update({
    where: { id: body.repId },
    data: {
      totalVisits: { increment: 1 },
      totalCollected: { increment: body.collectedAmount || 0 },
      lastSync: new Date(),
    }
  })

  await logAudit(auth, 'تسجيل زيارة مندوب', 'المندوبين', `Rep: ${body.repId}`, req)
  return NextResponse.json(visit)
}
