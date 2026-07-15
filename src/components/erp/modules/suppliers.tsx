'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Search, Phone, Mail, Trash2, Edit, Truck, CreditCard, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

type Supplier = {
  id: string
  code: string
  name: string
  nameEn: string | null
  phone: string | null
  email: string | null
  address: string | null
  creditLimit: number
  balance: number
  openingBalance: number
  currency: string
  isActive: boolean
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(n)
}

export function Suppliers() {
  const { lang } = useApp()
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<Supplier | null>(null)

  const load = () => {
    fetch('/api/suppliers').then(r => r.json()).then(d => { setSuppliers(d); setLoading(false) })
  }
  React.useEffect(load, [])

  const filtered = suppliers.filter(s =>
    s.name.includes(search) || s.code.toLowerCase().includes(search.toLowerCase()) ||
    (s.nameEn || '').toLowerCase().includes(search.toLowerCase()) || (s.phone || '').includes(search)
  )

  const totalBalance = suppliers.reduce((s, c) => s + c.balance, 0)
  const totalCredit = suppliers.reduce((s, c) => s + c.creditLimit, 0)

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'ar' ? 'تأكيد الحذف؟' : 'Confirm delete?')) return
    await fetch(`/api/suppliers?id=${id}`, { method: 'DELETE' })
    toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted')
    load()
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-6 animate-in-fade">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary"><Truck className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الموردين' : 'Total Suppliers'}</p><p className="text-xl font-bold">{suppliers.length}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-600"><CreditCard className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الأرصدة' : 'Total Balances'}</p><p className="text-xl font-bold">{formatCurrency(totalBalance)}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'حد ائتماني كلي' : 'Total Credit'}</p><p className="text-xl font-bold">{formatCurrency(totalCredit)}</p></div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">{t(lang, 'suppliers')}</h3>
            <p className="text-sm text-muted-foreground">{filtered.length} {lang === 'ar' ? 'مورد' : 'suppliers'}</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" style={{ [lang === 'ar' ? 'right' : 'left']: 12 } as React.CSSProperties} />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t(lang, 'search')}
                className="h-10"
                style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: 36 } as React.CSSProperties}
              />
            </div>
            <Button onClick={() => { setEditItem(null); setDialogOpen(true) }}>
              <Plus className="h-4 w-4 ml-1" />
              {t(lang, 'newSupplier')}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start">{t(lang, 'code')}</th>
                <th className="px-4 py-3 text-start">{t(lang, 'name')}</th>
                <th className="px-4 py-3 text-start">{t(lang, 'phone')}</th>
                <th className="px-4 py-3 text-end">{t(lang, 'balance')}</th>
                <th className="px-4 py-3 text-end">{t(lang, 'creditLimit')}</th>
                <th className="px-4 py-3 text-center">{t(lang, 'status')}</th>
                <th className="px-4 py-3 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-semibold">{s.code}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.nameEn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {s.phone && (
                      <a href={`tel:${s.phone}`} className="flex items-center gap-1 text-xs hover:text-primary">
                        <Phone className="h-3 w-3" /> {s.phone}
                      </a>
                    )}
                    {s.email && (
                      <a href={`mailto:${s.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-1">
                        <Mail className="h-3 w-3" /> {s.email}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-end font-semibold">{formatCurrency(s.balance)}</td>
                  <td className="px-4 py-3 text-end font-medium">{formatCurrency(s.creditLimit)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={s.isActive ? 'default' : 'secondary'}>
                      {s.isActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'متوقف' : 'Inactive')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditItem(s); setDialogOpen(true) }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SupplierDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} editItem={editItem} />
    </div>
  )
}

function SupplierDialog({ open, onClose, onSaved, editItem }: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  editItem: Supplier | null
}) {
  const { lang } = useApp()
  const [form, setForm] = React.useState({
    name: '', nameEn: '', phone: '', email: '', address: '',
    creditLimit: 0, openingBalance: 0,
  })

  React.useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        nameEn: editItem.nameEn || '',
        phone: editItem.phone || '',
        email: editItem.email || '',
        address: editItem.address || '',
        creditLimit: editItem.creditLimit,
        openingBalance: editItem.openingBalance,
      })
    } else {
      setForm({ name: '', nameEn: '', phone: '', email: '', address: '', creditLimit: 0, openingBalance: 0 })
    }
  }, [editItem])

  const submit = async () => {
    const url = '/api/suppliers'
    const method = editItem ? 'PUT' : 'POST'
    const body = editItem ? { id: editItem.id, ...form } : form
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success(editItem ? (lang === 'ar' ? 'تم التحديث' : 'Updated') : (lang === 'ar' ? 'تمت الإضافة' : 'Added'))
      onSaved()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{editItem ? t(lang, 'edit') : t(lang, 'newSupplier')}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div><Label>{t(lang, 'name')} *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>{t(lang, 'nameEn')}</Label><Input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} dir="ltr" /></div>
          <div><Label>{t(lang, 'phone')}</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" /></div>
          <div><Label>{t(lang, 'email')}</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} dir="ltr" /></div>
          <div><Label>{t(lang, 'creditLimit')}</Label><Input type="number" value={form.creditLimit} onChange={e => setForm({ ...form, creditLimit: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label>{lang === 'ar' ? 'الرصيد الافتتاحي' : 'Opening Balance'}</Label><Input type="number" value={form.openingBalance} onChange={e => setForm({ ...form, openingBalance: parseFloat(e.target.value) || 0 })} /></div>
          <div className="col-span-2"><Label>{t(lang, 'address')}</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t(lang, 'cancel')}</Button>
          <Button onClick={submit} disabled={!form.name}>{t(lang, 'save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
