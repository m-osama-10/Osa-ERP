import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  const users = await db.user.findMany({
    select: { id: true, email: true, name: true, role: true, branchId: true, permissions: true, twoFA: true, isActive: true, lastLogin: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(users.map(u => ({ ...u, permissions: JSON.parse(u.permissions || '[]') })))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const existing = await db.user.findUnique({ where: { email: body.email } })
  if (existing) return NextResponse.json({ error: 'البريد مستخدم بالفعل' }, { status: 400 })

  const hashed = await bcrypt.hash(body.password, 10)
  const user = await db.user.create({
    data: {
      email: body.email,
      name: body.name,
      password: hashed,
      role: body.role || 'USER',
      branchId: body.branchId || null,
      permissions: JSON.stringify(body.permissions || []),
      twoFA: body.twoFA || false,
      isActive: body.isActive ?? true,
    }
  })
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, password, ...data } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const updateData: any = {
    name: data.name,
    role: data.role,
    branchId: data.branchId || null,
    permissions: JSON.stringify(data.permissions || []),
    twoFA: data.twoFA ?? false,
    isActive: data.isActive ?? true,
  }

  if (password && password.length > 0) {
    updateData.password = await bcrypt.hash(password, 10)
  }

  const user = await db.user.update({ where: { id }, data: updateData })
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
