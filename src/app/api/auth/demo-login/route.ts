import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSessionCookie, SESSION_COOKIE_NAME, logAudit } from '@/lib/auth'

// POST /api/auth/demo-login
// Authenticates the demo account without exposing credentials to the client.
// The demo email/password are read from environment variables on the server.
export async function POST() {
  const demoEmail = process.env.DEMO_EMAIL || 'demo@osaerp.com'

  const user = await db.user.findUnique({ where: { email: demoEmail } })

  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'حساب التجربة غير متاح حالياً' }, { status: 401 })
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

  await logAudit({ userId: user.id, role: user.role, user: sessionData as any }, 'دخول تجريبي', 'النظام', `Demo login: ${user.email}`)

  return res
}
