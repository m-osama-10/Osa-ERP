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
import { Building2, Plus, Trash2, Edit, MapPin, Phone, Users, Search } from 'lucide-react'
import { toast } from 'sonner'

type Branch = {
  id: string; name: string; code: string; address: string | null; phone: string | null
  isActive: boolean; _count?: { employees: number }
}

export function Branches() {
  const { lang, hasPermission } = useApp()
  const [branches, setBranches] = React.useState<Branch[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<Branch | null>(null)
  const [search, setSearch] = React.useState('')

  const load = () => {
    fetch('/api/branches').then(r => r.json()).then(d => { setBranches(d); setLoading(false) })
  }
  React.useEffect(load, [])

  const filtered = branches.filter(b =>
    !search || b.name.includes(search) || b.code.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'ar' ? 'تأكيد الحذف؟' : 'Confirm?')) return
    const res = await fetch(`/api/branches?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted'); load() }
    else { const e = await res.json(); toast.error(e.error || 'Error') }
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg gradient-primary text-primary-foreground"><Building2 className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الفروع' : 'Total'}</p><p className="text-xl font-bold">{branches.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><Users className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الموظفين' : 'Total Employees'}</p><p className="text-xl font-bold">{branches.reduce((s, b) => s + (b._count?.employees || 0), 0)}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600"><Building2 className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'نشطة' : 'Active'}</p><p className="text-xl font-bold">{branches.filter(b => b.isActive).length}</p></div></div></Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" style={{ right: 12 }} />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t(lang, 'search')} className="h-10 pr-9" />
          </div>
          {hasPermission('branches.manage') && (
            <Button onClick={() => { setEditItem(null); setDialogOpen(true) }}><Plus className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'فرع جديد' : 'New Branch'}</Button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
            {lang === 'ar' ? 'لا توجد فروع' : 'No branches'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(b => (
              <Card key={b.id} className="p-5 card-lift">
                <div className="flex items-start justify-between mb-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary text-primary-foreground">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <Badge variant={b.isActive ? 'default' : 'secondary'}>{b.isActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'متوقف' : 'Inactive')}</Badge>
                </div>
                <h4 className="font-bold text-lg">{b.name}</h4>
                <p className="text-xs text-muted-foreground mb-3 font-mono">{b.code}</p>
                <div className="space-y-2 text-sm border-t border-border pt-3">
                  {b.address && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {b.address}</div>}
                  {b.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {b.phone}</div>}
                  <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> {b._count?.employees || 0} {lang === 'ar' ? 'موظف' : 'employees'}</div>
                </div>
                {hasPermission('branches.manage') && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditItem(b); setDialogOpen(true) }}><Edit className="h-4 w-4 ml-1" /> {t(lang, 'edit')}</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>

      <BranchDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} editItem={editItem} />
    </div>
  )
}

function BranchDialog({ open, onClose, onSaved, editItem }: {
  open: boolean; onClose: () => void; onSaved: () => void; editItem: Branch | null
}) {
  const { lang } = useApp()
  const [form, setForm] = React.useState({ name: '', code: '', address: '', phone: '' })
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (editItem) {
      setForm({ name: editItem.name, code: editItem.code, address: editItem.address || '', phone: editItem.phone || '' })
    } else {
      setForm({ name: '', code: '', address: '', phone: '' })
    }
  }, [editItem])

  const submit = async () => {
    if (submitting) return
    if (!form.name || !form.code) { toast.error(lang === 'ar' ? 'الاسم والرمز مطلوبان' : 'Name & code required'); return }
    setSubmitting(true)
    try {
      const method = editItem ? 'PUT' : 'POST'
      const body = editItem ? { id: editItem.id, ...form } : form
      const res = await fetch('/api/branches', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        toast.success(editItem ? (lang === 'ar' ? 'تم التحديث' : 'Updated') : (lang === 'ar' ? 'تمت الإضافة' : 'Added'))
        onSaved(); onClose()
      } else {
        const e = await res.json(); toast.error(e.error || 'Error')
      }
    } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editItem ? t(lang, 'edit') : (lang === 'ar' ? 'فرع جديد' : 'New Branch')}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-4">
          <div><Label>{t(lang, 'name')} *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>{t(lang, 'code')} *</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} dir="ltr" disabled={!!editItem} /></div>
          <div><Label>{t(lang, 'phone')}</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" /></div>
          <div><Label>{t(lang, 'address')}</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t(lang, 'cancel')}</Button>
          <Button onClick={submit} disabled={submitting}>{submitting ? '...' : t(lang, 'save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
