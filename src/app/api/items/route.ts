import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const items = await db.item.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const count = await db.item.count()
  const item = await db.item.create({
    data: {
      sku: body.sku || `ITM-${String(count + 1).padStart(3, '0')}`,
      barcode: body.barcode,
      name: body.name,
      nameEn: body.nameEn,
      description: body.description,
      categoryId: body.categoryId || null,
      unit: body.unit || 'PCS',
      costPrice: body.costPrice || 0,
      salePrice: body.salePrice || 0,
      qtyOnHand: body.qtyOnHand || 0,
      reorderLevel: body.reorderLevel || 10,
      isManufactured: body.isManufactured || false,
    },
  })
  return NextResponse.json(item)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const item = await db.item.update({ where: { id }, data })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.item.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
