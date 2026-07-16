import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const payroll = await db.payroll.findMany({ include: { employee: true }, orderBy: [{ year: 'desc' }, { month: 'desc' }] })
  return NextResponse.json(payroll)
}
