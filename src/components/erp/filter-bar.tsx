'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Filter, Calendar, RotateCcw } from 'lucide-react'

export type DatePreset =
  | 'today' | 'yesterday' | 'last7' | 'last30'
  | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'custom' | 'all'

export type FilterConfig = {
  search?: boolean
  searchPlaceholder?: string
  dateRange?: boolean
  statusOptions?: { value: string; labelAr: string; labelEn: string }[]
  branchFilter?: boolean
  userFilter?: boolean
  extraFilters?: { key: string; labelAr: string; labelEn: string; options: { value: string; labelAr: string; labelEn: string }[] }[]
}

export type FilterValues = {
  search: string
  datePreset: DatePreset
  dateFrom: string
  dateTo: string
  status: string
  branchId: string
  userId: string
  extra: Record<string, string>
}

export const defaultFilters: FilterValues = {
  search: '',
  datePreset: 'all',
  dateFrom: '',
  dateTo: '',
  status: '',
  branchId: '',
  userId: '',
  extra: {},
}

const presetLabels: Record<DatePreset, { ar: string; en: string }> = {
  today: { ar: 'اليوم', en: 'Today' },
  yesterday: { ar: 'أمس', en: 'Yesterday' },
  last7: { ar: 'آخر 7 أيام', en: 'Last 7 days' },
  last30: { ar: 'آخر 30 يوم', en: 'Last 30 days' },
  thisMonth: { ar: 'هذا الشهر', en: 'This month' },
  lastMonth: { ar: 'الشهر السابق', en: 'Last month' },
  thisYear: { ar: 'هذه السنة', en: 'This year' },
  lastYear: { ar: 'السنة السابقة', en: 'Last year' },
  custom: { ar: 'فترة مخصصة', en: 'Custom' },
  all: { ar: 'الكل', en: 'All' },
}

export function getDateRange(preset: DatePreset, from?: string, to?: string): { from?: Date; to?: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  switch (preset) {
    case 'today':
      return { from: today, to: new Date(today.getTime() + 86400000 - 1) }
    case 'yesterday': {
      const y = new Date(today.getTime() - 86400000)
      return { from: y, to: new Date(y.getTime() + 86400000 - 1) }
    }
    case 'last7':
      return { from: new Date(today.getTime() - 6 * 86400000), to: now }
    case 'last30':
      return { from: new Date(today.getTime() - 29 * 86400000), to: now }
    case 'thisMonth':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      return { from: start, to: end }
    }
    case 'thisYear':
      return { from: new Date(now.getFullYear(), 0, 1), to: now }
    case 'lastYear': {
      const start = new Date(now.getFullYear() - 1, 0, 1)
      const end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)
      return { from: start, to: end }
    }
    case 'custom':
      return {
        from: from ? new Date(from) : undefined,
        to: to ? new Date(new Date(to).getTime() + 86400000 - 1) : undefined,
      }
    default:
      return {}
  }
}

export function FilterBar({
  config,
  values,
  onChange,
  branches = [],
  users = [],
}: {
  config: FilterConfig
  values: FilterValues
  onChange: (v: FilterValues) => void
  branches?: { id: string; name: string }[]
  users?: { id: string; name: string }[]
}) {
  const { lang } = useApp()
  const [expanded, setExpanded] = React.useState(false)

  const hasActiveFilters =
    values.search || values.datePreset !== 'all' || values.status || values.branchId || values.userId ||
    Object.values(values.extra).some(v => v) ||
    (values.datePreset === 'custom' && (values.dateFrom || values.dateTo))

  const update = (patch: Partial<FilterValues>) => onChange({ ...values, ...patch })
  const reset = () => onChange({ ...defaultFilters })

  return (
    <div className="rounded-2xl glass border border-border p-3 mb-4 space-y-3">
      {/* Top row: search + presets + expand */}
      <div className="flex flex-col md:flex-row gap-2">
        {config.search && (
          <div className="relative flex-1 min-w-[200px] group">
            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" style={{ [lang === 'ar' ? 'right' : 'left']: 12 } as React.CSSProperties} />
            <Input
              value={values.search}
              onChange={e => update({ search: e.target.value })}
              placeholder={config.searchPlaceholder || (lang === 'ar' ? 'بحث لحظي...' : 'Live search...')}
              className="h-10 rounded-xl bg-background"
              style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: 36 } as React.CSSProperties}
            />
            {values.search && (
              <button onClick={() => update({ search: '' })} className="absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive" style={{ [lang === 'ar' ? 'left' : 'right']: 10 } as React.CSSProperties}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {config.dateRange && (
          <div className="flex items-center gap-1 flex-wrap">
            <Calendar className="h-4 w-4 text-muted-foreground ms-1" />
            {(Object.keys(presetLabels) as DatePreset[]).map(p => (
              <button
                key={p}
                onClick={() => update({ datePreset: p })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  values.datePreset === p
                    ? 'gradient-primary text-primary-foreground shadow-soft'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {lang === 'ar' ? presetLabels[p].ar : presetLabels[p].en}
              </button>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(e => !e)}
          className="h-10 shrink-0"
        >
          <Filter className="h-4 w-4 ml-1" />
          {lang === 'ar' ? 'فلاتر' : 'Filters'}
          {hasActiveFilters && <span className="ms-1 h-2 w-2 rounded-full gradient-accent" />}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={reset} className="h-10 text-destructive hover:bg-destructive/10">
            <RotateCcw className="h-4 w-4 ml-1" />
            {lang === 'ar' ? 'إعادة تعيين' : 'Reset'}
          </Button>
        )}
      </div>

      {/* Custom date range */}
      {config.dateRange && values.datePreset === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 animate-fade-in">
          <span className="text-xs font-semibold text-muted-foreground">{lang === 'ar' ? 'من' : 'From'}:</span>
          <Input type="date" value={values.dateFrom} onChange={e => update({ dateFrom: e.target.value })} className="h-9 w-auto rounded-lg" />
          <span className="text-xs font-semibold text-muted-foreground">{lang === 'ar' ? 'إلى' : 'To'}:</span>
          <Input type="date" value={values.dateTo} onChange={e => update({ dateTo: e.target.value })} className="h-9 w-auto rounded-lg" />
        </div>
      )}

      {/* Expanded filters */}
      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-border animate-fade-in">
          {config.statusOptions && config.statusOptions.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">{lang === 'ar' ? 'الحالة' : 'Status'}</label>
              <select
                value={values.status}
                onChange={e => update({ status: e.target.value })}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                {config.statusOptions.map(o => (
                  <option key={o.value} value={o.value}>{lang === 'ar' ? o.labelAr : o.labelEn}</option>
                ))}
              </select>
            </div>
          )}

          {config.branchFilter && branches.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">{lang === 'ar' ? 'الفرع' : 'Branch'}</label>
              <select
                value={values.branchId}
                onChange={e => update({ branchId: e.target.value })}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          {config.userFilter && users.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">{lang === 'ar' ? 'المستخدم' : 'User'}</label>
              <select
                value={values.userId}
                onChange={e => update({ userId: e.target.value })}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          )}

          {config.extraFilters?.map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">{lang === 'ar' ? f.labelAr : f.labelEn}</label>
              <select
                value={values.extra[f.key] || ''}
                onChange={e => update({ extra: { ...values.extra, [f.key]: e.target.value } })}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                {f.options.map(o => <option key={o.value} value={o.value}>{lang === 'ar' ? o.labelAr : o.labelEn}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
