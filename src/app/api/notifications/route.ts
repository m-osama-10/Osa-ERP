import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId') || null
  const onlyUnread = searchParams.get('unread') === '1'

  const where: any = {
    OR: [{ userId }, { userId: null }],
  }
  if (onlyUnread) where.isRead = false

  const notifications = await db.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Auto-generate alerts (low stock + overdue invoices)
  const lowStockItems = await db.item.findMany({ where: { qtyOnHand: { lt: 10 } }, take: 10 })
  for (const item of lowStockItems) {
    const exists = await db.notification.findFirst({
      where: { refType: 'ITEM', refId: item.id, createdAt: { gte: new Date(Date.now() - 86400000) } }
    })
    if (!exists) {
      await db.notification.create({
        data: {
          type: 'WARNING',
          title: 'تنبيه: مخزون منخفض',
          message: `الصنف "${item.name}" وصل إلى ${item.qtyOnHand} وحدة (حد إعادة الطلب: ${item.reorderLevel})`,
          module: 'inventory',
          refType: 'ITEM',
          refId: item.id,
        }
      })
    }
  }

  const overdueInvoices = await db.invoice.findMany({
    where: {
      status: { in: ['UNPAID', 'PARTIAL'] },
      dueDate: { lt: new Date() }
    },
    include: { customer: true },
    take: 10,
  })
  for (const inv of overdueInvoices) {
    const exists = await db.notification.findFirst({
      where: { refType: 'INVOICE', refId: inv.id, createdAt: { gte: new Date(Date.now() - 86400000) } }
    })
    if (!exists) {
      await db.notification.create({
        data: {
          type: 'ERROR',
          title: 'فاتورة متأخرة السداد',
          message: `الفاتورة ${inv.invoiceNo} للعميل ${inv.customer.name} تجاوزت تاريخ الاستحقاق`,
          module: 'sales',
          refType: 'INVOICE',
          refId: inv.id,
        }
      })
    }
  }

  // Re-fetch with auto-generated
  const final = await db.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 })
  return NextResponse.json(final)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const notif = await db.notification.create({
    data: {
      userId: body.userId || null,
      type: body.type || 'INFO',
      title: body.title,
      message: body.message,
      module: body.module,
      refType: body.refType,
      refId: body.refId,
    }
  })
  return NextResponse.json(notif)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  if (body.markAllRead) {
    await db.notification.updateMany({ where: { isRead: false }, data: { isRead: true } })
    return NextResponse.json({ success: true })
  }
  if (body.id) {
    const notif = await db.notification.update({ where: { id: body.id }, data: { isRead: true } })
    return NextResponse.json(notif)
  }
  return NextResponse.json({ error: 'Invalid' }, { status: 400 })
}
