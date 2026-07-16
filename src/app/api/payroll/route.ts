import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const payroll = await db.payroll.findMany({ include: { employee: true }, orderBy: [{ year: 'desc' }, { month: 'desc' }] })
  return NextResponse.json(payroll)
}
