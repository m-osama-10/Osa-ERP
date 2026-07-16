import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const userId = auth.userId // ALWAYS from session, never from query param
  const onlyUnread = new URL(req.url).searchParams.get('unread') === '1'

  const where: any = {
    OR: [{ userId }, { userId: null }],
  }
  if (onlyUnread) where.isRead = false

  // Auto-generate alerts (rate-limited: 1 per refId per day)
  try {
    const lowStockItems = await db.item.findMany({ where: { qtyOnHand: { lt: db.item.fields.reorderLevel } }, take: 10 })
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
      where: { status: { in: ['UNPAID', 'PARTIAL'] }, dueDate: { lt: new Date() } },
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
  } catch (e) {
    console.error('Auto-notification generation failed:', e)
  }

  const final = await db.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 })
  // Always return an array — never an object — so clients can safely call .slice()
  return NextResponse.json(Array.isArray(final) ? final : [])
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
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
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  if (body.markAllRead) {
    // Only mark the current user's notifications
    await db.notification.updateMany({
      where: { OR: [{ userId: auth.userId }, { userId: null }], isRead: false },
      data: { isRead: true }
    })
    return NextResponse.json({ success: true })
  }
  if (body.id) {
    // Verify ownership before marking read
    const notif = await db.notification.findUnique({ where: { id: body.id } })
    if (!notif) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (notif.userId && notif.userId !== auth.userId && auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const updated = await db.notification.update({ where: { id: body.id }, data: { isRead: true } })
    return NextResponse.json(updated)
  }
  return NextResponse.json({ error: 'Invalid' }, { status: 400 })
}
