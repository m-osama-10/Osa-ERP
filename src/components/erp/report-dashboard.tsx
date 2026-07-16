'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FilterBar, FilterValues, defaultFilters, getDateRange, FilterConfig } from '@/components/erp/filter-bar'
import { exportPDF, exportExcel } from '@/components/erp/export-utils'
import { Download, FileSpreadsheet, TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { toast } from 'sonner'

export type KpiCard = {
  title: string
  value: string
  icon: LucideIcon
  color: string
  trend?: number
  subtitle?: string
}

export type ChartCard = {
  title: string
  type: 'bar' | 'line' | 'pie' | 'area'
  data: any[]
  xKey: string
  yKeys: { key: string; name: string; color: string }[]
  height?: number
}

export function ReportDashboard({
  title,
  filterConfig,
  branches = [],
  users = [],
  onFilterChange,
  kpis = [],
  charts = [],
  tableColumns,
  tableRows,
  exportFilename,
  emptyMessage,
  children,
}: {
  title: string
  filterConfig: FilterConfig
  branches?: { id: string; name: string }[]
  users?: { id: string; name: string }[]
  onFilterChange?: (filters: FilterValues) => void
  kpis?: KpiCard[]
  charts?: ChartCard[]
  tableColumns?: string[]
  tableRows?: (string | number)[][]
  exportFilename?: string
  emptyMessage?: string
  children?: React.ReactNode
}) {
  const { lang } = useApp()
  const [filters, setFilters] = React.useState<FilterValues>(defaultFilters)

  const handleFilterChange = (v: FilterValues) => {
    setFilters(v)
    onFilterChange?.(v)
  }

  const handlePDF = async () => {
    if (!tableColumns || !tableRows) return
    await exportPDF({
      title,
      subtitle: `${filters.datePreset !== 'all' ? `Period: ${filters.datePreset}` : 'All time'}`,
      columns: tableColumns,
      rows: tableRows,
      summary: kpis.slice(0, 4).map(k => ({ label: k.title, value: k.value })),
      filename: `${exportFilename || 'report'}.pdf`,
    })
    toast.success(lang === 'ar' ? 'تم تصدير PDF' : 'PDF exported')
  }

  const handleExcel = () => {
    if (!tableColumns || !tableRows) return
    exportExcel({
      filename: `${exportFilename || 'report'}.xlsx`,
      sheets: [
        { name: 'Data', columns: tableColumns, rows: tableRows },
        ...(kpis.length ? [{
          name: 'KPIs',
          columns: ['Metric', 'Value'],
          rows: kpis.map(k => [k.title, k.value]),
        }] : []),
      ],
    })
    toast.success(lang === 'ar' ? 'تم تصدير Excel' : 'Excel exported')
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filter bar */}
      <FilterBar config={filterConfig} values={filters} onChange={handleFilterChange} branches={branches} users={users} />

      {/* KPIs */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon
            return (
              <Card key={i} className="relative overflow-hidden p-4 card-lift animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="absolute -top-3 -left-3 h-16 w-16 rounded-full opacity-10" style={{ background: kpi.color }} />
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground truncate">{kpi.title}</p>
                    <p className="text-xl md:text-2xl font-extrabold mt-1 truncate">{kpi.value}</p>
                    {kpi.subtitle && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{kpi.subtitle}</p>}
                    {kpi.trend !== undefined && (
                      <div className="flex items-center gap-1 mt-1 text-[10px]">
                        {kpi.trend >= 0 ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                        <span className={kpi.trend >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {kpi.trend >= 0 ? '+' : ''}{kpi.trend}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-xl shrink-0" style={{ background: `${kpi.color}20`, color: kpi.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Export buttons */}
      {tableColumns && tableRows && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handlePDF}>
            <Download className="h-4 w-4 ml-1" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExcel}>
            <FileSpreadsheet className="h-4 w-4 ml-1" /> Excel
          </Button>
        </div>
      )}

      {/* Charts */}
      {charts.length > 0 && (
        <div className={`grid gap-3 ${charts.length === 1 ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
          {charts.map((chart, i) => (
            <Card key={i} className={`p-4 ${charts.length === 1 ? '' : charts.length % 2 === 1 && i === charts.length - 1 ? 'lg:col-span-2' : ''}`}>
              <h3 className="font-bold text-sm mb-3">{chart.title}</h3>
              <ResponsiveContainer width="100%" height={chart.height || 280}>
                {chart.type === 'bar' ? (
                  <BarChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey={chart.xKey} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, background: 'var(--card)', border: '1px solid var(--border)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {chart.yKeys.map(y => <Bar key={y.key} dataKey={y.key} name={y.name} fill={y.color} radius={[6, 6, 0, 0]} />)}
                  </BarChart>
                ) : chart.type === 'line' ? (
                  <LineChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey={chart.xKey} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, background: 'var(--card)', border: '1px solid var(--border)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {chart.yKeys.map(y => <Line key={y.key} type="monotone" dataKey={y.key} name={y.name} stroke={y.color} strokeWidth={2} dot={{ r: 3 }} />)}
                  </LineChart>
                ) : chart.type === 'area' ? (
                  <AreaChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey={chart.xKey} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, background: 'var(--card)', border: '1px solid var(--border)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {chart.yKeys.map(y => (
                      <Area key={y.key} type="monotone" dataKey={y.key} name={y.name} stroke={y.color} fill={y.color} fillOpacity={0.3} strokeWidth={2} />
                    ))}
                  </AreaChart>
                ) : (
                  <PieChart>
                    <Pie data={chart.data} dataKey={chart.yKeys[0].key} nameKey={chart.xKey} cx="50%" cy="50%" outerRadius={90} label>
                      {chart.data.map((_, idx) => <Cell key={idx} fill={chart.yKeys[0].color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, background: 'var(--card)', border: '1px solid var(--border)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </Card>
          ))}
        </div>
      )}

      {/* Custom children (table, etc.) */}
      {children}
    </div>
  )
}
