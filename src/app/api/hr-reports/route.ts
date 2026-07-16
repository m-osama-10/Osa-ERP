import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET /api/hr-reports?type=daily|monthly|yearly|absence|late|overtime|leaves&from=&to=
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'monthly'
  const fromStr = searchParams.get('from')
  const toStr = searchParams.get('to')

  const now = new Date()
  const from = fromStr ? new Date(fromStr) : new Date(now.getFullYear(), now.getMonth(), 1)
  const to = toStr ? new Date(toStr) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  to.setHours(23, 59, 59, 999)

  const [attendance, employees, leaves] = await Promise.all([
    db.attendance.findMany({
      where: { date: { gte: from, lte: to } },
      include: { employee: true },
      orderBy: { date: 'asc' }
    }),
    db.employee.findMany({ where: { archived: false } }),
    db.leave.findMany({
      where: {
        OR: [
          { startDate: { gte: from, lte: to } },
          { endDate: { gte: from, lte: to } }
        ]
      },
      include: { employee: true }
    }),
  ])

  // KPIs
  const totalDays = Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1
  const totalEmployees = employees.length
  const presentCount = attendance.filter(a => a.status === 'PRESENT').length
  const lateCount = attendance.filter(a => a.status === 'LATE').length
  const absentCount = attendance.filter(a => a.status === 'ABSENT').length
  const leaveCount = attendance.filter(a => a.status === 'LEAVE').length
  const totalOvertimeHours = attendance.reduce((s, a) => s + (a.overtime || 0), 0)
  const totalLateMinutes = attendance.reduce((s, a) => s + (a.lateMinutes || 0), 0)
  const pendingLeaves = leaves.filter(l => l.status === 'PENDING').length

  // Daily breakdown
  const dayMap = new Map<string, any>()
  for (const a of attendance) {
    const key = a.date.toISOString().split('T')[0]
    const d = dayMap.get(key) || { date: key, present: 0, late: 0, absent: 0, leave: 0, overtime: 0 }
    if (a.status === 'PRESENT') d.present++
    if (a.status === 'LATE') d.late++
    if (a.status === 'ABSENT') d.absent++
    if (a.status === 'LEAVE') d.leave++
    d.overtime += a.overtime || 0
    dayMap.set(key, d)
  }
  const dailyBreakdown = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date))

  // Per employee summary
  const empMap = new Map<string, any>()
  for (const a of attendance) {
    const key = a.employeeId
    const e = empMap.get(key) || {
      employeeId: key,
      name: a.employee.name,
      code: a.employee.code,
      department: a.employee.department,
      present: 0, late: 0, absent: 0, leave: 0,
      overtimeHours: 0, lateMinutes: 0, workHours: 0,
    }
    if (a.status === 'PRESENT') e.present++
    if (a.status === 'LATE') e.late++
    if (a.status === 'ABSENT') e.absent++
    if (a.status === 'LEAVE') e.leave++
    e.overtimeHours += a.overtime || 0
    e.lateMinutes += a.lateMinutes || 0
    e.workHours += a.workHours || 0
    empMap.set(key, e)
  }
  const employeeSummary = Array.from(empMap.values())

  return NextResponse.json({
    period: { from: from.toISOString(), to: to.toISOString(), type },
    kpis: {
      totalDays,
      totalEmployees,
      presentCount,
      lateCount,
      absentCount,
      leaveCount,
      totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
      totalLateMinutes,
      pendingLeaves,
    },
    dailyBreakdown,
    employeeSummary,
    leaves,
  })
}
