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
  const items = await db.deputation.findMany({
    where,
    include: { employee: true },
    orderBy: { startDate: 'desc' },
    take: 200,
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const item = await db.deputation.create({
    data: {
      employeeId: body.employeeId,
      destination: body.destination,
      purpose: body.purpose,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      allowance: parseFloat(body.allowance) || 0,
      status: body.status || 'PENDING',
      notes: body.notes,
    }
  })
  await logAudit(auth, 'إضافة مأمورية', 'الموارد البشرية', `Employee: ${body.employeeId}`, req)
  return NextResponse.json(item)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.edit')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, ...data } = body
  const item = await db.deputation.update({ where: { id }, data })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.delete')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.deputation.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
