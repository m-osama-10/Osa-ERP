import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const employees = await db.employee.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(employees)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const count = await db.employee.count()
  const emp = await db.employee.create({
    data: {
      code: body.code || `EMP-${String(count + 1).padStart(3, '0')}`,
      name: body.name,
      nameEn: body.nameEn,
      nationalId: body.nationalId,
      phone: body.phone,
      email: body.email,
      position: body.position,
      department: body.department,
      hireDate: body.hireDate ? new Date(body.hireDate) : new Date(),
      basicSalary: body.basicSalary || 0,
      allowances: body.allowances || 0,
      status: 'ACTIVE',
    },
  })
  await logAudit(auth, 'إضافة موظف', 'الموارد البشرية', `${emp.code} - ${emp.name}`, req)
  return NextResponse.json(emp)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.edit')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, ...raw } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const allowed = ['name', 'nameEn', 'nationalId', 'phone', 'email', 'position', 'department', 'basicSalary', 'allowances', 'status']
  const data: any = {}
  for (const k of allowed) if (k in raw) data[k] = raw[k]
  const emp = await db.employee.update({ where: { id }, data })
  await logAudit(auth, 'تعديل موظف', 'الموارد البشرية', `${emp.code} - ${emp.name}`, req)
  return NextResponse.json(emp)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.delete')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const emp = await db.employee.findUnique({ where: { id } })
  await db.employee.delete({ where: { id } })
  await logAudit(auth, 'حذف موظف', 'الموارد البشرية', `${emp?.code} - ${emp?.name}`, req)
  return NextResponse.json({ success: true })
}
