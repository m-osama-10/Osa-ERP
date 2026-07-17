import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const branches = await db.branch.findMany({ orderBy: { code: 'asc' } })

  // Gather stats per branch
  const [employees, cashBoxes, bankAccounts, invoices, purchases, items] = await Promise.all([
    db.employee.groupBy({ by: ['branchId'], _count: true }),
    db.cash.findMany({ select: { branchId: true, balance: true } }),
    db.bankAccount.findMany({ select: { branchId: true, balance: true } }),
    db.invoice.findMany({ where: { type: { not: 'RETURN' } }, select: { branchId: true, total: true, date: true } }),
    db.purchase.findMany({ where: { status: { not: 'RETURN' } }, select: { total: true, date: true } }),
    db.item.findMany({ select: { costPrice: true, qtyOnHand: true } }),
  ])

  const empMap = new Map(employees.filter(e => e.branchId).map(e => [e.branchId, e._count]))
  const cashMap = new Map<string, { count: number; total: number }>()
  for (const c of cashBoxes) {
    if (!c.branchId) continue
    const cur = cashMap.get(c.branchId) || { count: 0, total: 0 }
    cur.count++; cur.total += c.balance
    cashMap.set(c.branchId, cur)
  }
  const bankMap = new Map<string, { count: number; total: number }>()
  for (const b of bankAccounts) {
    if (!b.branchId) continue
    const cur = bankMap.get(b.branchId) || { count: 0, total: 0 }
    cur.count++; cur.total += b.balance
    bankMap.set(b.branchId, cur)
  }

  // Total inventory value (same for all branches since no per-branch stock)
  const inventoryValue = items.reduce((s, i) => s + i.costPrice * i.qtyOnHand, 0)

  // Total sales & purchases
  const totalSales = invoices.reduce((s, i) => s + i.total, 0)
  const totalPurchases = purchases.reduce((s, p) => s + p.total, 0)
  const totalExpenses = 0 // Would come from expense accounts in journal entries

  const result = branches.map(b => {
    const cashStats = cashMap.get(b.id) || { count: 0, total: 0 }
    const bankStats = bankMap.get(b.id) || { count: 0, total: 0 }
    const empCount = empMap.get(b.id) || 0
    return {
      ...b,
      _count: { employees: empCount },
      stats: {
        employees: empCount,
        cashCount: cashStats.count,
        cashTotal: cashStats.total,
        bankCount: bankStats.count,
        bankTotal: bankStats.total,
        inventoryValue,
        totalSales,
        totalPurchases,
        totalExpenses,
        profit: totalSales - totalPurchases - totalExpenses,
      }
    }
  })

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'branches.manage')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  if (!body.name || !body.code) return NextResponse.json({ error: 'الاسم والرمز مطلوبان' }, { status: 400 })

  const existing = await db.branch.findFirst({ where: { code: body.code } })
  if (existing) return NextResponse.json({ error: 'الرمز مستخدم' }, { status: 400 })

  const branch = await db.branch.create({
    data: {
      companyId: body.companyId || (await db.company.findFirst())?.id || '',
      name: body.name, code: body.code,
      address: body.address, phone: body.phone,
      isActive: body.isActive ?? true,
    }
  })
  await logAudit(auth, 'إضافة فرع', 'الفروع', `${branch.code} - ${branch.name}`, req)
  return NextResponse.json(branch)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'branches.manage')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const branch = await db.branch.update({ where: { id }, data: {
    name: data.name, address: data.address, phone: data.phone, isActive: data.isActive
  }})
  await logAudit(auth, 'تعديل فرع', 'الفروع', branch.code, req)
  return NextResponse.json(branch)
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'branches.manage')
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.branch.delete({ where: { id } })
  await logAudit(auth, 'حذف فرع', 'الفروع', id, req)
  return NextResponse.json({ success: true })
}
