import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const where: any = {}
  if (status) where.status = status

  const reps = await db.representative.findMany({
    where,
    include: { _count: { select: { visits: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reps)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'representatives.manage')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  if (!body.name) return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 })

  const count = await db.representative.count()
  const code = body.code || `REP-${String(count + 1).padStart(3, '0')}`

  const existing = await db.representative.findUnique({ where: { code } })
  if (existing) return NextResponse.json({ error: 'الرمز مستخدم' }, { status: 400 })

  const rep = await db.representative.create({
    data: {
      code, name: body.name, phone: body.phone, email: body.email,
      route: body.route, branchId: body.branchId || null,
      status: 'OFFLINE', isActive: true,
    }
  })
  await logAudit(auth, 'إضافة مندوب', 'المندوبين', `${code} - ${body.name}`, req)
  return NextResponse.json(rep)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'representatives.manage')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const rep = await db.representative.update({ where: { id }, data: {
    name: data.name, phone: data.phone, email: data.email,
    route: data.route, isActive: data.isActive,
  }})
  await logAudit(auth, 'تعديل مندوب', 'المندوبين', rep.code, req)
  return NextResponse.json(rep)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'representatives.manage')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const rep = await db.representative.findUnique({ where: { id } })
  await db.representative.delete({ where: { id } })
  await logAudit(auth, 'حذف مندوب', 'المندوبين', rep?.code || id, req)
  return NextResponse.json({ success: true })
}
