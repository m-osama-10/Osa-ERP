import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const entries = await db.journalEntry.findMany({
    include: { lines: { include: { account: true } } },
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'accounting.create')
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { date, description, reference, lines } = body

  if (!lines || !Array.isArray(lines) || lines.length < 2) {
    return NextResponse.json({ error: 'القيد يحتاج سطرين على الأقل' }, { status: 400 })
  }

  const totalDebit = lines.reduce((s: number, l: any) => s + (l.debit || 0), 0)
  const totalCredit = lines.reduce((s: number, l: any) => s + (l.credit || 0), 0)

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return NextResponse.json({ error: 'مدين ودائن غير متوازنين' }, { status: 400 })
  }
  if (totalDebit <= 0) {
    return NextResponse.json({ error: 'يجب أن يكون مبلغ القيد أكبر من صفر' }, { status: 400 })
  }

  // Generate unique entry number
  let entryNo = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await db.journalEntry.count()
    const candidate = `JE-${String(count + 1 + attempt).padStart(4, '0')}`
    const exists = await db.journalEntry.findUnique({ where: { entryNo: candidate } })
    if (!exists) { entryNo = candidate; break }
  }
  if (!entryNo) return NextResponse.json({ error: 'فشل توليد رقم قيد فريد' }, { status: 500 })

  try {
    const entry = await db.$transaction(async (tx) => {
      const created = await tx.journalEntry.create({
        data: {
          entryNo,
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

      // Update account balances (ASSET/EXPENSE: debit increases; LIABILITY/EQUITY/REVENUE: credit increases)
      for (const line of lines) {
        const acc = await tx.account.findUnique({ where: { id: line.accountId } })
        if (!acc) continue
        const delta = (line.debit || 0) - (line.credit || 0)
        await tx.account.update({
          where: { id: line.accountId },
          data: { balance: { increment: delta } }
        })
      }

      return created
    })

    await logAudit(auth, 'إنشاء قيد', 'المحاسبة', `${entryNo} - ${description} - ${totalDebit}`, req)
    return NextResponse.json(entry)
  } catch (e: any) {
    console.error('Journal entry failed:', e)
    return NextResponse.json({ error: 'فشل إنشاء القيد', details: e.message }, { status: 500 })
  }
}
