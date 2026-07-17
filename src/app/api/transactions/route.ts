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
      const amt = parseFloat(amount)

      // Check for negative balance (prevent overdraft)
      if (type === 'PAYMENT' || type === 'TRANSFER') {
        if (cashId) {
          const cash = await tx.cash.findUnique({ where: { id: cashId } })
          if (cash && cash.balance < amt) {
            throw new Error(`رصيد الخزينة "${cash.name}" غير كافي. الرصيد الحالي: ${cash.balance}`)
          }
        }
        if (bankId) {
          const bank = await tx.bankAccount.findUnique({ where: { id: bankId } })
          if (bank && bank.balance < amt) {
            throw new Error(`رصيد البنك "${bank.bankName}" غير كافي. الرصيد الحالي: ${bank.balance}`)
          }
        }
      }

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          type, cashId: cashId || null, bankId: bankId || null,
          toCashId: toCashId || null, toBankId: toBankId || null,
          amount: amt, description, refType, refId,
        }
      })

      // Update balances based on type
      if (type === 'RECEIPT') {
        if (cashId) await tx.cash.update({ where: { id: cashId }, data: { balance: { increment: amt } } })
        if (bankId) await tx.bankAccount.update({ where: { id: bankId }, data: { balance: { increment: amt } } })
      } else if (type === 'PAYMENT') {
        if (cashId) await tx.cash.update({ where: { id: cashId }, data: { balance: { decrement: amt } } })
        if (bankId) await tx.bankAccount.update({ where: { id: bankId }, data: { balance: { decrement: amt } } })
      } else if (type === 'TRANSFER') {
        if (cashId) await tx.cash.update({ where: { id: cashId }, data: { balance: { decrement: amt } } })
        if (bankId) await tx.bankAccount.update({ where: { id: bankId }, data: { balance: { decrement: amt } } })
        if (toCashId) await tx.cash.update({ where: { id: toCashId }, data: { balance: { increment: amt } } })
        if (toBankId) await tx.bankAccount.update({ where: { id: toBankId }, data: { balance: { increment: amt } } })
      }

      // Auto-generate journal entry for accounting
      const accounts = await tx.account.findMany()
      const findAcc = (code: string) => accounts.find(a => a.code === code)
      const cashAcc = findAcc('1101') // Cash & Banks
      const jeCount = await tx.journalEntry.count()
      const jeNo = `JE-${String(jeCount + 1).padStart(4, '0')}`

      if (type === 'RECEIPT' && cashAcc) {
        await tx.journalEntry.create({
          data: {
            entryNo: jeNo, date: new Date(), description: description || 'إيصال قبض',
            totalDebit: amt, totalCredit: amt, status: 'POSTED',
            lines: { create: [
              { accountId: cashAcc.id, debit: amt, credit: 0, description: 'قبض نقدي' },
              { accountId: cashAcc.id, debit: 0, credit: amt, description: 'مقابل' },
            ]}
          }
        })
        await tx.account.update({ where: { id: cashAcc.id }, data: { balance: { increment: amt } } })
      } else if (type === 'PAYMENT' && cashAcc) {
        await tx.journalEntry.create({
          data: {
            entryNo: jeNo, date: new Date(), description: description || 'إيصال صرف',
            totalDebit: amt, totalCredit: amt, status: 'POSTED',
            lines: { create: [
              { accountId: cashAcc.id, debit: amt, credit: 0, description: 'مقابل' },
              { accountId: cashAcc.id, debit: 0, credit: amt, description: 'صرف نقدي' },
            ]}
          }
        })
        await tx.account.update({ where: { id: cashAcc.id }, data: { balance: { decrement: amt } } })
      }

      return transaction
    })

    await logAudit(auth, 'إنشاء حركة مالية', 'الخزائن', `${type}: ${amount}`, req)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'فشل العملية' }, { status: 500 })
  }
}
