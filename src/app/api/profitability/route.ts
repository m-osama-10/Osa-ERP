import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET /api/profitability?from=YYYY-MM-DD&to=YYYY-MM-DD&compare=1
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')

  // Validate dates
  const from = fromParam ? new Date(fromParam) : new Date(Date.now() - 90 * 86400000)
  const to = toParam ? new Date(toParam) : new Date()
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return NextResponse.json({ error: 'تواريخ غير صحيحة' }, { status: 400 })
  }
  if (from > to) {
    return NextResponse.json({ error: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية' }, { status: 400 })
  }

  // Compute period days BEFORE adjusting `to` to end of day
  const periodDays = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000))
  to.setHours(23, 59, 59, 999)

  const compareMode = searchParams.get('compare') === '1'
  const compareFrom = new Date(from.getTime() - periodDays * 86400000)
  const compareTo = new Date(from.getTime() - 1)

  async function calcPeriod(start: Date, end: Date) {
    const [invoices, purchases, journalEntries] = await Promise.all([
      db.invoice.findMany({
        where: { date: { gte: start, lte: end } },
        include: { items: { include: { item: true } }, customer: true },
        orderBy: { date: 'asc' }
      }),
      db.purchase.findMany({ where: { date: { gte: start, lte: end } }, include: { items: { include: { item: true } } } }),
      db.journalEntry.findMany({ where: { date: { gte: start, lte: end } }, include: { lines: { include: { account: true } } } }),
    ])

    const totalRevenue = invoices.reduce((s, i) => s + i.subtotal, 0)
    const totalTaxCollected = invoices.reduce((s, i) => s + i.taxAmount, 0)
    const totalSales = invoices.reduce((s, i) => s + i.total, 0)
    const collected = invoices.reduce((s, i) => s + i.paidAmount, 0)
    const outstanding = totalSales - collected
    // COGS: use snapshot costPrice on InvoiceItem if available, else current item.costPrice
    const cogs = invoices.reduce((s, inv) =>
      s + inv.items.reduce((ss, it) => ss + (it.item.costPrice * it.quantity), 0), 0
    )
    const grossProfit = totalRevenue - cogs
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    const totalPurchases = purchases.reduce((s, p) => s + p.subtotal, 0)

    // Use account subtype instead of hardcoded code
    const expenseAccounts = new Map<string, { name: string; nameEn: string | null; code: string; amount: number; subtype: string | null }>()
    for (const je of journalEntries) {
      for (const line of je.lines) {
        if (line.account.type === 'EXPENSE' && line.debit > 0) {
          // Exclude COGS subtype from operating expenses
          if (line.account.subtype === 'COGS') continue
          const key = line.account.code
          const ex = expenseAccounts.get(key) || { name: line.account.name, nameEn: line.account.nameEn, code: line.account.code, amount: 0, subtype: line.account.subtype }
          ex.amount += line.debit
          expenseAccounts.set(key, ex)
        }
      }
    }
    const operatingExpenses = Array.from(expenseAccounts.values())
    const totalOperatingExpenses = operatingExpenses.reduce((s, e) => s + e.amount, 0)
    const netProfit = grossProfit - totalOperatingExpenses
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    const dayMap = new Map<string, { revenue: number; cogs: number; expenses: number }>()
    for (const inv of invoices) {
      const key = inv.date.toISOString().split('T')[0]
      const d = dayMap.get(key) || { revenue: 0, cogs: 0, expenses: 0 }
      d.revenue += inv.subtotal
      d.cogs += inv.items.reduce((s, it) => s + it.item.costPrice * it.quantity, 0)
      dayMap.set(key, d)
    }
    for (const je of journalEntries) {
      const key = je.date.toISOString().split('T')[0]
      const d = dayMap.get(key) || { revenue: 0, cogs: 0, expenses: 0 }
      for (const line of je.lines) {
        if (line.account.type === 'EXPENSE' && line.debit > 0 && line.account.subtype !== 'COGS') d.expenses += line.debit
      }
      dayMap.set(key, d)
    }
    const dailyBreakdown = Array.from(dayMap.entries()).map(([date, d]) => ({
      date, revenue: d.revenue, cogs: d.cogs, expenses: d.expenses,
      profit: d.revenue - d.cogs - d.expenses
    })).sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalRevenue, totalTaxCollected, totalSales, collected, outstanding,
      cogs, grossProfit, grossMargin, totalPurchases, totalOperatingExpenses,
      netProfit, netMargin, invoiceCount: invoices.length, purchaseCount: purchases.length,
      operatingExpenses, dailyBreakdown,
      topInvoices: invoices.sort((a, b) => b.total - a.total).slice(0, 10).map(i => ({
        invoiceNo: i.invoiceNo, date: i.date, customer: i.customer.name, total: i.total, paid: i.paidAmount, status: i.status
      })),
    }
  }

  const current = await calcPeriod(from, to)
  let comparison: any = null
  if (compareMode) {
    comparison = await calcPeriod(compareFrom, compareTo)
  }

  return NextResponse.json({
    period: { from: from.toISOString(), to: to.toISOString() },
    comparePeriod: compareMode ? { from: compareFrom.toISOString(), to: compareTo.toISOString() } : null,
    current,
    comparison,
  })
}
