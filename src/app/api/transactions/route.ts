import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const transactions = await db.transaction.findMany({ orderBy: { date: 'desc' }, take: 100 })
  return NextResponse.json(transactions)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'treasury.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { type, cashId, bankId, toCashId, toBankId, amount, description, refType, refId } = body

  if (!type || !amount || amount <= 0) {
    return NextResponse.json({ error: 'النوع والمبلغ مطلوبان' }, { status: 400 })
  }
  if (!cashId && !bankId) {
    return NextResponse.json({ error: 'يجب تحديد المصدر' }, { status: 400 })
  }
  if (type === 'TRANSFER' && !toCashId && !toBankId) {
    return NextResponse.json({ error: 'يجب تحديد الوجهة للتحويل' }, { status: 400 })
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          type, cashId: cashId || null, bankId: bankId || null,
          toCashId: toCashId || null, toBankId: toBankId || null,
          amount: parseFloat(amount), description, refType, refId,
        }
      })

      // Update balances based on type
      if (type === 'RECEIPT') {
        // Cash-in: increase source balance
        if (cashId) await tx.cash.update({ where: { id: cashId }, data: { balance: { increment: parseFloat(amount) } } })
        if (bankId) await tx.bankAccount.update({ where: { id: bankId }, data: { balance: { increment: parseFloat(amount) } } })
      } else if (type === 'PAYMENT') {
        // Cash-out: decrease source balance
        if (cashId) await tx.cash.update({ where: { id: cashId }, data: { balance: { decrement: parseFloat(amount) } } })
        if (bankId) await tx.bankAccount.update({ where: { id: bankId }, data: { balance: { decrement: parseFloat(amount) } } })
      } else if (type === 'TRANSFER') {
        // Transfer: decrease source, increase destination
        if (cashId) await tx.cash.update({ where: { id: cashId }, data: { balance: { decrement: parseFloat(amount) } } })
        if (bankId) await tx.bankAccount.update({ where: { id: bankId }, data: { balance: { decrement: parseFloat(amount) } } })
        if (toCashId) await tx.cash.update({ where: { id: toCashId }, data: { balance: { increment: parseFloat(amount) } } })
        if (toBankId) await tx.bankAccount.update({ where: { id: toBankId }, data: { balance: { increment: parseFloat(amount) } } })
      }

      return transaction
    })

    await logAudit(auth, 'إنشاء حركة مالية', 'الخزائن', `${type}: ${amount}`, req)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: 'فشل العملية', details: e.message }, { status: 500 })
  }
}
