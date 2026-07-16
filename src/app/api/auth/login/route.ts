import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const user = await db.user.findUnique({ where: { email } })

  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
  }

  await db.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })
  await db.auditLog.create({ data: { userId: user.id, action: 'تسجيل دخول', module: 'النظام', ipAddress: req.headers.get('x-forwarded-for') || 'unknown' } })

  const permissions = JSON.parse(user.permissions || '[]')
  const response = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions,
    twoFA: user.twoFA,
  }

  const res = NextResponse.json(response)
  // Simple session cookie (HTTP-only) — for production use NextAuth/JWT
  res.cookies.set('osa-session', JSON.stringify({ id: user.id, role: user.role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return res
}
