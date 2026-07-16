'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Bike, Plus, Trash2, Edit, MapPin, Wifi, WifiOff, Navigation, DollarSign, Search, Download, Smartphone, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { exportExcel } from '@/components/erp/export-utils'

type Rep = {
  id: string; code: string; name: string; phone: string | null; email: string | null
  route: string | null; status: string; lastSync: string | null
  totalVisits: number; totalCollected: number; isActive: boolean
  _count?: { visits: number }
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(n) + ' ج.م'
}
function timeAgo(s: string | null) {
  if (!s) return '-'
  const diff = Date.now() - new Date(s).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min} دقيقة`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} ساعة`
  return `${Math.floor(hr / 24)} يوم`
}

export function Representatives() {
  const { lang, hasPermission } = useApp()
  const [reps, setReps] = React.useState<Rep[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<Rep | null>(null)
  const [search, setSearch] = React.useState('')

  const load = () => {
    fetch('/api/representatives').then(r => r.json()).then(d => { setReps(d); setLoading(false) })
  }
  React.useEffect(load, [])

  const filtered = reps.filter(r =>
    !search || r.name.includes(search) || r.code.toLowerCase().includes(search.toLowerCase()) || (r.route || '').includes(search)
  )

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'ar' ? 'تأكيد الحذف؟' : 'Confirm?')) return
    const res = await fetch(`/api/representatives?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted'); load() }
  }

  const handleExport = () => {
    exportExcel({
      filename: 'representatives.xlsx',
      sheets: [{
        name: 'Reps',
        columns: ['Code', 'Name', 'Phone', 'Email', 'Route', 'Status', 'Visits', 'Collected', 'Last Sync'],
        rows: filtered.map(r => [r.code, r.name, r.phone || '', r.email || '', r.route || '', r.status, r.totalVisits, r.totalCollected, r.lastSync || ''])
      }]
    })
    toast.success(lang === 'ar' ? 'تم التصدير' : 'Exported')
  }

  if (loading) return <Skeleton className="h-96" />

  const onlineCount = reps.filter(r => r.status === 'ONLINE').length
  const totalVisits = reps.reduce((s, r) => s + r.totalVisits, 0)
  const totalCollected = reps.reduce((s, r) => s + r.totalCollected, 0)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 text-primary-foreground shadow-soft">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold flex items-center gap-2"><Bike className="h-7 w-7" /> {t(lang, 'representatives')}</h2>
            <p className="mt-1 text-sm opacity-90">{lang === 'ar' ? 'إدارة ومتابعة مندوبي المبيعات الميدانيين' : 'Field sales reps management'}</p>
          </div>
          <Smartphone className="h-16 w-16 opacity-50" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg gradient-primary text-primary-foreground"><Bike className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'المندوبين' : 'Reps'}</p><p className="text-xl font-bold">{reps.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><Wifi className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'متصل' : 'Online'}</p><p className="text-xl font-bold">{onlineCount}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600"><Navigation className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الزيارات' : 'Total Visits'}</p><p className="text-xl font-bold">{totalVisits}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-600"><DollarSign className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي التحصيل' : 'Total Collected'}</p><p className="text-xl font-bold">{formatMoney(totalCollected)}</p></div></div></Card>
      </div>

      {/* Mobile Features Banner */}
      <Card className="p-4 bg-gradient-to-br from-muted/40 to-muted/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-background p-4 text-center"><WifiOff className="h-7 w-7 mx-auto mb-2 text-primary" /><p className="text-xs font-medium">{lang === 'ar' ? 'يعمل بدون إنترنت' : 'Offline Mode'}</p></div>
          <div className="rounded-xl bg-background p-4 text-center"><Wifi className="h-7 w-7 mx-auto mb-2 text-emerald-500" /><p className="text-xs font-medium">{lang === 'ar' ? 'مزامنة تلقائية' : 'Auto Sync'}</p></div>
          <div className="rounded-xl bg-background p-4 text-center"><Printer className="h-7 w-7 mx-auto mb-2 text-blue-500" /><p className="text-xs font-medium">{lang === 'ar' ? 'طباعة Bluetooth' : 'Bluetooth Print'}</p></div>
          <div className="rounded-xl bg-background p-4 text-center"><MapPin className="h-7 w-7 mx-auto mb-2 text-amber-500" /><p className="text-xs font-medium">{lang === 'ar' ? 'تتبع GPS' : 'GPS Tracking'}</p></div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" style={{ right: 12 }} />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t(lang, 'search')} className="h-10 pr-9" />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 ml-1" /> Excel</Button>
          <div className="flex-1" />
          {hasPermission('representatives.manage') && (
            <Button onClick={() => { setEditItem(null); setDialogOpen(true) }}><Plus className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'مندوب جديد' : 'New Rep'}</Button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bike className="h-12 w-12 mx-auto mb-2 opacity-30" />
            {lang === 'ar' ? 'لا يوجد مندوبين' : 'No representatives'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(r => (
              <Card key={r.id} className="p-5 card-lift">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full gradient-primary text-white font-bold">{r.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold">{r.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{r.code} {r.phone && `• ${r.phone}`}</p>
                    </div>
                  </div>
                  <Badge variant={r.status === 'ONLINE' ? 'default' : 'secondary'} className="flex items-center gap-1">
                    {r.status === 'ONLINE' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                    {r.status === 'ONLINE' ? (lang === 'ar' ? 'متصل' : 'Online') : (lang === 'ar' ? 'غير متصل' : 'Offline')}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm border-t border-border pt-3">
                  {r.route && <div className="flex items-center justify-between"><span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {lang === 'ar' ? 'الخط' : 'Route'}</span><span className="font-medium">{r.route}</span></div>}
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'الزيارات' : 'Visits'}</span><span className="font-bold">{r.totalVisits}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'التحصيل' : 'Collected'}</span><span className="font-bold text-primary">{formatMoney(r.totalCollected)}</span></div>
                  <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{lang === 'ar' ? 'آخر مزامنة' : 'Last sync'}</span><span>{timeAgo(r.lastSync)}</span></div>
                </div>
                {hasPermission('representatives.manage') && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditItem(r); setDialogOpen(true) }}><Edit className="h-4 w-4 ml-1" /> {t(lang, 'edit')}</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>

      <RepDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} editItem={editItem} />
    </div>
  )
}

function RepDialog({ open, onClose, onSaved, editItem }: {
  open: boolean; onClose: () => void; onSaved: () => void; editItem: Rep | null
}) {
  const { lang } = useApp()
  const [form, setForm] = React.useState({ name: '', phone: '', email: '', route: '' })
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (editItem) {
      setForm({ name: editItem.name, phone: editItem.phone || '', email: editItem.email || '', route: editItem.route || '' })
    } else {
      setForm({ name: '', phone: '', email: '', route: '' })
    }
  }, [editItem])

  const submit = async () => {
    if (submitting) return
    if (!form.name) { toast.error(lang === 'ar' ? 'الاسم مطلوب' : 'Name required'); return }
    setSubmitting(true)
    try {
      const method = editItem ? 'PUT' : 'POST'
      const body = editItem ? { id: editItem.id, ...form } : form
      const res = await fetch('/api/representatives', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        toast.success(editItem ? (lang === 'ar' ? 'تم التحديث' : 'Updated') : (lang === 'ar' ? 'تمت الإضافة' : 'Added'))
        onSaved(); onClose()
      } else { const e = await res.json(); toast.error(e.error || 'Error') }
    } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editItem ? t(lang, 'edit') : (lang === 'ar' ? 'مندوب جديد' : 'New Representative')}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-4">
          <div><Label>{t(lang, 'name')} *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{t(lang, 'phone')}</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" /></div>
            <div><Label>{t(lang, 'email')}</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} dir="ltr" /></div>
          </div>
          <div><Label>{lang === 'ar' ? 'الخط/المنطقة' : 'Route'}</Label><Input value={form.route} onChange={e => setForm({ ...form, route: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t(lang, 'cancel')}</Button>
          <Button onClick={submit} disabled={submitting}>{submitting ? '...' : t(lang, 'save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
