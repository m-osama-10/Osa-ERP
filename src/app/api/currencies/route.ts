import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const [currencies, rates] = await Promise.all([
    db.currency.findMany({ orderBy: { code: 'asc' } }),
    db.exchangeRate.findMany({ orderBy: { date: 'desc' }, take: 50 }),
  ])
  return NextResponse.json({ currencies, rates })
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'currencies.manage')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()

  if (body.type === 'rate') {
    const rate = parseFloat(body.rate)
    if (!rate || rate <= 0) {
      return NextResponse.json({ error: 'سعر الصرف يجب أن يكون أكبر من صفر' }, { status: 400 })
    }
    const created = await db.exchangeRate.create({
      data: { fromCode: body.fromCode, toCode: body.toCode, rate }
    })
    // Always update or create reverse rate
    const reverseExists = await db.exchangeRate.findFirst({ where: { fromCode: body.toCode, toCode: body.fromCode } })
    if (reverseExists) {
      await db.exchangeRate.update({ where: { id: reverseExists.id }, data: { rate: 1 / rate } })
    } else {
      await db.exchangeRate.create({ data: { fromCode: body.toCode, toCode: body.fromCode, rate: 1 / rate } })
    }
    await logAudit(auth, 'إضافة سعر صرف', 'العملات', `${body.fromCode}→${body.toCode}: ${rate}`, req)
    return NextResponse.json(created)
  }

  // Currency creation
  if (!body.code || !body.name || !body.symbol) {
    return NextResponse.json({ error: 'الرمز والاسم والـ symbol مطلوبة' }, { status: 400 })
  }
  const currency = await db.currency.create({
    data: {
      code: body.code.toUpperCase(),
      name: body.name,
      nameEn: body.nameEn,
      symbol: body.symbol,
      isBase: body.isBase || false,
    }
  })
  await logAudit(auth, 'إضافة عملة', 'العملات', `${currency.code} - ${currency.name}`, req)
  return NextResponse.json(currency)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'currencies.manage')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  if (body.type === 'rate' && body.id) {
    const rate = parseFloat(body.rate)
    if (!rate || rate <= 0) {
      return NextResponse.json({ error: 'سعر الصرف يجب أن يكون أكبر من صفر' }, { status: 400 })
    }
    const updated = await db.exchangeRate.update({
      where: { id: body.id },
      data: { rate, isActive: body.isActive ?? true }
    })
    // Update reverse too
    const reverse = await db.exchangeRate.findFirst({ where: { fromCode: updated.toCode, toCode: updated.fromCode } })
    if (reverse) {
      await db.exchangeRate.update({ where: { id: reverse.id }, data: { rate: 1 / rate } })
    }
    return NextResponse.json(updated)
  }
  return NextResponse.json({ error: 'Invalid' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'currencies.manage')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const type = searchParams.get('type')
  if (type === 'rate' && id) {
    await db.exchangeRate.delete({ where: { id } })
    return NextResponse.json({ success: true })
  }
  if (id) {
    // Don't allow deleting base currency
    const cur = await db.currency.findUnique({ where: { id } })
    if (cur?.isBase) return NextResponse.json({ error: 'لا يمكن حذف العملة الأساسية' }, { status: 400 })
    await db.currency.delete({ where: { id } })
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: 'ID required' }, { status: 400 })
}
