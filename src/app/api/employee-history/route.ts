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
  const items = await db.employeeHistory.findMany({
    where,
    include: { employee: true },
    orderBy: { date: 'desc' },
    take: 200,
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const item = await db.employeeHistory.create({
    data: {
      employeeId: body.employeeId,
      type: body.type,
      title: body.title,
      description: body.description,
      amount: body.amount ? parseFloat(body.amount) : null,
      date: body.date ? new Date(body.date) : new Date(),
    }
  })
  await logAudit(auth, 'إضافة سجل موظف', 'الموارد البشرية', `${body.type}: ${body.title}`, req)
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.delete')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.employeeHistory.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
