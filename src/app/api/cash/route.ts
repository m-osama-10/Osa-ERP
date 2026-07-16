import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

// GET cash boxes
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const cash = await db.cash.findMany({ orderBy: { code: 'asc' } })
  return NextResponse.json(cash)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'treasury.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  if (!body.name || !body.code) return NextResponse.json({ error: 'الاسم والرمز مطلوبان' }, { status: 400 })

  const existing = await db.cash.findUnique({ where: { code: body.code } })
  if (existing) return NextResponse.json({ error: 'الرمز مستخدم' }, { status: 400 })

  const cash = await db.cash.create({
    data: {
      code: body.code, name: body.name, branchId: body.branchId || null,
      balance: body.balance || 0, currency: body.currency || 'EGP',
      isActive: true,
    }
  })
  await logAudit(auth, 'إضافة خزينة', 'الخزائن', `${cash.code} - ${cash.name}`, req)
  return NextResponse.json(cash)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'treasury.edit')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const cash = await db.cash.update({ where: { id }, data: {
    name: data.name, isActive: data.isActive,
  }})
  return NextResponse.json(cash)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'treasury.edit')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.cash.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
