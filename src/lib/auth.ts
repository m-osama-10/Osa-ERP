import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

const SESSION_SECRET = process.env.NEXTAUTH_SECRET || 'osa-erp-dev-secret-change-in-production-please'

const SESSION_COOKIE = 'osa-session'

// Sign payload with HMAC
function sign(payload: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
}

export function createSessionCookie(userId: string, role: string): string {
  const payload = JSON.stringify({ id: userId, role, ts: Date.now() })
  const signature = sign(payload)
  // payload + "." + signature (base64 for safety)
  const encoded = Buffer.from(payload).toString('base64url')
  return `${encoded}.${signature}`
}

export function verifySessionCookie(cookieValue: string | undefined): { id: string; role: string; ts: number } | null {
  if (!cookieValue) return null
  try {
    const [encoded, signature] = cookieValue.split('.')
    if (!encoded || !signature) return null
    const payload = Buffer.from(encoded, 'base64url').toString()
    const expected = sign(payload)
    // Constant-time comparison
    if (signature.length !== expected.length) return null
    const buf1 = Buffer.from(signature)
    const buf2 = Buffer.from(expected)
    if (!crypto.timingSafeEqual(buf1, buf2)) return null
    const data = JSON.parse(payload)
    // Expire after 7 days
    if (Date.now() - data.ts > 7 * 24 * 60 * 60 * 1000) return null
    return { id: data.id, role: data.role, ts: data.ts }
  } catch {
    return null
  }
}

export type AuthSession = {
  userId: string
  role: string
  user: {
    id: string
    name: string
    email: string
    role: string
    permissions: string[]
    isActive: boolean
  }
}

// Get session from request — verifies cookie signature AND fetches fresh user from DB
export async function getSession(req: NextRequest): Promise<AuthSession | null> {
  const cookieValue = req.cookies.get(SESSION_COOKIE)?.value
  const parsed = verifySessionCookie(cookieValue)
  if (!parsed) return null

  const user = await db.user.findUnique({ where: { id: parsed.id } })
  if (!user || !user.isActive) return null

  return {
    userId: user.id,
    role: user.role,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: JSON.parse(user.permissions || '[]'),
      isActive: user.isActive,
    },
  }
}

// Require auth — returns session or 401 response
export async function requireAuth(req: NextRequest): Promise<AuthSession | NextResponse> {
  const session = await getSession(req)
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح — يجب تسجيل الدخول', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  return session
}

// Check permission on session
export function hasPermission(session: AuthSession, perm: string): boolean {
  if (session.role === 'ADMIN') return true
  return session.user.permissions.includes(perm)
}

// Require permission — returns session or 403
export async function requirePermission(req: NextRequest, perm: string): Promise<AuthSession | NextResponse> {
  const result = await requireAuth(req)
  if (result instanceof NextResponse) return result
  if (!hasPermission(result, perm)) {
    return NextResponse.json({ error: 'لا تملك صلاحية لهذا الإجراء', code: 'FORBIDDEN' }, { status: 403 })
  }
  return result
}

// Log audit entry
export async function logAudit(session: AuthSession, action: string, module: string, details?: string, req?: NextRequest) {
  try {
    await db.auditLog.create({
      data: {
        userId: session.userId,
        action,
        module,
        details,
        ipAddress: req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req?.headers.get('x-real-ip') || 'unknown',
      }
    })
  } catch (e) {
    console.error('Failed to log audit:', e)
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
