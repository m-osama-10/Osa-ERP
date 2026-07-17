import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  const where: any = {}
  if (month) where.month = parseInt(month)
  if (year) where.year = parseInt(year)

  const payroll = await db.payroll.findMany({
    where,
    include: { employee: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })
  return NextResponse.json(payroll)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { month, year, employeeIds } = body

  // Generate payroll for selected employees (or all active)
  const employees = employeeIds?.length
    ? await db.employee.findMany({ where: { id: { in: employeeIds }, archived: false } })
    : await db.employee.findMany({ where: { archived: false, status: 'ACTIVE' } })

  const results: any[] = []
  for (const emp of employees) {
    // Check if payroll already exists
    const existing = await db.payroll.findUnique({
      where: { employeeId_month_year: { employeeId: emp.id, month: parseInt(month), year: parseInt(year) } }
    })
    if (existing) {
      results.push(existing)
      continue
    }

    // Get approved advances for this period (deduct from salary)
    const advances = await db.advance.findMany({
      where: { employeeId: emp.id, status: 'APPROVED' }
    })
    const advancesPaid = advances.reduce((s, a) => s + (a.amount / Math.max(a.installments, 1)), 0)

    // Get overtime hours
    const overtimeRecords = await db.attendance.findMany({
      where: {
        employeeId: emp.id,
        date: { gte: new Date(parseInt(year), parseInt(month) - 1, 1), lt: new Date(parseInt(year), parseInt(month), 1) }
      }
    })
    const totalOvertime = overtimeRecords.reduce((s, a) => s + (a.overtime || 0), 0)
    const overtimePay = totalOvertime * (emp.basicSalary / 30 / 8 * 1.5) // 1.5x hourly rate

    const gross = emp.basicSalary + emp.allowances + emp.incentives + overtimePay
    const netSalary = gross - emp.deductions - advancesPaid

    const payroll = await db.payroll.create({
      data: {
        employeeId: emp.id,
        month: parseInt(month),
        year: parseInt(year),
        basicSalary: emp.basicSalary,
        allowances: emp.allowances,
        incentives: emp.incentives,
        deductions: emp.deductions,
        advancesPaid,
        overtimePay,
        netSalary,
        status: 'PENDING',
      }
    })
    results.push(payroll)
  }

  await logAudit(auth, 'إنشاء رواتب', 'الموارد البشرية', `Month: ${month}/${year}, Count: ${results.length}`, req)
  return NextResponse.json(results)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.edit')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, action } = body

  if (action === 'pay') {
    const payroll = await db.payroll.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date() }
    })
    await logAudit(auth, 'صرف راتب', 'الموارد البشرية', `Payroll: ${id}`, req)
    return NextResponse.json(payroll)
  }

  const { id: _id, ...data } = body
  const payroll = await db.payroll.update({ where: { id }, data })
  return NextResponse.json(payroll)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.delete')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.payroll.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
