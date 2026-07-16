import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const [currencies, rates] = await Promise.all([
    db.currency.findMany({ orderBy: { code: 'asc' } }),
    db.exchangeRate.findMany({ orderBy: { date: 'desc' }, take: 50 }),
  ])
  return NextResponse.json({ currencies, rates })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (body.type === 'rate') {
    const rate = await db.exchangeRate.create({
      data: { fromCode: body.fromCode, toCode: body.toCode, rate: parseFloat(body.rate) }
    })
    // Create reverse automatically
    const exists = await db.exchangeRate.findFirst({ where: { fromCode: body.toCode, toCode: body.fromCode } })
    if (!exists) {
      await db.exchangeRate.create({
        data: { fromCode: body.toCode, toCode: body.fromCode, rate: 1 / parseFloat(body.rate) }
      })
    }
    return NextResponse.json(rate)
  }
  const currency = await db.currency.create({
    data: { code: body.code, name: body.name, nameEn: body.nameEn, symbol: body.symbol, isBase: body.isBase || false }
  })
  return NextResponse.json(currency)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  if (body.type === 'rate' && body.id) {
    const rate = await db.exchangeRate.update({
      where: { id: body.id },
      data: { rate: parseFloat(body.rate), isActive: body.isActive ?? true }
    })
    return NextResponse.json(rate)
  }
  return NextResponse.json({ error: 'Invalid' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const type = searchParams.get('type')
  if (type === 'rate' && id) {
    await db.exchangeRate.delete({ where: { id } })
    return NextResponse.json({ success: true })
  }
  if (id) {
    await db.currency.delete({ where: { id } })
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: 'ID required' }, { status: 400 })
}
