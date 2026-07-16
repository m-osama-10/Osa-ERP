'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, DollarSign, Users, Package, UserCog, Wallet, AlertTriangle } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

type DashboardData = {
  kpis: {
    totalSales: number
    totalPurchases: number
    totalInvoices: number
    totalCustomers: number
    totalSuppliers: number
    totalItems: number
    totalEmployees: number
    totalAssets: number
    totalLiabilities: number
    totalEquity: number
    netProfit: number
  }
  monthlySales: { month: string; sales: number; purchases: number }[]
  topCustomers: { name: string; nameEn: string; balance: number }[]
  lowStockItems: { name: string; nameEn: string; sku: string; qty: number }[]
  invoiceStatus: { PAID: number; UNPAID: number; PARTIAL: number }
  financialSummary: { totalAssets: number; totalLiabilities: number; totalEquity: number; totalRevenue: number; totalExpenses: number }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(n)
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('ar-EG').format(n)
}

function KpiCard({ title, value, icon: Icon, trend, color, langLabel }: {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  trend?: number
  color: string
  langLabel: string
}) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full opacity-10" style={{ background: color }} />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {trend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={trend >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
              <span className="text-muted-foreground">{langLabel}</span>
            </div>
          )}
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: `${color}20`, color }}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  )
}

export function Dashboard() {
  const { lang, user } = useApp()
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  const pieData = [
    { name: lang === 'ar' ? 'مدفوعة' : 'Paid', value: data.invoiceStatus.PAID, color: '#10b981' },
    { name: lang === 'ar' ? 'غير مدفوعة' : 'Unpaid', value: data.invoiceStatus.UNPAID, color: '#ef4444' },
    { name: lang === 'ar' ? 'جزئية' : 'Partial', value: data.invoiceStatus.PARTIAL, color: '#f59e0b' },
  ]

  return (
    <div className="space-y-6 animate-in-fade">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/70 p-6 text-primary-foreground shadow-xl">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -left-8 -bottom-12 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-sm opacity-90">
            {t(lang, 'welcome')} Osa ERP 👋
          </p>
          <h2 className="mt-1 text-3xl font-extrabold">
            {lang === 'ar' ? 'نظرة عامة على الأعمال' : 'Business Overview'}
          </h2>
          <p className="mt-1 text-sm opacity-90">
            {lang === 'ar'
              ? `مرحباً ${user?.name || 'مستخدم'}، إليك ملخص أداء شركتك اليوم`
              : `Welcome ${user?.name || 'User'}, here is your company performance today`}
          </p>
        </div>
      </div>

      {/* KPIs — trends computed from real monthlySales data */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={t(lang, 'totalSales')}
          value={formatCurrency(data.kpis.totalSales)}
          icon={DollarSign}
          trend={data.monthlySales && data.monthlySales.length >= 2 ? Math.round(((data.monthlySales[data.monthlySales.length - 1].sales - data.monthlySales[data.monthlySales.length - 2].sales) / Math.max(data.monthlySales[data.monthlySales.length - 2].sales, 1)) * 100) : undefined}
          color="#0d9488"
          langLabel={lang === 'ar' ? 'آخر شهر' : 'last month'}
        />
        <KpiCard
          title={t(lang, 'totalPurchases')}
          value={formatCurrency(data.kpis.totalPurchases)}
          icon={Wallet}
          color="#f59e0b"
          langLabel={lang === 'ar' ? 'إجمالي' : 'total'}
        />
        <KpiCard
          title={t(lang, 'netProfit')}
          value={formatCurrency(data.kpis.netProfit)}
          icon={TrendingUp}
          color="#3b82f6"
          langLabel={lang === 'ar' ? 'إيرادات - مصروفات' : 'rev - exp'}
        />
        <KpiCard
          title={t(lang, 'totalCustomers')}
          value={formatNumber(data.kpis.totalCustomers)}
          icon={Users}
          color="#a855f7"
          langLabel={lang === 'ar' ? 'نشط' : 'active'}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title={t(lang, 'totalAssets')} value={formatCurrency(data.kpis.totalAssets)} icon={Wallet} color="#10b981" langLabel="" />
        <KpiCard title={t(lang, 'totalLiabilities')} value={formatCurrency(data.kpis.totalLiabilities)} icon={AlertTriangle} color="#ef4444" langLabel="" />
        <KpiCard title={t(lang, 'inventory')} value={formatNumber(data.kpis.totalItems)} icon={Package} color="#06b6d4" langLabel="" />
        <KpiCard title={t(lang, 'totalEmployees')} value={formatNumber(data.kpis.totalEmployees)} icon={UserCog} color="#8b5cf6" langLabel="" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">{t(lang, 'monthlySales')}</h3>
              <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'آخر 6 أشهر' : 'Last 6 months'}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthlySales}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Area type="monotone" dataKey="sales" stroke="#0d9488" strokeWidth={2} fill="url(#colorSales)" name={t(lang, 'totalSales')} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold">{lang === 'ar' ? 'حالة الفواتير' : 'Invoice Status'}</h3>
            <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'توزيع الفواتير حسب الحالة' : 'Distribution by status'}</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
              <Legend verticalAlign="bottom" iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Customers + Low Stock */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">{t(lang, 'topCustomers')}</h3>
          </div>
          <div className="space-y-3">
            {data.topCustomers.map((c, i) => {
              const maxBalance = data.topCustomers[0]?.balance || 1
              const pct = (c.balance / maxBalance) * 100
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary ml-2">
                        {i + 1}
                      </span>
                      {lang === 'ar' ? c.name : c.nameEn}
                    </span>
                    <span className="font-semibold text-primary">{formatCurrency(c.balance)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">{t(lang, 'lowStock')}</h3>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {data.lowStockItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {lang === 'ar' ? 'لا توجد أصناف منخفضة المخزون' : 'No low stock items'}
              </p>
            ) : (
              data.lowStockItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{lang === 'ar' ? item.name : item.nameEn}</p>
                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-lg font-bold text-amber-600">{item.qty}</p>
                    <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'متبقي' : 'left'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
