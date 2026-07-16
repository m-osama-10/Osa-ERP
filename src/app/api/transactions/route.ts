import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const transactions = await db.transaction.findMany({ orderBy: { date: 'desc' }, take: 100 })
  return NextResponse.json(transactions)
}
