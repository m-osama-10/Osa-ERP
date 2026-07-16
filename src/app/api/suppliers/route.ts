import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const suppliers = await db.supplier.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(suppliers)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'suppliers.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const count = await db.supplier.count()
  const supplier = await db.supplier.create({
    data: {
      code: body.code || `S-${String(count + 1).padStart(3, '0')}`,
      name: body.name,
      nameEn: body.nameEn,
      phone: body.phone,
      email: body.email,
      address: body.address,
      taxNo: body.taxNo,
      creditLimit: body.creditLimit || 0,
      openingBalance: body.openingBalance || 0,
      balance: body.openingBalance || 0,
      currency: body.currency || 'EGP',
    },
  })
  await logAudit(auth, 'إضافة مورد', 'الموردين', `${supplier.code} - ${supplier.name}`, req)
  return NextResponse.json(supplier)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'suppliers.edit')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, ...raw } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const allowed = ['name', 'nameEn', 'phone', 'email', 'address', 'taxNo', 'creditLimit', 'currency', 'isActive']
  const data: any = {}
  for (const k of allowed) if (k in raw) data[k] = raw[k]
  const supplier = await db.supplier.update({ where: { id }, data })
  await logAudit(auth, 'تعديل مورد', 'الموردين', `${supplier.code} - ${supplier.name}`, req)
  return NextResponse.json(supplier)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'suppliers.delete')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const purchaseCount = await db.purchase.count({ where: { supplierId: id } })
  if (purchaseCount > 0) {
    return NextResponse.json({ error: `لا يمكن الحذف: المورد مرتبط بـ ${purchaseCount} أمر شراء` }, { status: 409 })
  }
  const supplier = await db.supplier.findUnique({ where: { id } })
  await db.supplier.delete({ where: { id } })
  await logAudit(auth, 'حذف مورد', 'الموردين', `${supplier?.code} - ${supplier?.name}`, req)
  return NextResponse.json({ success: true })
}
