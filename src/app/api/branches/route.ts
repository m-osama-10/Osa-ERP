import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const branches = await db.branch.findMany({ orderBy: { code: 'asc' } })
  // Count employees per branch manually
  const employees = await db.employee.groupBy({ by: ['branchId'], _count: true })
  const empMap = new Map(employees.filter(e => e.branchId).map(e => [e.branchId, e._count]))
  const result = branches.map(b => ({ ...b, _count: { employees: empMap.get(b.id) || 0 } }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'branches.manage')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  if (!body.name || !body.code) return NextResponse.json({ error: 'الاسم والرمز مطلوبان' }, { status: 400 })

  const existing = await db.branch.findFirst({ where: { code: body.code } })
  if (existing) return NextResponse.json({ error: 'الرمز مستخدم' }, { status: 400 })

  const branch = await db.branch.create({
    data: {
      companyId: body.companyId || (await db.company.findFirst())?.id || '',
      name: body.name, code: body.code,
      address: body.address, phone: body.phone,
      isActive: body.isActive ?? true,
    }
  })
  await logAudit(auth, 'إضافة فرع', 'الفروع', `${branch.code} - ${branch.name}`, req)
  return NextResponse.json(branch)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'branches.manage')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const branch = await db.branch.update({ where: { id }, data: {
    name: data.name, address: data.address, phone: data.phone, isActive: data.isActive
  }})
  await logAudit(auth, 'تعديل فرع', 'الفروع', branch.code, req)
  return NextResponse.json(branch)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'branches.manage')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.branch.delete({ where: { id } })
  await logAudit(auth, 'حذف فرع', 'الفروع', id, req)
  return NextResponse.json({ success: true })
}
