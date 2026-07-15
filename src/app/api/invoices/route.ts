import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const invoices = await db.invoice.findMany({
    include: { customer: true, items: { include: { item: true } } },
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customerId, date, dueDate, items, discount, notes, type } = body
  const subtotal = items.reduce((s: number, it: any) => s + it.total, 0)
  const discountAmount = discount || 0
  const taxableAmount = subtotal - discountAmount
  const taxAmount = taxableAmount * 0.15
  const total = taxableAmount + taxAmount

  const count = await db.invoice.count()
  const invoice = await db.invoice.create({
    data: {
      invoiceNo: `INV-${String(1000 + count).padStart(5, '0')}`,
      customerId,
      date: new Date(date),
      dueDate: dueDate ? new Date(dueDate) : null,
      subtotal,
      discount: discountAmount,
      taxRate: 15,
      taxAmount,
      total,
      paidAmount: 0,
      status: 'UNPAID',
      type: type || 'SALES',
      notes,
      items: {
        create: items.map((it: any) => ({
          itemId: it.itemId,
          quantity: it.quantity,
          price: it.price,
          discount: it.discount || 0,
          total: it.total,
        })),
      },
    },
    include: { items: true },
  })
  return NextResponse.json(invoice)
}
