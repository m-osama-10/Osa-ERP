import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSessionCookie, SESSION_COOKIE_NAME, logAudit } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })

  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
  }

  await db.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })

  const permissions = JSON.parse(user.permissions || '[]')
  const sessionData = {
    id: user.id, name: user.name, email: user.email, role: user.role,
    permissions, twoFA: user.twoFA,
  }

  const res = NextResponse.json(sessionData)
  res.cookies.set(SESSION_COOKIE_NAME, createSessionCookie(user.id, user.role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  // Log after successful login (session not yet available in helper, so log directly)
  await logAudit({ userId: user.id, role: user.role, user: sessionData as any }, 'تسجيل دخول', 'النظام', `Login success for ${user.email}`, req)

  return res
}
