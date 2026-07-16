import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(Date.now() - 90 * 86400000)
  const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : new Date()

  // Make end of day
  to.setHours(23, 59, 59, 999)

  const [invoices, purchases, journalEntries] = await Promise.all([
    db.invoice.findMany({
      where: { date: { gte: from, lte: to } },
      include: { items: { include: { item: true } }, customer: true },
      orderBy: { date: 'asc' }
    }),
    db.purchase.findMany({
      where: { date: { gte: from, lte: to } },
      include: { items: { include: { item: true } }, supplier: true },
      orderBy: { date: 'asc' }
    }),
    db.journalEntry.findMany({
      where: { date: { gte: from, lte: to } },
      include: { lines: { include: { account: true } } },
      orderBy: { date: 'asc' }
    }),
  ])

  // ============= Revenue from invoices =============
  const totalRevenue = invoices.reduce((s, i) => s + i.subtotal, 0)
  const totalTaxCollected = invoices.reduce((s, i) => s + i.taxAmount, 0)
  const totalSales = invoices.reduce((s, i) => s + i.total, 0)
  const collected = invoices.reduce((s, i) => s + i.paidAmount, 0)
  const outstanding = totalSales - collected

  // COGS: sum(costPrice * qty) for each invoice item
  const cogs = invoices.reduce((s, inv) =>
    s + inv.items.reduce((ss, it) => ss + (it.item.costPrice * it.quantity), 0), 0
  )

  const grossProfit = totalRevenue - cogs
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  // ============= Purchases =============
  const totalPurchases = purchases.reduce((s, p) => s + p.subtotal, 0)
  const totalPurchasesTax = purchases.reduce((s, p) => s + p.taxAmount, 0)

  // ============= Operating Expenses from journal (expense accounts) =============
  const expenseAccounts = new Map<string, { name: string; nameEn: string | null; code: string; amount: number }>()
  for (const je of journalEntries) {
    for (const line of je.lines) {
      if (line.account.type === 'EXPENSE' && line.debit > 0) {
        const key = line.account.code
        const existing = expenseAccounts.get(key) || { name: line.account.name, nameEn: line.account.nameEn, code: line.account.code, amount: 0 }
        existing.amount += line.debit
        expenseAccounts.set(key, existing)
      }
    }
  }
  const operatingExpenses = Array.from(expenseAccounts.values()).filter(e => e.code !== '5100') // exclude COGS duplicate
  const totalOperatingExpenses = operatingExpenses.reduce((s, e) => s + e.amount, 0)

  // ============= Net Profit =============
  const netProfit = grossProfit - totalOperatingExpenses
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  // ============= Daily breakdown for chart =============
  const days: { date: string; revenue: number; cogs: number; expenses: number; profit: number }[] = []
  const dayMap = new Map<string, { revenue: number; cogs: number; expenses: number }>()

  for (const inv of invoices) {
    const key = inv.date.toISOString().split('T')[0]
    const day = dayMap.get(key) || { revenue: 0, cogs: 0, expenses: 0 }
    day.revenue += inv.subtotal
    day.cogs += inv.items.reduce((s, it) => s + it.item.costPrice * it.quantity, 0)
    dayMap.set(key, day)
  }
  for (const je of journalEntries) {
    const key = je.date.toISOString().split('T')[0]
    const day = dayMap.get(key) || { revenue: 0, cogs: 0, expenses: 0 }
    for (const line of je.lines) {
      if (line.account.type === 'EXPENSE' && line.debit > 0 && line.account.code !== '5100') {
        day.expenses += line.debit
      }
    }
    dayMap.set(key, day)
  }
  for (const [date, d] of dayMap.entries()) {
    days.push({ date, revenue: d.revenue, cogs: d.cogs, expenses: d.expenses, profit: d.revenue - d.cogs - d.expenses })
  }
  days.sort((a, b) => a.date.localeCompare(b.date))

  return NextResponse.json({
    period: { from: from.toISOString(), to: to.toISOString() },
    summary: {
      totalRevenue, totalTaxCollected, totalSales, collected, outstanding,
      cogs, grossProfit, grossMargin,
      totalPurchases, totalPurchasesTax,
      totalOperatingExpenses,
      netProfit, netMargin,
      invoiceCount: invoices.length,
      purchaseCount: purchases.length,
    },
    operatingExpenses,
    dailyBreakdown: days,
    topInvoices: invoices.sort((a, b) => b.total - a.total).slice(0, 10).map(i => ({
      invoiceNo: i.invoiceNo, date: i.date, customer: i.customer.name, total: i.total, paid: i.paidAmount, status: i.status
    })),
  })
}
