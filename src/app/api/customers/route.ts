import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const customers = await db.customer.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(customers)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'customers.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const count = await db.customer.count()
  const customer = await db.customer.create({
    data: {
      code: body.code || `C-${String(count + 1).padStart(3, '0')}`,
      name: body.name,
      nameEn: body.nameEn,
      type: body.type || 'INDIVIDUAL',
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
  await logAudit(auth, 'إضافة عميل', 'العملاء', `${customer.code} - ${customer.name}`, req)
  return NextResponse.json(customer)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'customers.edit')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, ...raw } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  // Whitelist editable fields (prevent balance/createdAt tampering)
  const allowed = ['name', 'nameEn', 'type', 'phone', 'email', 'address', 'taxNo', 'creditLimit', 'currency', 'isActive']
  const data: any = {}
  for (const k of allowed) if (k in raw) data[k] = raw[k]

  const customer = await db.customer.update({ where: { id }, data })
  await logAudit(auth, 'تعديل عميل', 'العملاء', `${customer.code} - ${customer.name}`, req)
  return NextResponse.json(customer)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'customers.delete')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  // Check for related invoices
  const invoiceCount = await db.invoice.count({ where: { customerId: id } })
  if (invoiceCount > 0) {
    return NextResponse.json({ error: `لا يمكن الحذف: العميل مرتبط بـ ${invoiceCount} فاتورة` }, { status: 409 })
  }

  const customer = await db.customer.findUnique({ where: { id } })
  await db.customer.delete({ where: { id } })
  await logAudit(auth, 'حذف عميل', 'العملاء', `${customer?.code} - ${customer?.name}`, req)
  return NextResponse.json({ success: true })
}
