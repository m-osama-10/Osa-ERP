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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Phone, Mail, Trash2, Edit, Users, User, CreditCard, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

type Customer = {
  id: string
  code: string
  name: string
  nameEn: string | null
  type: string
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

export function Customers() {
  const { lang } = useApp()
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<Customer | null>(null)

  const load = () => {
    fetch('/api/customers').then(r => r.json()).then(d => { setCustomers(d); setLoading(false) })
  }
  React.useEffect(load, [])

  const filtered = customers.filter(c =>
    c.name.includes(search) || c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.nameEn || '').toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search)
  )

  const totalBalance = customers.reduce((s, c) => s + c.balance, 0)
  const totalCredit = customers.reduce((s, c) => s + c.creditLimit, 0)
  const activeCount = customers.filter(c => c.isActive).length

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'ar' ? 'تأكيد الحذف؟' : 'Confirm delete?')) return
    await fetch(`/api/customers?id=${id}`, { method: 'DELETE' })
    toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted')
    load()
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-6 animate-in-fade">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary"><Users className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground">{t(lang, 'totalCustomers')}</p><p className="text-xl font-bold">{customers.length}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><User className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'نشط' : 'Active'}</p><p className="text-xl font-bold">{activeCount}</p></div>
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
            <h3 className="text-lg font-bold">{t(lang, 'customers')}</h3>
            <p className="text-sm text-muted-foreground">{filtered.length} {lang === 'ar' ? 'عميل' : 'customers'}</p>
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
              {t(lang, 'newCustomer')}
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
              {filtered.map(c => {
                const utilization = c.creditLimit > 0 ? (c.balance / c.creditLimit) * 100 : 0
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${c.type === 'COMPANY' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {c.type === 'COMPANY' ? <Building2Small /> : <User className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-xs hover:text-primary">
                          <Phone className="h-3 w-3" /> {c.phone}
                        </a>
                      )}
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-1">
                          <Mail className="h-3 w-3" /> {c.email}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end font-semibold">{formatCurrency(c.balance)}</td>
                    <td className="px-4 py-3 text-end">
                      <div>
                        <p className="font-medium">{formatCurrency(c.creditLimit)}</p>
                        <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full rounded-full ${utilization > 80 ? 'bg-red-500' : utilization > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(utilization, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={c.isActive ? 'default' : 'secondary'}>
                        {c.isActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'متوقف' : 'Inactive')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditItem(c); setDialogOpen(true) }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <CustomerDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} editItem={editItem} />
    </div>
  )
}

function Building2Small() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>
}

function CustomerDialog({ open, onClose, onSaved, editItem }: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  editItem: Customer | null
}) {
  const { lang } = useApp()
  const [form, setForm] = React.useState({
    name: '', nameEn: '', type: 'INDIVIDUAL', phone: '', email: '', address: '',
    creditLimit: 0, openingBalance: 0,
  })

  React.useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        nameEn: editItem.nameEn || '',
        type: editItem.type,
        phone: editItem.phone || '',
        email: editItem.email || '',
        address: editItem.address || '',
        creditLimit: editItem.creditLimit,
        openingBalance: editItem.openingBalance,
      })
    } else {
      setForm({ name: '', nameEn: '', type: 'INDIVIDUAL', phone: '', email: '', address: '', creditLimit: 0, openingBalance: 0 })
    }
  }, [editItem])

  const submit = async () => {
    const url = '/api/customers'
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
        <DialogHeader><DialogTitle>{editItem ? t(lang, 'edit') : t(lang, 'newCustomer')}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div><Label>{t(lang, 'name')} *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>{t(lang, 'nameEn')}</Label><Input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} dir="ltr" /></div>
          <div>
            <Label>{t(lang, 'type')}</Label>
            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">{lang === 'ar' ? 'فرد' : 'Individual'}</SelectItem>
                <SelectItem value="COMPANY">{lang === 'ar' ? 'شركة' : 'Company'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
