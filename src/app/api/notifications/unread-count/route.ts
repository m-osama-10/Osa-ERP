import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const count = await db.notification.count({
    where: { OR: [{ userId: auth.userId }, { userId: null }], isRead: false }
  })
  return NextResponse.json({ count })
}
