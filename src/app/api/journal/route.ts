import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const entries = await db.journalEntry.findMany({
    include: { lines: { include: { account: true } } },
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { date, description, reference, lines } = body
  const totalDebit = lines.reduce((s: number, l: any) => s + (l.debit || 0), 0)
  const totalCredit = lines.reduce((s: number, l: any) => s + (l.credit || 0), 0)

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return NextResponse.json({ error: 'مدين ودائن غير متوازنين' }, { status: 400 })
  }

  const count = await db.journalEntry.count()
  const entry = await db.journalEntry.create({
    data: {
      entryNo: `JE-${String(count + 1).padStart(4, '0')}`,
      date: new Date(date),
      description,
      reference,
      totalDebit,
      totalCredit,
      status: 'POSTED',
      lines: {
        create: lines.map((l: any) => ({
          accountId: l.accountId,
          debit: l.debit || 0,
          credit: l.credit || 0,
          description: l.description,
        })),
      },
    },
    include: { lines: { include: { account: true } } },
  })
  return NextResponse.json(entry)
}
