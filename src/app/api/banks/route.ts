import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const banks = await db.bankAccount.findMany({ orderBy: { code: 'asc' } })
  return NextResponse.json(banks)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'treasury.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  if (!body.bankName || !body.code) return NextResponse.json({ error: 'اسم البنك والرمز مطلوبان' }, { status: 400 })

  const existing = await db.bankAccount.findUnique({ where: { code: body.code } })
  if (existing) return NextResponse.json({ error: 'الرمز مستخدم' }, { status: 400 })

  const bank = await db.bankAccount.create({
    data: {
      code: body.code, bankName: body.bankName,
      accountNo: body.accountNo || '', iban: body.iban || null,
      branchId: body.branchId || null, balance: body.balance || 0,
      currency: body.currency || 'EGP', isActive: true,
    }
  })
  await logAudit(auth, 'إضافة حساب بنكي', 'البنوك', `${bank.code} - ${bank.bankName}`, req)
  return NextResponse.json(bank)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'treasury.edit')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const bank = await db.bankAccount.update({ where: { id }, data: {
    bankName: data.bankName, accountNo: data.accountNo, iban: data.iban, isActive: data.isActive,
  }})
  return NextResponse.json(bank)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'treasury.edit')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.bankAccount.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
