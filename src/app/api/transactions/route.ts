import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const transactions = await db.transaction.findMany({ orderBy: { date: 'desc' }, take: 100 })
  return NextResponse.json(transactions)
}
