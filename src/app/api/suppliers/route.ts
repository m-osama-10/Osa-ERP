import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const suppliers = await db.supplier.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(suppliers)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const count = await db.supplier.count()
  const supplier = await db.supplier.create({
    data: {
      code: body.code || `S-${String(count + 1).padStart(3, '0')}`,
      name: body.name,
      nameEn: body.nameEn,
      phone: body.phone,
      email: body.email,
      address: body.address,
      taxNo: body.taxNo,
      creditLimit: body.creditLimit || 0,
      openingBalance: body.openingBalance || 0,
      balance: body.openingBalance || 0,
      currency: body.currency || 'SAR',
    },
  })
  return NextResponse.json(supplier)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const supplier = await db.supplier.update({ where: { id }, data })
  return NextResponse.json(supplier)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.supplier.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
