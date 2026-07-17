import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const where: any = {}
  if (status) where.status = status

  const orders = await db.productionOrder.findMany({
    where,
    include: { bom: { include: { lines: { include: { item: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'production.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  if (!body.productName || !body.quantity) return NextResponse.json({ error: 'المنتج والكمية مطلوبان' }, { status: 400 })

  const count = await db.productionOrder.count()
  const orderNo = `PO-${String(count + 1).padStart(4, '0')}`
  const unitCost = body.unitCost || 0
  const totalCost = unitCost * body.quantity

  const order = await db.productionOrder.create({
    data: {
      orderNo, bomId: body.bomId || null,
      productName: body.productName, quantity: body.quantity,
      unitCost, totalCost, status: body.status || 'PLANNED',
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : null,
      notes: body.notes,
    }
  })
  await logAudit(auth, 'إنشاء أمر إنتاج', 'الإنتاج', `${orderNo} - ${body.productName}`, req)
  return NextResponse.json(order)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'production.edit')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const updateData: any = {
    productName: data.productName,
    quantity: data.quantity,
    unitCost: data.unitCost,
    totalCost: (data.unitCost || 0) * (data.quantity || 0),
    status: data.status,
    notes: data.notes,
  }
  if (data.endDate) updateData.endDate = new Date(data.endDate)

  const order = await db.productionOrder.update({ where: { id }, data: updateData })
  await logAudit(auth, 'تعديل أمر إنتاج', 'الإنتاج', order.orderNo, req)
  return NextResponse.json(order)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'production.edit')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const order = await db.productionOrder.findUnique({ where: { id } })
  await db.productionOrder.delete({ where: { id } })
  await logAudit(auth, 'حذف أمر إنتاج', 'الإنتاج', order?.orderNo || id, req)
  return NextResponse.json({ success: true })
}
