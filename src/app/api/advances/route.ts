import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employeeId')
  const where: any = {}
  if (employeeId) where.employeeId = employeeId
  const advances = await db.advance.findMany({
    where,
    include: { employee: true },
    orderBy: { date: 'desc' },
    take: 200,
  })
  return NextResponse.json(advances)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { employeeId, amount, type, installments, status, notes } = body
  const adv = await db.advance.create({
    data: {
      employeeId,
      amount: parseFloat(amount) || 0,
      type: type || 'ADVANCE',
      installments: parseInt(installments) || 1,
      status: status || 'PENDING',
      notes,
    }
  })
  await logAudit(auth, 'إضافة سلفة', 'الموارد البشرية', `Employee: ${employeeId}, Amount: ${amount}`, req)
  return NextResponse.json(adv)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.edit')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, action, ...data } = body

  if (action === 'approve') {
    const adv = await db.advance.update({ where: { id }, data: { status: 'APPROVED' } })
    await logAudit(auth, 'موافقة على سلفة', 'الموارد البشرية', `Advance: ${id}`, req)
    return NextResponse.json(adv)
  }
  if (action === 'reject') {
    const adv = await db.advance.update({ where: { id }, data: { status: 'REJECTED' } })
    return NextResponse.json(adv)
  }
  const adv = await db.advance.update({ where: { id }, data })
  return NextResponse.json(adv)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.delete')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.advance.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
