import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') || '30')
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
