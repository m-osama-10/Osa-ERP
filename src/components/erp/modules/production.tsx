'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Factory, Plus, Trash2, Edit, ClipboardList, Boxes, FlaskConical, Search, Download } from 'lucide-react'
import { toast } from 'sonner'
import { exportExcel } from '@/components/erp/export-utils'

type ProductionOrder = {
  id: string; orderNo: string; productName: string; quantity: number
  unitCost: number; totalCost: number; status: string
  startDate: string; endDate: string | null; notes: string | null
  bomId: string | null
  bom: { id: string; productCode: string; productName: string } | null
}

type BOM = {
  id: string; productCode: string; productName: string; version: string
  totalCost: number; isActive: boolean
  lines: { id: string; quantity: number; item: { id: string; name: string; sku: string } }[]
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(n) + ' ج.م'
}
function formatDate(s: string) { return new Date(s).toLocaleDateString('ar-EG') }

const statusVariants: Record<string, any> = {
  PLANNED: 'outline', IN_PROGRESS: 'secondary', COMPLETED: 'default', CANCELLED: 'destructive',
}
const statusLabels: Record<string, { ar: string; en: string }> = {
  PLANNED: { ar: 'مخطط', en: 'Planned' },
  IN_PROGRESS: { ar: 'قيد التنفيذ', en: 'In Progress' },
  COMPLETED: { ar: 'مكتمل', en: 'Completed' },
  CANCELLED: { ar: 'ملغي', en: 'Cancelled' },
}

export function Production() {
  const { lang, hasPermission } = useApp()
  const [orders, setOrders] = React.useState<ProductionOrder[]>([])
  const [boms, setBoms] = React.useState<BOM[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<ProductionOrder | null>(null)
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')

  const load = () => {
    Promise.all([
      fetch('/api/production-orders').then(r => r.json()),
      fetch('/api/boms').then(r => r.json()).catch(() => []),
    ]).then(([o, b]) => {
      setOrders(o); setBoms(Array.isArray(b) ? b : []); setLoading(false)
    })
  }
  React.useEffect(load, [])

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.productName.includes(search) || o.orderNo.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'ar' ? 'تأكيد الحذف؟' : 'Confirm?')) return
    const res = await fetch(`/api/production-orders?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted'); load() }
  }

  const handleExport = () => {
    exportExcel({
      filename: 'production-orders.xlsx',
      sheets: [{
        name: 'Orders',
        columns: ['Order No', 'Product', 'Quantity', 'Unit Cost', 'Total Cost', 'Status', 'Start Date', 'End Date'],
        rows: filtered.map(o => [o.orderNo, o.productName, o.quantity, o.unitCost, o.totalCost, o.status, formatDate(o.startDate), o.endDate ? formatDate(o.endDate) : '-'])
      }]
    })
    toast.success(lang === 'ar' ? 'تم التصدير' : 'Exported')
  }

  if (loading) return <Skeleton className="h-96" />

  const totalOrders = orders.length
  const inProgress = orders.filter(o => o.status === 'IN_PROGRESS').length
  const completed = orders.filter(o => o.status === 'COMPLETED').length
  const totalCost = orders.reduce((s, o) => s + o.totalCost, 0)

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg gradient-primary text-primary-foreground"><Factory className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'أوامر الإنتاج' : 'Orders'}</p><p className="text-xl font-bold">{totalOrders}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><Boxes className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الوصفات' : 'BOMs'}</p><p className="text-xl font-bold">{boms.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-600"><ClipboardList className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</p><p className="text-xl font-bold">{inProgress}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600"><FlaskConical className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي التكلفة' : 'Total Cost'}</p><p className="text-xl font-bold">{formatMoney(totalCost)}</p></div></div></Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" style={{ right: 12 }} />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t(lang, 'search')} className="h-10 pr-9" />
          </div>
          <Select value={statusFilter || '_all'} onValueChange={v => setStatusFilter(v === '_all' ? '' : v)}>
            <SelectTrigger className="w-36 h-10"><SelectValue placeholder={lang === 'ar' ? 'الحالة' : 'Status'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">{lang === 'ar' ? 'الكل' : 'All'}</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{lang === 'ar' ? v.ar : v.en}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 ml-1" /> Excel</Button>
          <div className="flex-1" />
          {hasPermission('production.create') && (
            <Button onClick={() => { setEditItem(null); setDialogOpen(true) }}><Plus className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'أمر جديد' : 'New Order'}</Button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Factory className="h-12 w-12 mx-auto mb-2 opacity-30" />
            {lang === 'ar' ? 'لا توجد أوامر إنتاج' : 'No production orders'}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-start">{lang === 'ar' ? 'رقم' : 'No'}</th>
                  <th className="px-4 py-3 text-start">{lang === 'ar' ? 'المنتج' : 'Product'}</th>
                  <th className="px-4 py-3 text-end">{lang === 'ar' ? 'الكمية' : 'Qty'}</th>
                  <th className="px-4 py-3 text-end">{lang === 'ar' ? 'تكلفة الوحدة' : 'Unit Cost'}</th>
                  <th className="px-4 py-3 text-end">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                  <th className="px-4 py-3 text-start">{t(lang, 'date')}</th>
                  <th className="px-4 py-3 text-center">{t(lang, 'status')}</th>
                  {hasPermission('production.edit') && <th className="px-4 py-3 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-semibold text-primary">{o.orderNo}</td>
                    <td className="px-4 py-3 font-medium">{o.productName}</td>
                    <td className="px-4 py-3 text-end">{o.quantity}</td>
                    <td className="px-4 py-3 text-end">{formatMoney(o.unitCost)}</td>
                    <td className="px-4 py-3 text-end font-bold">{formatMoney(o.totalCost)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(o.startDate)}</td>
                    <td className="px-4 py-3 text-center"><Badge variant={statusVariants[o.status] || 'default'}>{lang === 'ar' ? statusLabels[o.status]?.ar : statusLabels[o.status]?.en}</Badge></td>
                    {hasPermission('production.edit') && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-center">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditItem(o); setDialogOpen(true) }}><Edit className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(o.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* BOMs Section */}
      {boms.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">{lang === 'ar' ? 'وصفات التصنيع (BOM)' : 'Bill of Materials'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boms.map(b => (
              <div key={b.id} className="rounded-xl border-2 border-border p-4 card-lift">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg gradient-primary text-primary-foreground"><Boxes className="h-5 w-5" /></div>
                    <div>
                      <p className="font-bold">{b.productName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{b.productCode} • v{b.version}</p>
                    </div>
                  </div>
                  <Badge>{b.isActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'متوقف' : 'Inactive')}</Badge>
                </div>
                {b.lines.length > 0 && (
                  <div className="text-xs space-y-1 mt-2 pt-2 border-t border-border">
                    <p className="font-semibold text-muted-foreground mb-1">{lang === 'ar' ? 'المكونات:' : 'Components:'}</p>
                    {b.lines.map(l => (
                      <div key={l.id} className="flex justify-between">
                        <span>{l.item.name}</span>
                        <span className="font-mono">{l.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
                  <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'إجمالي التكلفة' : 'Total Cost'}</p>
                  <p className="text-xl font-bold text-primary">{formatMoney(b.totalCost)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ProductionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} editItem={editItem} boms={boms} />
    </div>
  )
}

function ProductionDialog({ open, onClose, onSaved, editItem, boms }: {
  open: boolean; onClose: () => void; onSaved: () => void; editItem: ProductionOrder | null; boms: BOM[]
}) {
  const { lang } = useApp()
  const [form, setForm] = React.useState({
    productName: '', quantity: 1, unitCost: 0, status: 'PLANNED',
    startDate: new Date().toISOString().split('T')[0], endDate: '', notes: '', bomId: '',
  })
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (editItem) {
      setForm({
        productName: editItem.productName, quantity: editItem.quantity, unitCost: editItem.unitCost,
        status: editItem.status, startDate: new Date(editItem.startDate).toISOString().split('T')[0],
        endDate: editItem.endDate ? new Date(editItem.endDate).toISOString().split('T')[0] : '',
        notes: editItem.notes || '', bomId: editItem.bomId || '',
      })
    } else {
      setForm({ productName: '', quantity: 1, unitCost: 0, status: 'PLANNED', startDate: new Date().toISOString().split('T')[0], endDate: '', notes: '', bomId: '' })
    }
  }, [editItem])

  const submit = async () => {
    if (submitting) return
    if (!form.productName || form.quantity <= 0) { toast.error(lang === 'ar' ? 'المنتج والكمية مطلوبان' : 'Product & qty required'); return }
    setSubmitting(true)
    try {
      const method = editItem ? 'PUT' : 'POST'
      const body: any = editItem ? { id: editItem.id, ...form } : form
      const res = await fetch('/api/production-orders', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        toast.success(editItem ? (lang === 'ar' ? 'تم التحديث' : 'Updated') : (lang === 'ar' ? 'تمت الإضافة' : 'Added'))
        onSaved(); onClose()
      } else { const e = await res.json(); toast.error(e.error || 'Error') }
    } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>{editItem ? t(lang, 'edit') : (lang === 'ar' ? 'أمر إنتاج جديد' : 'New Production Order')}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-4">
          {boms.length > 0 && (
            <div>
              <Label>{lang === 'ar' ? 'الوصفة (BOM)' : 'BOM'}</Label>
              <Select value={form.bomId || '_none'} onValueChange={v => {
                const bom = boms.find(b => b.id === v)
                setForm({ ...form, bomId: v === '_none' ? '' : v, productName: bom?.productName || form.productName, unitCost: bom?.totalCost || form.unitCost })
              }}>
                <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'اختر' : 'Select'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">{lang === 'ar' ? 'بدون' : 'None'}</SelectItem>
                  {boms.map(b => <SelectItem key={b.id} value={b.id}>{b.productName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div><Label>{lang === 'ar' ? 'اسم المنتج' : 'Product Name'} *</Label><Input value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{lang === 'ar' ? 'الكمية' : 'Quantity'} *</Label><Input type="number" min={1} value={form.quantity} onChange={e => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} /></div>
            <div><Label>{lang === 'ar' ? 'تكلفة الوحدة' : 'Unit Cost'}</Label><Input type="number" value={form.unitCost} onChange={e => setForm({ ...form, unitCost: parseFloat(e.target.value) || 0 })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{lang === 'ar' ? 'تاريخ البداية' : 'Start Date'}</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><Label>{lang === 'ar' ? 'تاريخ النهاية' : 'End Date'}</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
          </div>
          <div>
            <Label>{t(lang, 'status')}</Label>
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{lang === 'ar' ? v.ar : v.en}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>{lang === 'ar' ? 'ملاحظات' : 'Notes'}</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t(lang, 'cancel')}</Button>
          <Button onClick={submit} disabled={submitting}>{submitting ? '...' : t(lang, 'save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
