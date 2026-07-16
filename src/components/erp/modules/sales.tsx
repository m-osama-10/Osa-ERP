'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, ShoppingCart, FileText, Receipt, Trash2, Printer } from 'lucide-react'
import { toast } from 'sonner'

type Invoice = {
  id: string
  invoiceNo: string
  customerId: string
  customer: { id: string; name: string; code: string }
  date: string
  dueDate: string | null
  subtotal: number
  discount: number
  taxAmount: number
  total: number
  paidAmount: number
  status: string
  type: string
  items: { id: string; itemId: string; item: { id: string; name: string; sku: string }; quantity: number; price: number; total: number }[]
}

type Purchase = {
  id: string
  purchaseNo: string
  supplierId: string
  supplier: { id: string; name: string; code: string }
  date: string
  subtotal: number
  taxAmount: number
  total: number
  paidAmount: number
  status: string
  items: { id: string; itemId: string; item: { id: string; name: string; sku: string }; quantity: number; price: number; total: number }[]
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(n)
}
function formatDate(s: string) { return new Date(s).toLocaleDateString('ar-SA') }

const statusVariants: Record<string, any> = {
  PAID: 'default',
  UNPAID: 'destructive',
  PARTIAL: 'secondary',
}

export function Sales() {
  const { lang } = useApp()
  const [tab, setTab] = React.useState('invoices')

  return (
    <div className="space-y-6 animate-in-fade">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices" className="flex items-center gap-2"><Receipt className="h-4 w-4" /> {t(lang, 'invoices')}</TabsTrigger>
          <TabsTrigger value="pos" className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> {t(lang, 'pos')}</TabsTrigger>
          <TabsTrigger value="purchases" className="flex items-center gap-2"><FileText className="h-4 w-4" /> {t(lang, 'purchases')}</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices"><Invoices /></TabsContent>
        <TabsContent value="pos"><POS /></TabsContent>
        <TabsContent value="purchases"><Purchases /></TabsContent>
      </Tabs>
    </div>
  )
}

function Invoices() {
  const { lang } = useApp()
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const load = () => {
    fetch('/api/invoices').then(r => r.json()).then(d => { setInvoices(d); setLoading(false) })
  }
  React.useEffect(load, [])

  if (loading) return <Skeleton className="h-96" />

  const totalSales = invoices.reduce((s, i) => s + i.total, 0)
  const paidAmount = invoices.reduce((s, i) => s + i.paidAmount, 0)
  const unpaidAmount = totalSales - paidAmount

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الفواتير' : 'Total Invoices'}</p><p className="text-xl font-bold">{invoices.length}</p></div></Card>
        <Card className="p-4"><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</p><p className="text-xl font-bold text-emerald-600">{formatCurrency(totalSales)}</p></div></Card>
        <Card className="p-4"><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'المحصل' : 'Collected'}</p><p className="text-xl font-bold text-blue-600">{formatCurrency(paidAmount)}</p></div></Card>
        <Card className="p-4"><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'المتبقي' : 'Outstanding'}</p><p className="text-xl font-bold text-red-600">{formatCurrency(unpaidAmount)}</p></div></Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{t(lang, 'invoices')}</h3>
          <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 ml-1" />{t(lang, 'newInvoice')}</Button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'رقم' : 'No'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'العميل' : 'Customer'}</th>
                <th className="px-4 py-3 text-start">{t(lang, 'date')}</th>
                <th className="px-4 py-3 text-end">{t(lang, 'total')}</th>
                <th className="px-4 py-3 text-end">{lang === 'ar' ? 'مدفوع' : 'Paid'}</th>
                <th className="px-4 py-3 text-center">{t(lang, 'status')}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-semibold text-primary">{inv.invoiceNo}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{inv.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{inv.customer.code}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.date)}</td>
                  <td className="px-4 py-3 text-end font-semibold">{formatCurrency(inv.total)}</td>
                  <td className="px-4 py-3 text-end">{formatCurrency(inv.paidAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={statusVariants[inv.status]}>
                      {inv.status === 'PAID' ? (lang === 'ar' ? 'مدفوعة' : 'Paid') : inv.status === 'UNPAID' ? (lang === 'ar' ? 'غير مدفوعة' : 'Unpaid') : (lang === 'ar' ? 'جزئية' : 'Partial')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <InvoiceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} />
    </div>
  )
}

function InvoiceDialog({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const { lang } = useApp()
  const [customers, setCustomers] = React.useState<{ id: string; name: string; code: string }[]>([])
  const [items, setItems] = React.useState<{ id: string; name: string; sku: string; salePrice: number; qtyOnHand: number }[]>([])
  const [customerId, setCustomerId] = React.useState('')
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0])
  const [lines, setLines] = React.useState<{ itemId: string; quantity: number; price: number; total: number }[]>([])

  React.useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers)
    fetch('/api/items').then(r => r.json()).then(setItems)
  }, [])

  const subtotal = lines.reduce((s, l) => s + l.total, 0)
  const taxAmount = subtotal * 0.15
  const total = subtotal + taxAmount

  const addLine = () => setLines([...lines, { itemId: '', quantity: 1, price: 0, total: 0 }])
  const updateLine = (i: number, patch: any) => {
    const newLines = lines.map((l, j) => {
      if (j !== i) return l
      const updated = { ...l, ...patch }
      if (patch.itemId) {
        const item = items.find(it => it.id === patch.itemId)
        if (item) { updated.price = item.salePrice; updated.total = item.salePrice * updated.quantity }
      }
      if (patch.quantity !== undefined) updated.total = updated.price * updated.quantity
      return updated
    })
    setLines(newLines)
  }
  const removeLine = (i: number) => setLines(lines.filter((_, j) => j !== i))

  const submit = async () => {
    if (!customerId || lines.length === 0) {
      toast.error(lang === 'ar' ? 'اختر عميل وأضف أصناف' : 'Select customer and items')
      return
    }
    const res = await fetch('/api/invoices', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, date, items: lines.filter(l => l.itemId) }),
    })
    if (res.ok) {
      toast.success(lang === 'ar' ? 'تم إنشاء الفاتورة' : 'Invoice created')
      setCustomerId(''); setLines([])
      onSaved(); onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{t(lang, 'newInvoice')}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{lang === 'ar' ? 'العميل' : 'Customer'} *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'اختر' : 'Select'} /></SelectTrigger>
                <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{t(lang, 'date')}</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-start">{t(lang, 'items')}</th>
                  <th className="px-3 py-2 text-end w-24">{t(lang, 'quantity')}</th>
                  <th className="px-3 py-2 text-end w-32">{t(lang, 'price')}</th>
                  <th className="px-3 py-2 text-end w-32">{t(lang, 'total')}</th>
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2">
                      <Select value={l.itemId} onValueChange={v => updateLine(i, { itemId: v })}>
                        <SelectTrigger className="h-8"><SelectValue placeholder={lang === 'ar' ? 'اختر' : 'Select'} /></SelectTrigger>
                        <SelectContent>{items.map(it => <SelectItem key={it.id} value={it.id}>{it.sku} - {it.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2"><Input type="number" className="h-8 text-end" value={l.quantity} onChange={e => updateLine(i, { quantity: parseFloat(e.target.value) || 1 })} /></td>
                    <td className="px-3 py-2"><Input type="number" className="h-8 text-end" value={l.price} onChange={e => updateLine(i, { price: parseFloat(e.target.value) || 0, total: (parseFloat(e.target.value) || 0) * l.quantity })} /></td>
                    <td className="px-3 py-2 text-end font-medium">{formatCurrency(l.total)}</td>
                    <td className="px-3 py-2"><Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeLine(i)}><Trash2 className="h-3 w-3" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="outline" size="sm" onClick={addLine}><Plus className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'إضافة صنف' : 'Add item'}</Button>

          <div className="flex justify-end">
            <div className="w-64 space-y-2 rounded-xl border border-border p-4 bg-muted/30">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{lang === 'ar' ? 'المجموع' : 'Subtotal'}</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{lang === 'ar' ? 'ضريبة 15%' : 'VAT 15%'}</span><span className="font-medium">{formatCurrency(taxAmount)}</span></div>
              <div className="flex justify-between border-t border-border pt-2 font-bold text-base"><span>{t(lang, 'total')}</span><span className="text-primary">{formatCurrency(total)}</span></div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t(lang, 'cancel')}</Button>
          <Button onClick={submit}>{t(lang, 'save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function POS() {
  const { lang } = useApp()
  const [items, setItems] = React.useState<{ id: string; name: string; sku: string; salePrice: number; qtyOnHand: number; category?: { name: string } | null }[]>([])
  const [cart, setCart] = React.useState<{ id: string; name: string; price: number; qty: number }[]>([])
  const [search, setSearch] = React.useState('')

  React.useEffect(() => { fetch('/api/items').then(r => r.json()).then(setItems) }, [])

  const filtered = items.filter(i => i.name.includes(search) || i.sku.toLowerCase().includes(search.toLowerCase()))
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0)
  const tax = subtotal * 0.15
  const total = subtotal + tax

  const addToCart = (item: any) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { id: item.id, name: item.name, price: item.salePrice, qty: 1 }]
    })
  }
  const updateQty = (id: string, qty: number) => setCart(cart.map(c => c.id === id ? { ...c, qty: Math.max(1, qty) } : c))
  const removeFromCart = (id: string) => setCart(cart.filter(c => c.id !== id))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products */}
      <Card className="lg:col-span-2 p-6">
        <div className="mb-4">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t(lang, 'search')} className="h-11" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto">
          {filtered.map(item => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="rounded-xl border-2 border-border p-3 text-start hover:border-primary/40 hover:bg-muted/30 transition-all"
            >
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary mb-2 font-bold text-xs">
                {item.sku.split('-')[1]}
              </div>
              <p className="text-sm font-medium line-clamp-2 h-10">{item.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{lang === 'ar' ? 'متوفر' : 'In stock'}: {item.qtyOnHand}</p>
              <p className="text-base font-bold text-primary mt-1">{formatCurrency(item.salePrice)}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Cart */}
      <Card className="p-6 flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> {lang === 'ar' ? 'السلة' : 'Cart'}</h3>
          {cart.length > 0 && <Button size="sm" variant="ghost" onClick={() => setCart([])}>{lang === 'ar' ? 'تفريغ' : 'Clear'}</Button>}
        </div>
        <div className="flex-1 max-h-[400px] overflow-y-auto space-y-2 mb-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">{lang === 'ar' ? 'السلة فارغة' : 'Cart is empty'}</p>
            </div>
          ) : cart.map(c => (
            <div key={c.id} className="rounded-lg border border-border p-3">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium">{c.name}</p>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(c.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(c.id, c.qty - 1)}>−</Button>
                  <Input type="number" value={c.qty} onChange={e => updateQty(c.id, parseInt(e.target.value) || 1)} className="h-7 w-12 text-center px-1" />
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(c.id, c.qty + 1)}>+</Button>
                </div>
                <span className="font-bold text-primary">{formatCurrency(c.price * c.qty)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">{lang === 'ar' ? 'المجموع' : 'Subtotal'}</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">VAT 15%</span><span>{formatCurrency(tax)}</span></div>
          <div className="flex justify-between text-lg font-bold border-t border-border pt-2"><span>{t(lang, 'total')}</span><span className="text-primary">{formatCurrency(total)}</span></div>
          <Button className="w-full h-12 mt-2 text-base" disabled={cart.length === 0} onClick={() => { toast.success(lang === 'ar' ? 'تم إنشاء البيع' : 'Sale completed'); setCart([]) }}>
            <Printer className="h-5 w-5 ml-2" /> {lang === 'ar' ? 'إتمام البيع' : 'Complete Sale'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

function Purchases() {
  const { lang } = useApp()
  const [purchases, setPurchases] = React.useState<Purchase[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/purchases').then(r => r.json()).then(d => { setPurchases(d); setLoading(false) })
  }, [])

  if (loading) return <Skeleton className="h-96" />

  const total = purchases.reduce((s, p) => s + p.total, 0)

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{t(lang, 'purchases')}</h3>
          <p className="text-sm text-muted-foreground">{purchases.length} {lang === 'ar' ? 'فاتورة شراء' : 'purchases'}</p>
        </div>
        <div className="text-end">
          <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الإجمالي' : 'Total'}</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(total)}</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-start">{lang === 'ar' ? 'رقم' : 'No'}</th>
              <th className="px-4 py-3 text-start">{lang === 'ar' ? 'المورد' : 'Supplier'}</th>
              <th className="px-4 py-3 text-start">{t(lang, 'date')}</th>
              <th className="px-4 py-3 text-end">{t(lang, 'total')}</th>
              <th className="px-4 py-3 text-center">{t(lang, 'status')}</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-mono font-semibold text-primary">{p.purchaseNo}</td>
                <td className="px-4 py-3 font-medium">{p.supplier.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(p.date)}</td>
                <td className="px-4 py-3 text-end font-semibold">{formatCurrency(p.total)}</td>
                <td className="px-4 py-3 text-center"><Badge variant={statusVariants[p.status]}>{p.status === 'PAID' ? (lang === 'ar' ? 'مدفوعة' : 'Paid') : (lang === 'ar' ? 'غير مدفوعة' : 'Unpaid')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
