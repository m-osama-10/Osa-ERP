import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId') || null
  const count = await db.notification.count({
    where: { OR: [{ userId }, { userId: null }], isRead: false }
  })
  return NextResponse.json({ count })
}
