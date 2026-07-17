import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  try {
    const [
      totalSalesAgg,
      totalPurchasesAgg,
      totalCustomers,
      totalSuppliers,
      totalItems,
      totalEmployees,
      invoices,
      customers,
      items,
      accounts,
      journalEntries,
    ] = await Promise.all([
      db.invoice.aggregate({ _sum: { total: true }, _count: true }),
      db.purchase.aggregate({ _sum: { total: true }, _count: true }),
      db.customer.count(),
      db.supplier.count(),
      db.item.count(),
      db.employee.count(),
      db.invoice.findMany({ select: { date: true, total: true, status: true, type: true }, orderBy: { date: 'desc' }, take: 100 }),
      db.customer.findMany({ select: { name: true, nameEn: true, balance: true }, orderBy: { balance: 'desc' }, take: 5 }),
      db.item.findMany({ select: { name: true, nameEn: true, sku: true, qtyOnHand: true, salePrice: true, reorderLevel: true, costPrice: true }, take: 100 }),
      db.account.findMany({ include: { parent: true } }),
      db.journalEntry.findMany({ include: { lines: { include: { account: true } } }, orderBy: { date: 'desc' }, take: 50 }),
    ])

    // Monthly sales (last 6 months) — real data from invoices
    const now = new Date()
    const monthlySales: { month: string; sales: number; purchases: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const monthName = d.toLocaleDateString('ar-EG', { month: 'short' })
      const sales = invoices.filter(inv => inv.date >= d && inv.date <= monthEnd && inv.type !== 'RETURN' && inv.type !== 'QUOTE').reduce((s, inv) => s + inv.total, 0)
      const purchases = totalPurchasesAgg ? (await db.purchase.findMany({
        where: { date: { gte: d, lte: monthEnd }, status: { not: 'RETURN' } },
        select: { total: true }
      })).reduce((s, p) => s + p.total, 0) : 0
      monthlySales.push({ month: monthName, sales, purchases })
    }

    // Top customers — real balances
    const topCustomers = customers
      .filter(c => c.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5)
      .map(c => ({ name: c.name, nameEn: c.nameEn, balance: c.balance }))

    // Low stock items — using reorderLevel from each item
    const lowStockItems = items.filter(i => i.qtyOnHand < i.reorderLevel).map(i => ({ name: i.name, nameEn: i.nameEn, sku: i.sku, qty: i.qtyOnHand, reorderLevel: i.reorderLevel }))

    // Invoice status distribution
    const statusCount = { PAID: 0, UNPAID: 0, PARTIAL: 0 }
    invoices.forEach(inv => {
      if (inv.status in statusCount) (statusCount as any)[inv.status]++
    })

    // Financial summary from journal
    const totalDebits = journalEntries.reduce((s, je) => s + je.totalDebit, 0)
    const totalCredits = journalEntries.reduce((s, je) => s + je.totalCredit, 0)

    // Trial balance
    const trialBalance = accounts
      .filter(a => !a.parentId || a.balance > 0)
      .map(a => ({
        code: a.code,
        name: a.name,
        nameEn: a.nameEn,
        type: a.type,
        debit: ['ASSET', 'EXPENSE'].includes(a.type) ? a.balance : 0,
        credit: ['LIABILITY', 'EQUITY', 'REVENUE'].includes(a.type) ? a.balance : 0,
      }))

    const totalAssets = accounts.filter(a => a.type === 'ASSET').reduce((s, a) => s + a.balance, 0)
    const totalLiabilities = accounts.filter(a => a.type === 'LIABILITY').reduce((s, a) => s + a.balance, 0)
    const totalEquity = accounts.filter(a => a.type === 'EQUITY').reduce((s, a) => s + a.balance, 0)
    const totalRevenue = accounts.filter(a => a.type === 'REVENUE').reduce((s, a) => s + a.balance, 0)
    const totalExpenses = accounts.filter(a => a.type === 'EXPENSE').reduce((s, a) => s + a.balance, 0)

    return NextResponse.json({
      kpis: {
        totalSales: totalSalesAgg._sum.total || 0,
        totalPurchases: totalPurchasesAgg._sum.total || 0,
        totalInvoices: totalSalesAgg._count,
        totalCustomers,
        totalSuppliers,
        totalItems,
        totalEmployees,
        totalAssets,
        totalLiabilities,
        totalEquity,
        netProfit: totalRevenue - totalExpenses,
      },
      monthlySales,
      topCustomers,
      lowStockItems,
      invoiceStatus: statusCount,
      trialBalance: { totalDebits, totalCredits },
      financialSummary: { totalAssets, totalLiabilities, totalEquity, totalRevenue, totalExpenses },
      recentInvoices: invoices.slice(0, 5),
    })
  } catch (e: any) {
    console.error('Dashboard error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
