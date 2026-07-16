'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, Calendar, Download, FileSpreadsheet, DollarSign, Wallet, Percent, ArrowRightLeft } from 'lucide-react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { exportPDF, exportExcel } from '@/components/erp/export-utils'
import { toast } from 'sonner'

type ProfitData = {
  period: { from: string; to: string }
  comparePeriod: { from: string; to: string } | null
  current: any
  comparison: any
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(n) + ' ج.م'
}
function formatDate(s: string) { return new Date(s).toLocaleDateString('ar-EG') }
function pct(n: number) { return n.toFixed(2) + '%' }

export function Profitability() {
  const { lang } = useApp()
  const [data, setData] = React.useState<ProfitData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [preset, setPreset] = React.useState('month')
  const [from, setFrom] = React.useState(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
  const [to, setTo] = React.useState(new Date().toISOString().split('T')[0])
  const [compare, setCompare] = React.useState(true)

  const load = () => {
    setLoading(true)
    fetch(`/api/profitability?from=${from}&to=${to}&compare=${compare ? 1 : 0}`)
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }
  React.useEffect(load, [])

  const applyPreset = (p: string) => {
    setPreset(p)
    const now = new Date()
    let f = new Date()
    if (p === 'today') f = new Date(now)
    else if (p === 'week') f = new Date(Date.now() - 7 * 86400000)
    else if (p === 'month') f = new Date(Date.now() - 30 * 86400000)
    else if (p === 'quarter') f = new Date(Date.now() - 90 * 86400000)
    else if (p === 'year') f = new Date(Date.now() - 365 * 86400000)
    setFrom(f.toISOString().split('T')[0])
    setTo(now.toISOString().split('T')[0])
  }

  if (loading || !data) return <Skeleton className="h-96" />

  const c = data.current
  const cp = data.comparison

  // Comparison deltas
  const delta = (a: number, b: number) => b > 0 ? ((a - b) / b) * 100 : 0
  const revDelta = cp ? delta(c.totalRevenue, cp.totalRevenue) : 0
  const profitDelta = cp ? delta(c.netProfit, cp.netProfit) : 0
  const expDelta = cp ? delta(c.totalOperatingExpenses, cp.totalOperatingExpenses) : 0

  const handlePDF = async () => {
    const rows = c.operatingExpenses.map((e: any) => [e.code, e.name, formatMoney(e.amount)])
    rows.push(['', lang === 'ar' ? 'إجمالي المصروفات' : 'Total OpEx', formatMoney(c.totalOperatingExpenses)])
    rows.push(['', lang === 'ar' ? 'صافي الربح' : 'Net Profit', formatMoney(c.netProfit)])
    await exportPDF({
      title: 'Profit & Loss Report',
      subtitle: `${formatDate(data.period.from)} → ${formatDate(data.period.to)}`,
      columns: ['Code', 'Account', 'Amount'],
      rows,
      summary: [
        { label: 'Revenue', value: formatMoney(c.totalRevenue) },
        { label: 'COGS', value: formatMoney(c.cogs) },
        { label: 'Gross Profit', value: formatMoney(c.grossProfit) },
        { label: 'Net Profit', value: formatMoney(c.netProfit) },
      ],
      filename: `pnl-${from}-to-${to}.pdf`,
    })
    toast.success(lang === 'ar' ? 'تم تصدير PDF' : 'PDF exported')
  }

  const handleExcel = () => {
    exportExcel({
      filename: `pnl-${from}-to-${to}.xlsx`,
      sheets: [{
        name: 'P&L',
        columns: ['Code', 'Account', 'Amount'],
        rows: c.operatingExpenses.map((e: any) => [e.code, e.name, e.amount]),
      }, {
        name: 'Daily',
        columns: ['Date', 'Revenue', 'COGS', 'Expenses', 'Profit'],
        rows: c.dailyBreakdown.map((d: any) => [d.date, d.revenue, d.cogs, d.expenses, d.profit]),
      }, {
        name: 'Summary',
        columns: ['Metric', 'Current', 'Comparison'],
        rows: [
          ['Total Revenue', c.totalRevenue, cp?.totalRevenue || 0],
          ['COGS', c.cogs, cp?.cogs || 0],
          ['Gross Profit', c.grossProfit, cp?.grossProfit || 0],
          ['Operating Expenses', c.totalOperatingExpenses, cp?.totalOperatingExpenses || 0],
          ['Net Profit', c.netProfit, cp?.netProfit || 0],
          ['Gross Margin %', c.grossMargin, cp?.grossMargin || 0],
          ['Net Margin %', c.netMargin, cp?.netMargin || 0],
        ],
      }],
    })
  }

  return (
    <div className="space-y-6 animate-in-fade">
      {/* Filters */}
      <Card className="p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
            <div>
              <Label>{lang === 'ar' ? 'الفترة' : 'Preset'}</Label>
              <Select value={preset} onValueChange={applyPreset}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">{lang === 'ar' ? 'اليوم' : 'Today'}</SelectItem>
                  <SelectItem value="week">{lang === 'ar' ? 'أسبوع' : 'Week'}</SelectItem>
                  <SelectItem value="month">{lang === 'ar' ? 'شهر' : 'Month'}</SelectItem>
                  <SelectItem value="quarter">{lang === 'ar' ? 'ربع سنة' : 'Quarter'}</SelectItem>
                  <SelectItem value="year">{lang === 'ar' ? 'سنة' : 'Year'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>{t(lang, 'from')}</Label><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
            <div><Label>{t(lang, 'to')}</Label><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="checkbox" checked={compare} onChange={e => setCompare(e.target.checked)} className="rounded" />
                {lang === 'ar' ? 'مقارنة فترة سابقة' : 'Compare'}
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={load}><Calendar className="h-4 w-4 ml-1" />{lang === 'ar' ? 'تحليل' : 'Analyze'}</Button>
            <Button variant="outline" onClick={handlePDF}><Download className="h-4 w-4 ml-1" />PDF</Button>
            <Button variant="outline" onClick={handleExcel}><FileSpreadsheet className="h-4 w-4 ml-1" />Excel</Button>
          </div>
        </div>
        {cp && (
          <div className="mt-3 rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground">
            {lang === 'ar' ? 'الفترة الحالية' : 'Current'}: {formatDate(data.period.from)} → {formatDate(data.period.to)}
            <span className="mx-2">•</span>
            {lang === 'ar' ? 'المقارنة' : 'Comparison'}: {formatDate(data.comparePeriod!.from)} → {formatDate(data.comparePeriod!.to)}
          </div>
        )}
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title={t(lang, 'revenue')}
          value={formatMoney(c.totalRevenue)}
          delta={cp ? revDelta : undefined}
          icon={DollarSign}
          color="#0d9488"
          langLabel={lang === 'ar' ? 'مقارنة بالفترة السابقة' : 'vs previous'}
        />
        <SummaryCard
          title={t(lang, 'cogs')}
          value={formatMoney(c.cogs)}
          delta={cp ? -delta(c.cogs, cp.cogs) : undefined}
          icon={Wallet}
          color="#f59e0b"
          langLabel={lang === 'ar' ? 'مقارنة بالفترة السابقة' : 'vs previous'}
        />
        <SummaryCard
          title={t(lang, 'grossProfit')}
          value={formatMoney(c.grossProfit)}
          delta={cp ? delta(c.grossProfit, cp.grossProfit) : undefined}
          icon={TrendingUp}
          color="#3b82f6"
          langLabel={`${t(lang, 'grossMargin')}: ${pct(c.grossMargin)}`}
        />
        <SummaryCard
          title={t(lang, 'netProfit')}
          value={formatMoney(c.netProfit)}
          delta={cp ? profitDelta : undefined}
          icon={c.netProfit >= 0 ? TrendingUp : TrendingDown}
          color={c.netProfit >= 0 ? '#10b981' : '#ef4444'}
          langLabel={`${t(lang, 'netMargin')}: ${pct(c.netMargin)}`}
        />
      </div>

      {/* Comparison Table */}
      {cp && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ArrowRightLeft className="h-5 w-5 text-primary" />{lang === 'ar' ? 'مقارنة بين الفترتين' : 'Period Comparison'}</h3>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-start">{lang === 'ar' ? 'البند' : 'Item'}</th>
                  <th className="px-4 py-3 text-end">{lang === 'ar' ? 'الفترة الحالية' : 'Current'}</th>
                  <th className="px-4 py-3 text-end">{lang === 'ar' ? 'فترة المقارنة' : 'Comparison'}</th>
                  <th className="px-4 py-3 text-end">{lang === 'ar' ? 'الفرق' : 'Change'}</th>
                  <th className="px-4 py-3 text-end">{lang === 'ar' ? '٪' : '%'}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: t(lang, 'revenue'), cur: c.totalRevenue, prev: cp.totalRevenue },
                  { label: t(lang, 'cogs'), cur: c.cogs, prev: cp.cogs },
                  { label: t(lang, 'grossProfit'), cur: c.grossProfit, prev: cp.grossProfit },
                  { label: t(lang, 'expenses'), cur: c.totalOperatingExpenses, prev: cp.totalOperatingExpenses },
                  { label: t(lang, 'netProfit'), cur: c.netProfit, prev: cp.netProfit },
                  { label: t(lang, 'totalPurchases'), cur: c.totalPurchases, prev: cp.totalPurchases },
                ].map(r => {
                  const diff = r.cur - r.prev
                  const pctChange = r.prev > 0 ? (diff / r.prev) * 100 : 0
                  return (
                    <tr key={r.label} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{r.label}</td>
                      <td className="px-4 py-3 text-end font-semibold">{formatMoney(r.cur)}</td>
                      <td className="px-4 py-3 text-end text-muted-foreground">{formatMoney(r.prev)}</td>
                      <td className={`px-4 py-3 text-end font-medium ${diff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{diff >= 0 ? '+' : ''}{formatMoney(diff)}</td>
                      <td className="px-4 py-3 text-end">
                        <Badge variant={pctChange >= 0 ? 'default' : 'destructive'} className={pctChange >= 0 ? 'bg-emerald-500' : ''}>
                          {pctChange >= 0 ? '↑' : '↓'} {Math.abs(pctChange).toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">{lang === 'ar' ? 'الإيرادات والمصروفات والربح' : 'Revenue, Expenses & Profit'}</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={c.dailyBreakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ borderRadius: 12, fontSize: 12 }}
              formatter={(v: number) => formatMoney(v)}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#0d9488" name={t(lang, 'revenue')} radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="#f59e0b" name={t(lang, 'expenses')} radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} name={t(lang, 'profit')} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Operating Expenses Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">{lang === 'ar' ? 'تفصيل المصروفات التشغيلية' : 'Operating Expenses Breakdown'}</h3>
        <div className="space-y-2">
          {c.operatingExpenses.map((e: any) => {
            const pctOfTotal = c.totalOperatingExpenses > 0 ? (e.amount / c.totalOperatingExpenses) * 100 : 0
            return (
              <div key={e.code} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span><span className="font-mono text-xs text-muted-foreground ml-2">{e.code}</span> {e.name}</span>
                  <span className="font-semibold">{formatMoney(e.amount)} <span className="text-xs text-muted-foreground">({pctOfTotal.toFixed(1)}%)</span></span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: `${pctOfTotal}%` }} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/10 p-3 font-bold">
          <span>{lang === 'ar' ? 'إجمالي المصروفات التشغيلية' : 'Total Operating Expenses'}</span>
          <span>{formatMoney(c.totalOperatingExpenses)}</span>
        </div>
      </Card>
    </div>
  )
}

function SummaryCard({ title, value, delta, icon: Icon, color, langLabel }: {
  title: string; value: string; delta?: number; icon: any; color: string; langLabel: string
}) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full opacity-10" style={{ background: color }} />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {delta !== undefined && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {delta >= 0 ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
              <span className={delta >= 0 ? 'text-emerald-600' : 'text-red-600'}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}%</span>
              <span className="text-muted-foreground">{langLabel}</span>
            </div>
          )}
          {delta === undefined && <p className="mt-2 text-xs text-muted-foreground">{langLabel}</p>}
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: `${color}20`, color }}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  )
}
