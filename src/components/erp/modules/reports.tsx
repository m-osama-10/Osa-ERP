'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BarChart3, TrendingUp, Users, Package, DollarSign, Award } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar } from 'recharts'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(n)
}

export function Reports() {
  const { lang } = useApp()
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [tab, setTab] = React.useState('overview')

  React.useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading || !data) return <Skeleton className="h-96" />

  const COLORS = ['#0d9488', '#f59e0b', '#3b82f6', '#a855f7', '#ef4444', '#06b6d4']

  const topCustomersData = data.topCustomers.map((c: any) => ({
    name: lang === 'ar' ? c.name : c.nameEn,
    balance: c.balance,
  }))

  const departmentData = [
    { name: lang === 'ar' ? 'الإدارة' : 'Management', count: 1, fill: '#0d9488' },
    { name: lang === 'ar' ? 'المالية' : 'Finance', count: 2, fill: '#f59e0b' },
    { name: lang === 'ar' ? 'المبيعات' : 'Sales', count: 2, fill: '#3b82f6' },
    { name: lang === 'ar' ? 'الموارد البشرية' : 'HR', count: 1, fill: '#a855f7' },
    { name: lang === 'ar' ? 'المخازن' : 'Warehouse', count: 1, fill: '#ef4444' },
    { name: lang === 'ar' ? 'التسويق' : 'Marketing', count: 1, fill: '#06b6d4' },
  ]

  const financialData = [
    { name: lang === 'ar' ? 'الأصول' : 'Assets', value: data.financialSummary.totalAssets, color: '#10b981' },
    { name: lang === 'ar' ? 'الخصوم' : 'Liabilities', value: data.financialSummary.totalLiabilities, color: '#ef4444' },
    { name: lang === 'ar' ? 'حقوق الملكية' : 'Equity', value: data.financialSummary.totalEquity, color: '#a855f7' },
  ]

  return (
    <div className="space-y-6 animate-in-fade">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-2"><BarChart3 className="h-4 w-4" /><span className="text-xs">{lang === 'ar' ? 'نظرة عامة' : 'Overview'}</span></TabsTrigger>
          <TabsTrigger value="financial" className="flex flex-col items-center gap-1 py-2"><DollarSign className="h-4 w-4" /><span className="text-xs">{lang === 'ar' ? 'مالي' : 'Financial'}</span></TabsTrigger>
          <TabsTrigger value="sales" className="flex flex-col items-center gap-1 py-2"><TrendingUp className="h-4 w-4" /><span className="text-xs">{lang === 'ar' ? 'المبيعات' : 'Sales'}</span></TabsTrigger>
          <TabsTrigger value="customers" className="flex flex-col items-center gap-1 py-2"><Users className="h-4 w-4" /><span className="text-xs">{lang === 'ar' ? 'العملاء' : 'Customers'}</span></TabsTrigger>
          <TabsTrigger value="inventory" className="flex flex-col items-center gap-1 py-2"><Package className="h-4 w-4" /><span className="text-xs">{lang === 'ar' ? 'المخزون' : 'Inventory'}</span></TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">{lang === 'ar' ? 'المبيعات الشهرية' : 'Monthly Sales'}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12 }} />
                  <Line type="monotone" dataKey="sales" stroke="#0d9488" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">{lang === 'ar' ? 'توزيع الفواتير' : 'Invoice Distribution'}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: lang === 'ar' ? 'مدفوعة' : 'Paid', value: data.invoiceStatus.PAID, color: '#10b981' },
                      { name: lang === 'ar' ? 'غير مدفوعة' : 'Unpaid', value: data.invoiceStatus.UNPAID, color: '#ef4444' },
                      { name: lang === 'ar' ? 'جزئية' : 'Partial', value: data.invoiceStatus.PARTIAL, color: '#f59e0b' },
                    ]}
                    dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label
                  >
                    {financialData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(data.financialSummary.totalRevenue)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(data.financialSummary.totalExpenses)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'صافي الربح' : 'Net Profit'}</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(data.financialSummary.totalRevenue - data.financialSummary.totalExpenses)}</p>
            </Card>
          </div>
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">{lang === 'ar' ? 'المركز المالي' : 'Financial Position'}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={financialData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12 }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {financialData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">{lang === 'ar' ? 'اتجاه المبيعات' : 'Sales Trend'}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12 }} />
                <Bar dataKey="sales" fill="#0d9488" radius={[8, 8, 0, 0]} name={lang === 'ar' ? 'المبيعات' : 'Sales'} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Award className="h-5 w-5 text-amber-500" /> {lang === 'ar' ? 'أفضل العملاء' : 'Top Customers'}</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topCustomersData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={150} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12 }} />
                <Bar dataKey="balance" fill="#a855f7" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">{lang === 'ar' ? 'الأصناف منخفضة المخزون' : 'Low Stock Items'}</h3>
            {data.lowStockItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>{lang === 'ar' ? 'لا توجد أصناف منخفضة' : 'No low stock items'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.lowStockItems.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                    <div>
                      <p className="font-medium">{lang === 'ar' ? item.name : item.nameEn}</p>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-lg font-bold text-amber-600">{item.qty}</p>
                      <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'متبقي' : 'left'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
