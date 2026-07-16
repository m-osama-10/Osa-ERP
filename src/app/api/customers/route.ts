import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const customers = await db.customer.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(customers)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const count = await db.customer.count()
  const customer = await db.customer.create({
    data: {
      code: body.code || `C-${String(count + 1).padStart(3, '0')}`,
      name: body.name,
      nameEn: body.nameEn,
      type: body.type || 'INDIVIDUAL',
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
  return NextResponse.json(customer)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const customer = await db.customer.update({ where: { id }, data })
  return NextResponse.json(customer)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.customer.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
