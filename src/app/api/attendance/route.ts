import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30'), 1), 365)
  const since = new Date()
  since.setDate(since.getDate() - days)
  const attendance = await db.attendance.findMany({
    where: { date: { gte: since } },
    include: { employee: true },
    orderBy: { date: 'desc' },
    take: 500,
  })
  return NextResponse.json(attendance)
}
