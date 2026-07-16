import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const purchases = await db.purchase.findMany({
    include: { supplier: true, items: { include: { item: true } } },
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(purchases)
}
