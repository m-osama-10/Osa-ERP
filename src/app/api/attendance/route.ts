import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30'), 1), 365)
  const employeeId = searchParams.get('employeeId')
  const since = new Date()
  since.setDate(since.getDate() - days)

  const where: any = { date: { gte: since } }
  if (employeeId) where.employeeId = employeeId

  const attendance = await db.attendance.findMany({
    where,
    include: { employee: true },
    orderBy: { date: 'desc' },
    take: 1000,
  })
  return NextResponse.json(attendance)
}

// Check-in
export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { employeeId, type } = body // type: 'check-in' | 'check-out' | 'manual'
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (type === 'check-in') {
    // Find existing record for today
    let record = await db.attendance.findFirst({
      where: { employeeId, date: { gte: today, lt: new Date(today.getTime() + 86400000) } }
    })

    // Standard check-in time: 09:00
    const standardHour = 9
    const standardMinute = 0
    const checkInTime = new Date(now)
    const lateMinutes = Math.max(0, (checkInTime.getHours() - standardHour) * 60 + (checkInTime.getMinutes() - standardMinute))

    if (record) {
      record = await db.attendance.update({
        where: { id: record.id },
        data: { checkIn: now, lateMinutes, status: lateMinutes > 15 ? 'LATE' : 'PRESENT' }
      })
    } else {
      record = await db.attendance.create({
        data: {
          employeeId,
          date: today,
          checkIn: now,
          lateMinutes,
          status: lateMinutes > 15 ? 'LATE' : 'PRESENT',
        }
      })
    }
    await logAudit(auth, 'تسجيل حضور', 'الموارد البشرية', `Employee: ${employeeId}`, req)
    return NextResponse.json(record)
  }

  if (type === 'check-out') {
    const record = await db.attendance.findFirst({
      where: { employeeId, date: { gte: today, lt: new Date(today.getTime() + 86400000) }, checkIn: { not: null } }
    })
    if (!record) {
      return NextResponse.json({ error: 'لا يوجد تسجيل حضور اليوم' }, { status: 400 })
    }
    const checkOut = now
    // Standard work hours: 8
    const workMs = checkOut.getTime() - (record.checkIn?.getTime() || 0)
    const workHours = workMs / (1000 * 60 * 60)
    const overtime = Math.max(0, workHours - 9) // overtime after 9 hours
    const updated = await db.attendance.update({
      where: { id: record.id },
      data: { checkOut, workHours: Math.round(workHours * 100) / 100, overtime: Math.round(overtime * 100) / 100 }
    })
    await logAudit(auth, 'تسجيل انصراف', 'الموارد البشرية', `Employee: ${employeeId}`, req)
    return NextResponse.json(updated)
  }

  // Manual entry
  const { date, checkIn, checkOut, status, notes } = body
  const rec = await db.attendance.create({
    data: {
      employeeId,
      date: new Date(date),
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      status: status || 'PRESENT',
      notes,
    }
  })
  await logAudit(auth, 'إضافة سجل حضور', 'الموارد البشرية', `Employee: ${employeeId}`, req)
  return NextResponse.json(rec)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.edit')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const rec = await db.attendance.update({ where: { id }, data })
  return NextResponse.json(rec)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.delete')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.attendance.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
