import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const banks = await db.bankAccount.findMany({ orderBy: { code: 'asc' } })
  return NextResponse.json(banks)
}
