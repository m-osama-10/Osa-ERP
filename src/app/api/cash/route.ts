import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const cash = await db.cash.findMany({ orderBy: { code: 'asc' } })
  return NextResponse.json(cash)
}
