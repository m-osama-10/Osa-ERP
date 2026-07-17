import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId')
  const status = searchParams.get('status')

  const where: any = {}
  if (employeeId) where.employeeId = employeeId
  if (status) where.status = status

  const leaves = await db.leave.findMany({
    where,
    include: { employee: true },
    orderBy: { requestedAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(leaves)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { employeeId, startDate, endDate, type, reason } = body

  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1

  const leave = await db.leave.create({
    data: {
      employeeId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days,
      type,
      reason,
      status: 'PENDING',
    }
  })
  await logAudit(auth, 'طلب إجازة', 'الموارد البشرية', `Employee: ${employeeId}, Days: ${days}`, req)
  return NextResponse.json(leave)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.edit')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, action } = body // action: 'approve' | 'reject'

  // Get the leave request first
  const existingLeave = await db.leave.findUnique({
    where: { id },
    include: { employee: true }
  })
  if (!existingLeave) {
    return NextResponse.json({ error: 'طلب الإجازة غير موجود' }, { status: 404 })
  }
  if (existingLeave.status !== 'PENDING') {
    return NextResponse.json({ error: 'تم معالجة هذا الطلب بالفعل' }, { status: 400 })
  }

  // If approving, check leave balance
  if (action === 'approve') {
    // Calculate annual leave balance used
    const approvedLeaves = await db.leave.findMany({
      where: {
        employeeId: existingLeave.employeeId,
        type: existingLeave.type,
        status: 'APPROVED',
      }
    })
    const usedDays = approvedLeaves.reduce((s, l) => s + l.days, 0)
    const annualBalance = 21 // Default: 21 days annual leave
    const remaining = annualBalance - usedDays

    if (existingLeave.type !== 'UNPAID' && remaining < existingLeave.days) {
      return NextResponse.json({
        error: `رصيد الإجازة غير كافٍ. المتبقي: ${remaining} يوم، المطلوب: ${existingLeave.days} يوم`
      }, { status: 400 })
    }
  }

  const leave = await db.leave.update({
    where: { id },
    data: {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
      approvedBy: auth.userId,
      approvedAt: new Date(),
    },
    include: { employee: true }
  })

  // If approved, mark attendance as LEAVE for the period
  if (action === 'approve') {
    const start = new Date(leave.startDate)
    const end = new Date(leave.endDate)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      await db.attendance.upsert({
        where: { id: `${leave.employeeId}_${d.toISOString().split('T')[0]}` },
        update: { status: 'LEAVE', notes: `إجازة ${leave.type}` },
        create: {
          id: `${leave.employeeId}_${d.toISOString().split('T')[0]}`,
          employeeId: leave.employeeId,
          date: new Date(d),
          status: 'LEAVE',
          notes: `إجازة ${leave.type}`,
        }
      }).catch(() => {}) // skip if id format issue
    }
  }

  await logAudit(auth, action === 'approve' ? 'موافقة على إجازة' : 'رفض إجازة', 'الموارد البشرية', `Leave: ${id}`, req)
  return NextResponse.json(leave)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.delete')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.leave.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
