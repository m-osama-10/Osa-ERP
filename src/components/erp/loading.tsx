import { useApp } from '@/components/erp/app-context'

export function Loading({ label }: { label?: string }) {
  const { lang } = useApp()
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground">{label || (lang === 'ar' ? 'جاري التحميل...' : 'Loading...')}</p>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="space-y-3">
      <div className="h-32 rounded-xl bg-muted animate-pulse" />
      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
      <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
    </div>
  )
}

export function LoadingTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-muted/50 p-3 flex gap-3">
        {Array.from({ length: cols }).map((_, i) => <div key={i} className="h-4 flex-1 bg-muted-foreground/20 rounded animate-pulse" />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="border-t border-border p-3 flex gap-3">
          {Array.from({ length: cols }).map((_, i) => <div key={i} className="h-4 flex-1 bg-muted animate-pulse rounded" style={{ animationDelay: `${r * 100}ms` }} />)}
        </div>
      ))}
    </div>
  )
}
