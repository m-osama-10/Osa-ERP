import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const items = await db.item.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'inventory.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const count = await db.item.count()
  const item = await db.item.create({
    data: {
      sku: body.sku || `ITM-${String(count + 1).padStart(3, '0')}`,
      barcode: body.barcode,
      name: body.name,
      nameEn: body.nameEn,
      description: body.description,
      categoryId: body.categoryId || null,
      unit: body.unit || 'PCS',
      costPrice: body.costPrice || 0,
      salePrice: body.salePrice || 0,
      qtyOnHand: body.qtyOnHand || 0,
      reorderLevel: body.reorderLevel || 10,
      isManufactured: body.isManufactured || false,
    },
  })
  await logAudit(auth, 'إضافة صنف', 'المخازن', `${item.sku} - ${item.name}`, req)
  return NextResponse.json(item)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'inventory.edit')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, ...raw } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const allowed = ['sku', 'barcode', 'name', 'nameEn', 'description', 'categoryId', 'unit', 'costPrice', 'salePrice', 'reorderLevel', 'isActive', 'isManufactured']
  const data: any = {}
  for (const k of allowed) if (k in raw) data[k] = raw[k]
  const item = await db.item.update({ where: { id }, data })
  await logAudit(auth, 'تعديل صنف', 'المخازن', `${item.sku} - ${item.name}`, req)
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'inventory.delete')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const item = await db.item.findUnique({ where: { id } })
  await db.item.delete({ where: { id } })
  await logAudit(auth, 'حذف صنف', 'المخازن', `${item?.sku} - ${item?.name}`, req)
  return NextResponse.json({ success: true })
}
