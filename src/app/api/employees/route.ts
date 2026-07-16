import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const includeArchived = searchParams.get('archived') === '1'

  const where: any = {}
  if (!includeArchived) where.archived = false

  const employees = await db.employee.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { attendances: true, leaves: true, advances: true } } }
  })
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
      incentives: body.incentives || 0,
      deductions: body.deductions || 0,
      bankAccount: body.bankAccount,
      photo: body.photo,
      files: body.files ? JSON.stringify(body.files) : '[]',
      status: 'ACTIVE',
    }
  })

  // Add hire history entry
  await db.employeeHistory.create({
    data: {
      employeeId: emp.id,
      type: 'HIRE',
      title: 'تعيين الموظف',
      description: `تم تعيين ${emp.name} في وظيفة ${emp.position || ''}`,
    }
  })

  await logAudit(auth, 'إضافة موظف', 'الموارد البشرية', `${emp.code} - ${emp.name}`, req)
  return NextResponse.json(emp)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.edit')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, archived, action, ...raw } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  // Archive action
  if (action === 'archive') {
    const emp = await db.employee.update({ where: { id }, data: { archived: true, status: 'ARCHIVED' } })
    await db.employeeHistory.create({
      data: { employeeId: id, type: 'RESIGN', title: 'أرشفة الموظف', description: `أرشفة ${emp.name}` }
    })
    await logAudit(auth, 'أرشفة موظف', 'الموارد البشرية', emp.code, req)
    return NextResponse.json(emp)
  }
  if (action === 'unarchive') {
    const emp = await db.employee.update({ where: { id }, data: { archived: false, status: 'ACTIVE' } })
    return NextResponse.json(emp)
  }

  // Track salary changes for history
  const oldEmp = await db.employee.findUnique({ where: { id } })
  const allowed = ['name', 'nameEn', 'nationalId', 'phone', 'email', 'position', 'department', 'basicSalary', 'allowances', 'incentives', 'deductions', 'bankAccount', 'photo', 'files', 'status']
  const data: any = {}
  for (const k of allowed) {
    if (k in raw) {
      data[k] = k === 'files' ? JSON.stringify(raw[k]) : raw[k]
    }
  }

  // If salary changed, add history entry
  if (oldEmp && (data.basicSalary !== undefined || data.allowances !== undefined || data.incentives !== undefined)) {
    await db.employeeHistory.create({
      data: {
        employeeId: id,
        type: 'SALARY_CHANGE',
        title: 'تعديل الراتب',
        description: `تغيير من ${oldEmp.basicSalary + oldEmp.allowances} إلى ${(data.basicSalary ?? oldEmp.basicSalary) + (data.allowances ?? oldEmp.allowances)}`,
      }
    })
  }

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
