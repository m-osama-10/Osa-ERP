'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Barcode, Package, AlertTriangle, TrendingUp, Trash2, Edit, Settings, ArrowRightLeft } from 'lucide-react'
import { toast } from 'sonner'

type Item = {
  id: string
  sku: string
  barcode: string | null
  name: string
  nameEn: string | null
  description: string | null
  categoryId: string | null
  category: { id: string; name: string; nameEn: string | null } | null
  unit: string
  costPrice: number
  salePrice: number
  qtyOnHand: number
  reorderLevel: number
  isActive: boolean
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(n)
}

export function Inventory() {
  const { lang } = useApp()
  const [tab, setTab] = React.useState('items')

  return (
    <div className="space-y-4 animate-in-fade">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items" className="flex items-center gap-2"><Package className="h-4 w-4" /> {t(lang, 'items')}</TabsTrigger>
          <TabsTrigger value="adjustments" className="flex items-center gap-2"><Settings className="h-4 w-4" /> {lang === 'ar' ? 'تسوية' : 'Adjustments'}</TabsTrigger>
          <TabsTrigger value="transfers" className="flex items-center gap-2"><ArrowRightLeft className="h-4 w-4" /> {lang === 'ar' ? 'تحويلات' : 'Transfers'}</TabsTrigger>
        </TabsList>
        <TabsContent value="items"><ItemsTab /></TabsContent>
        <TabsContent value="adjustments"><StockAdjustmentsTab /></TabsContent>
        <TabsContent value="transfers"><WarehouseTransfersTab /></TabsContent>
      </Tabs>
    </div>
  )
}

function ItemsTab() {
  const { lang } = useApp()
  const [items, setItems] = React.useState<Item[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<Item | null>(null)

  const load = () => {
    fetch('/api/items').then(r => r.json()).then(d => { setItems(d); setLoading(false) })
  }
  React.useEffect(load, [])

  const filtered = items.filter(i =>
    i.name.includes(search) || i.sku.toLowerCase().includes(search.toLowerCase()) ||
    (i.barcode || '').includes(search)
  )

  const totalQty = items.reduce((s, i) => s + i.qtyOnHand, 0)
  const totalValue = items.reduce((s, i) => s + (i.qtyOnHand * i.costPrice), 0)
  const lowStockCount = items.filter(i => i.qtyOnHand < i.reorderLevel).length

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'ar' ? 'تأكيد الحذف؟' : 'Confirm delete?')) return
    await fetch(`/api/items?id=${id}`, { method: 'DELETE' })
    toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted')
    load()
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-6 animate-in-fade">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary"><Package className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'عدد الأصناف' : 'Total Items'}</p><p className="text-xl font-bold">{items.length}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600"><Barcode className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الكمية' : 'Total Qty'}</p><p className="text-xl font-bold">{totalQty}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'قيمة المخزون' : 'Stock Value'}</p><p className="text-xl font-bold">{formatCurrency(totalValue)}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'مخزون منخفض' : 'Low Stock'}</p><p className="text-xl font-bold">{lowStockCount}</p></div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">{t(lang, 'items')}</h3>
            <p className="text-sm text-muted-foreground">{filtered.length} {lang === 'ar' ? 'صنف' : 'items'}</p>
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
              {t(lang, 'newItem')}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start">SKU</th>
                <th className="px-4 py-3 text-start">{t(lang, 'name')}</th>
                <th className="px-4 py-3 text-start">{t(lang, 'category')}</th>
                <th className="px-4 py-3 text-end">{t(lang, 'cost')}</th>
                <th className="px-4 py-3 text-end">{t(lang, 'price')}</th>
                <th className="px-4 py-3 text-end">{t(lang, 'quantity')}</th>
                <th className="px-4 py-3 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => {
                const isLow = i.qtyOnHand < i.reorderLevel
                return (
                  <tr key={i.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs font-semibold">{i.sku}</div>
                      {i.barcode && <div className="text-xs text-muted-foreground mt-0.5">📦 {i.barcode}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{i.name}</p>
                          <p className="text-xs text-muted-foreground">{i.nameEn} • {i.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {i.category && (
                        <Badge variant="outline">{i.category.name}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end text-muted-foreground">{formatCurrency(i.costPrice)}</td>
                    <td className="px-4 py-3 text-end font-semibold">{formatCurrency(i.salePrice)}</td>
                    <td className="px-4 py-3 text-end">
                      <span className={`font-bold ${isLow ? 'text-amber-600' : ''}`}>{i.qtyOnHand}</span>
                      {isLow && <Badge variant="destructive" className="mr-1 text-xs">{lang === 'ar' ? 'منخفض' : 'Low'}</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditItem(i); setDialogOpen(true) }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(i.id)}>
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

      <ItemDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} editItem={editItem} />
    </div>
  )
}

function ItemDialog({ open, onClose, onSaved, editItem }: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  editItem: Item | null
}) {
  const { lang } = useApp()
  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([])
  const [form, setForm] = React.useState({
    sku: '', barcode: '', name: '', nameEn: '', description: '',
    categoryId: '', unit: 'PCS', costPrice: 0, salePrice: 0, qtyOnHand: 0, reorderLevel: 10,
  })

  React.useEffect(() => {
    fetch('/api/items').then(r => r.json()).then((items: Item[]) => {
      const cats = Array.from(new Set(items.filter(i => i.category).map(i => JSON.stringify(i.category))))
      setCategories(cats.map(c => JSON.parse(c)))
    })
    if (editItem) {
      setForm({
        sku: editItem.sku,
        barcode: editItem.barcode || '',
        name: editItem.name,
        nameEn: editItem.nameEn || '',
        description: editItem.description || '',
        categoryId: editItem.categoryId || '',
        unit: editItem.unit,
        costPrice: editItem.costPrice,
        salePrice: editItem.salePrice,
        qtyOnHand: editItem.qtyOnHand,
        reorderLevel: editItem.reorderLevel,
      })
    } else {
      setForm({ sku: '', barcode: '', name: '', nameEn: '', description: '', categoryId: '', unit: 'PCS', costPrice: 0, salePrice: 0, qtyOnHand: 0, reorderLevel: 10 })
    }
  }, [editItem])

  const submit = async () => {
    const method = editItem ? 'PUT' : 'POST'
    const body = editItem ? { id: editItem.id, ...form } : form
    const res = await fetch('/api/items', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success(editItem ? (lang === 'ar' ? 'تم التحديث' : 'Updated') : (lang === 'ar' ? 'تمت الإضافة' : 'Added'))
      onSaved()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{editItem ? t(lang, 'edit') : t(lang, 'newItem')}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div><Label>SKU</Label><Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} dir="ltr" /></div>
          <div><Label>Barcode</Label><Input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} dir="ltr" /></div>
          <div><Label>{t(lang, 'name')} *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>{t(lang, 'nameEn')}</Label><Input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} dir="ltr" /></div>
          <div>
            <Label>{t(lang, 'category')}</Label>
            <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
              <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'اختر' : 'Select'} /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>{t(lang, 'unit')}</Label><Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} dir="ltr" /></div>
          <div><Label>{t(lang, 'cost')}</Label><Input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label>{t(lang, 'price')}</Label><Input type="number" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label>{t(lang, 'quantity')}</Label><Input type="number" value={form.qtyOnHand} onChange={e => setForm({ ...form, qtyOnHand: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label>{lang === 'ar' ? 'حد إعادة الطلب' : 'Reorder Level'}</Label><Input type="number" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: parseFloat(e.target.value) || 0 })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t(lang, 'cancel')}</Button>
          <Button onClick={submit} disabled={!form.name}>{t(lang, 'save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ Stock Adjustments ============
function StockAdjustmentsTab() {
  const { lang, hasPermission } = useApp()
  const [adjustments, setAdjustments] = React.useState<any[]>([])
  const [items, setItems] = React.useState<Item[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState({ itemId: '', newQty: 0, reason: '', type: 'COUNT' })

  const load = () => {
    Promise.all([
      fetch('/api/stock-adjustments').then(r => r.json()),
      fetch('/api/items').then(r => r.json()),
    ]).then(([a, i]) => { setAdjustments(Array.isArray(a) ? a : []); setItems(i); setLoading(false) })
  }
  React.useEffect(load, [])

  const submit = async () => {
    if (!form.itemId || form.newQty < 0) { toast.error(lang === 'ar' ? 'اختر صنف وكمية صحيحة' : 'Select item and valid qty'); return }
    const res = await fetch('/api/stock-adjustments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success(lang === 'ar' ? 'تمت التسوية' : 'Adjusted')
      setForm({ itemId: '', newQty: 0, reason: '', type: 'COUNT' })
      setDialogOpen(false); load()
    } else { const e = await res.json(); toast.error(e.error || 'Error') }
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {hasPermission('inventory.edit') && <Button size="sm" onClick={() => setDialogOpen(true)}><Settings className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'تسوية مخزون' : 'New Adjustment'}</Button>}
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start">{t(lang, 'date')}</th>
                <th className="px-4 py-3 text-start">{t(lang, 'items')}</th>
                <th className="px-4 py-3 text-end">{lang === 'ar' ? 'الكمية' : 'Quantity'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'السبب' : 'Reason'}</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground"><Settings className="h-12 w-12 mx-auto mb-2 opacity-30" />{lang === 'ar' ? 'لا توجد تسويات' : 'No adjustments'}</td></tr>
              ) : adjustments.map(a => (
                <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-xs">{new Date(a.date).toLocaleDateString('ar-EG')}</td>
                  <td className="px-4 py-3 font-medium">{a.item?.name || '-'}</td>
                  <td className="px-4 py-3 text-end font-bold">{a.quantity}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{a.reference || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lang === 'ar' ? 'تسوية مخزون' : 'Stock Adjustment'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <div><Label>{t(lang, 'items')} *</Label>
              <Select value={form.itemId} onValueChange={v => {
                const item = items.find(i => i.id === v)
                setForm({ ...form, itemId: v, newQty: item?.qtyOnHand || 0 })
              }}>
                <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'اختر' : 'Select'} /></SelectTrigger>
                <SelectContent>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.sku} - {i.name} (مخزون: {i.qtyOnHand})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{lang === 'ar' ? 'الكمية الجديدة' : 'New Quantity'} *</Label><Input type="number" min={0} value={form.newQty} onChange={e => setForm({ ...form, newQty: parseInt(e.target.value) || 0 })} /></div>
            <div><Label>{lang === 'ar' ? 'النوع' : 'Type'}</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COUNT">{lang === 'ar' ? 'جرد' : 'Stock Count'}</SelectItem>
                  <SelectItem value="DAMAGE">{lang === 'ar' ? 'تالف' : 'Damaged'}</SelectItem>
                  <SelectItem value="EXPIRE">{lang === 'ar' ? 'منتهي الصلاحية' : 'Expired'}</SelectItem>
                  <SelectItem value="ADJUST">{lang === 'ar' ? 'تسوية' : 'Adjustment'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>{lang === 'ar' ? 'السبب' : 'Reason'}</Label><Textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>{t(lang, 'cancel')}</Button><Button onClick={submit}>{t(lang, 'save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ Warehouse Transfers ============
function WarehouseTransfersTab() {
  const { lang, hasPermission } = useApp()
  const [transfers, setTransfers] = React.useState<any[]>([])
  const [items, setItems] = React.useState<Item[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState({ itemId: '', quantity: 1, fromWarehouseId: '', toWarehouseId: '', notes: '' })

  const load = () => {
    Promise.all([
      fetch('/api/warehouse-transfers').then(r => r.json()),
      fetch('/api/items').then(r => r.json()),
    ]).then(([t, i]) => { setTransfers(Array.isArray(t) ? t : []); setItems(i); setLoading(false) })
  }
  React.useEffect(load, [])

  const submit = async () => {
    if (!form.itemId || form.quantity <= 0) { toast.error(lang === 'ar' ? 'اختر صنف وكمية' : 'Select item and qty'); return }
    const res = await fetch('/api/warehouse-transfers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success(lang === 'ar' ? 'تم التحويل' : 'Transferred')
      setForm({ itemId: '', quantity: 1, fromWarehouseId: '', toWarehouseId: '', notes: '' })
      setDialogOpen(false); load()
    } else { const e = await res.json(); toast.error(e.error || 'Error') }
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {hasPermission('inventory.edit') && <Button size="sm" onClick={() => setDialogOpen(true)}><ArrowRightLeft className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'تحويل جديد' : 'New Transfer'}</Button>}
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start">{t(lang, 'date')}</th>
                <th className="px-4 py-3 text-start">{t(lang, 'items')}</th>
                <th className="px-4 py-3 text-end">{lang === 'ar' ? 'الكمية' : 'Quantity'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'ملاحظات' : 'Notes'}</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground"><ArrowRightLeft className="h-12 w-12 mx-auto mb-2 opacity-30" />{lang === 'ar' ? 'لا توجد تحويلات' : 'No transfers'}</td></tr>
              ) : transfers.map(tr => (
                <tr key={tr.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-xs">{new Date(tr.date).toLocaleDateString('ar-EG')}</td>
                  <td className="px-4 py-3 font-medium">{tr.item?.name || '-'}</td>
                  <td className="px-4 py-3 text-end font-bold">{tr.quantity}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{tr.reference || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lang === 'ar' ? 'تحويل مخزون' : 'Warehouse Transfer'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <div><Label>{t(lang, 'items')} *</Label>
              <Select value={form.itemId} onValueChange={v => setForm({ ...form, itemId: v })}>
                <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'اختر' : 'Select'} /></SelectTrigger>
                <SelectContent>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.sku} - {i.name} (مخزون: {i.qtyOnHand})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{t(lang, 'quantity')} *</Label><Input type="number" min={1} value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} /></div>
            <div><Label>{lang === 'ar' ? 'ملاحظات' : 'Notes'}</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>{t(lang, 'cancel')}</Button><Button onClick={submit}>{t(lang, 'save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
