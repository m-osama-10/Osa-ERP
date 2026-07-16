'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

type Column<T> = {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
  className?: string
}

export function DataTable<T extends { id: string }>({ 
  data, columns, pageSize = 10, searchKeys, emptyMessage
}: { 
  data: T[]; 
  columns: Column<T>[]; 
  pageSize?: number;
  searchKeys?: (keyof T)[];
  emptyMessage?: string;
}) {
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState('')
  const [sortKey, setSortKey] = React.useState<keyof T | null>(null)
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc')

  // Filter
  const filtered = React.useMemo(() => {
    if (!search || !searchKeys) return data
    const s = search.toLowerCase()
    return data.filter(row => searchKeys.some(k => String(row[k] || '').toLowerCase().includes(s)))
  }, [data, search, searchKeys])

  // Sort
  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey]
      if (av === bv) return 0
      const cmp = av > bv ? 1 : -1
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize) || 1
  const current = Math.min(page, totalPages)
  const start = (current - 1) * pageSize
  const pageData = sorted.slice(start, start + pageSize)

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key); setSortDir('asc')
    }
  }

  return (
    <div className="space-y-3">
      {searchKeys && (
        <div className="relative max-w-xs">
          <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground left-3" />
          <Input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="بحث..."
            className="pl-9 h-9"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {columns.map(col => (
                <th key={String(col.key)} className={`px-4 py-3 text-start font-medium ${col.className || ''}`}>
                  {col.sortable ? (
                    <button onClick={() => toggleSort(col.key as keyof T)} className="flex items-center gap-1 hover:text-primary">
                      {col.header}
                      {sortKey === col.key ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                    </button>
                  ) : col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">{emptyMessage || 'لا توجد بيانات'}</td></tr>
            ) : pageData.map(row => (
              <tr key={row.id} className="border-t border-border hover:bg-muted/30">
                {columns.map(col => (
                  <td key={String(col.key)} className={`px-4 py-3 ${col.className || ''}`}>
                    {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          عرض {start + 1} - {Math.min(start + pageSize, sorted.length)} من {sorted.length}
        </p>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="outline" className="h-8 w-8" disabled={current === 1} onClick={() => setPage(1)}><ChevronsLeft className="h-4 w-4" /></Button>
          <Button size="icon" variant="outline" className="h-8 w-8" disabled={current === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="px-3 text-sm font-medium">{current} / {totalPages}</span>
          <Button size="icon" variant="outline" className="h-8 w-8" disabled={current === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          <Button size="icon" variant="outline" className="h-8 w-8" disabled={current === totalPages} onClick={() => setPage(totalPages)}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  )
}
