import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = req.cookies.get('osa-session')?.value
  if (!session) return NextResponse.json({ user: null })
  try {
    const { id } = JSON.parse(session)
    const user = await db.user.findUnique({ where: { id } })
    if (!user || !user.isActive) return NextResponse.json({ user: null })
    return NextResponse.json({
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role,
        permissions: JSON.parse(user.permissions || '[]'), twoFA: user.twoFA,
      }
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
