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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Wallet, Landmark, Plus, ArrowRightLeft, TrendingUp, Search, Download, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { exportExcel } from '@/components/erp/export-utils'

type Cash = { id: string; code: string; name: string; balance: number; currency: string; isActive: boolean }
type Bank = { id: string; code: string; bankName: string; accountNo: string; iban: string | null; balance: number; currency: string; isActive: boolean }
type Transaction = {
  id: string; type: string; cashId: string | null; bankId: string | null
  toCashId: string | null; toBankId: string | null
  amount: number; date: string; description: string | null
  refType: string | null; refId: string | null
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(n) + ' ج.م'
}
function formatDate(s: string) { return new Date(s).toLocaleDateString('ar-EG') }

export function Treasury() {
  const { lang, hasPermission } = useApp()
  const [tab, setTab] = React.useState('cash')

  return (
    <div className="space-y-4 animate-fade-in">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cash" className="flex items-center gap-2"><Wallet className="h-4 w-4" /> {lang === 'ar' ? 'الخزائن' : 'Cash'}</TabsTrigger>
          <TabsTrigger value="banks" className="flex items-center gap-2"><Landmark className="h-4 w-4" /> {lang === 'ar' ? 'البنوك' : 'Banks'}</TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2"><ArrowRightLeft className="h-4 w-4" /> {lang === 'ar' ? 'الحركات' : 'Transactions'}</TabsTrigger>
        </TabsList>
        <TabsContent value="cash"><CashTab hasPermission={hasPermission} lang={lang} /></TabsContent>
        <TabsContent value="banks"><BanksTab hasPermission={hasPermission} lang={lang} /></TabsContent>
        <TabsContent value="transactions"><TransactionsTab hasPermission={hasPermission} lang={lang} /></TabsContent>
      </Tabs>
    </div>
  )
}

function CashTab({ hasPermission, lang }: { hasPermission: (p: string) => boolean; lang: 'ar' | 'en' }) {
  const [cash, setCash] = React.useState<Cash[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const load = () => { fetch('/api/cash').then(r => r.json()).then(d => { setCash(d); setLoading(false) }) }
  React.useEffect(load, [])

  if (loading) return <Skeleton className="h-96" />
  const total = cash.reduce((s, c) => s + c.balance, 0)

  return (
    <div className="space-y-4">
      <Card className="p-4 gradient-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div><p className="text-xs opacity-80">{lang === 'ar' ? 'إجمالي النقدية' : 'Total Cash'}</p><p className="text-2xl font-extrabold">{formatMoney(total)}</p></div>
          <Wallet className="h-10 w-10 opacity-60" />
        </div>
      </Card>

      <div className="flex justify-end">
        {hasPermission('treasury.create') && <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'خزينة جديدة' : 'New Cash'}</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cash.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground"><Wallet className="h-12 w-12 mx-auto mb-2 opacity-30" />{lang === 'ar' ? 'لا توجد خزائن' : 'No cash boxes'}</div>
        ) : cash.map(c => (
          <Card key={c.id} className="p-5 card-lift">
            <div className="flex items-start justify-between mb-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary text-primary-foreground"><Wallet className="h-6 w-6" /></div>
              <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
            </div>
            <h4 className="font-bold text-lg">{c.name}</h4>
            <p className="text-sm text-muted-foreground mb-3">{c.currency}</p>
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الرصيد' : 'Balance'}</p>
              <p className="text-2xl font-bold text-emerald-600">{formatMoney(c.balance)}</p>
            </div>
          </Card>
        ))}
      </div>

      <SimpleDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={load}
        title={lang === 'ar' ? 'خزينة جديدة' : 'New Cash Box'}
        lang={lang}
        fields={[
          { key: 'code', label: lang === 'ar' ? 'الرمز' : 'Code', required: true },
          { key: 'name', label: lang === 'ar' ? 'الاسم' : 'Name', required: true },
          { key: 'balance', label: lang === 'ar' ? 'الرصيد الافتتاحي' : 'Opening Balance', type: 'number' },
        ]}
        endpoint="/api/cash"
      />
    </div>
  )
}

function BanksTab({ hasPermission, lang }: { hasPermission: (p: string) => boolean; lang: 'ar' | 'en' }) {
  const [banks, setBanks] = React.useState<Bank[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const load = () => { fetch('/api/banks').then(r => r.json()).then(d => { setBanks(d); setLoading(false) }) }
  React.useEffect(load, [])

  if (loading) return <Skeleton className="h-96" />
  const total = banks.reduce((s, b) => s + b.balance, 0)

  return (
    <div className="space-y-4">
      <Card className="p-4 gradient-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div><p className="text-xs opacity-80">{lang === 'ar' ? 'إجمالي البنوك' : 'Total Banks'}</p><p className="text-2xl font-extrabold">{formatMoney(total)}</p></div>
          <Landmark className="h-10 w-10 opacity-60" />
        </div>
      </Card>

      <div className="flex justify-end">
        {hasPermission('treasury.create') && <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'حساب بنكي جديد' : 'New Bank'}</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banks.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground"><Landmark className="h-12 w-12 mx-auto mb-2 opacity-30" />{lang === 'ar' ? 'لا توجد حسابات بنكية' : 'No bank accounts'}</div>
        ) : banks.map(b => (
          <Card key={b.id} className="p-5 card-lift">
            <div className="flex items-start justify-between mb-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white"><Landmark className="h-6 w-6" /></div>
              <span className="font-mono text-xs text-muted-foreground">{b.code}</span>
            </div>
            <h4 className="font-bold text-lg">{b.bankName}</h4>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'رقم الحساب' : 'Account'}</span><span className="font-mono">{b.accountNo}</span></div>
              {b.iban && <div className="flex justify-between"><span className="text-muted-foreground">IBAN</span><span className="font-mono text-xs">{b.iban}</span></div>}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الرصيد' : 'Balance'}</p>
              <p className="text-2xl font-bold text-blue-600">{formatMoney(b.balance)}</p>
            </div>
          </Card>
        ))}
      </div>

      <SimpleDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={load}
        title={lang === 'ar' ? 'حساب بنكي جديد' : 'New Bank Account'}
        lang={lang}
        fields={[
          { key: 'code', label: lang === 'ar' ? 'الرمز' : 'Code', required: true },
          { key: 'bankName', label: lang === 'ar' ? 'اسم البنك' : 'Bank Name', required: true },
          { key: 'accountNo', label: lang === 'ar' ? 'رقم الحساب' : 'Account No' },
          { key: 'iban', label: 'IBAN' },
          { key: 'balance', label: lang === 'ar' ? 'الرصيد الافتتاحي' : 'Opening Balance', type: 'number' },
        ]}
        endpoint="/api/banks"
      />
    </div>
  )
}

function TransactionsTab({ hasPermission, lang }: { hasPermission: (p: string) => boolean; lang: 'ar' | 'en' }) {
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [cash, setCash] = React.useState<Cash[]>([])
  const [banks, setBanks] = React.useState<Bank[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const load = () => {
    Promise.all([
      fetch('/api/transactions').then(r => r.json()),
      fetch('/api/cash').then(r => r.json()),
      fetch('/api/banks').then(r => r.json()),
    ]).then(([t, c, b]) => { setTransactions(t); setCash(c); setBanks(b); setLoading(false) })
  }
  React.useEffect(load, [])

  const filtered = transactions.filter(t =>
    !search || (t.description || '').includes(search) || t.type.includes(search)
  )

  const handleExport = () => {
    exportExcel({
      filename: 'transactions.xlsx',
      sheets: [{
        name: 'Transactions',
        columns: ['Date', 'Type', 'Amount', 'Description', 'Reference'],
        rows: filtered.map(t => [formatDate(t.date), t.type, t.amount, t.description || '', t.refType || ''])
      }]
    })
    toast.success(lang === 'ar' ? 'تم التصدير' : 'Exported')
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" style={{ right: 12 }} />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t(lang, 'search')} className="h-10 pr-9" />
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 ml-1" /> Excel</Button>
        <div className="flex-1" />
        {hasPermission('treasury.create') && <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'حركة جديدة' : 'New Transaction'}</Button>}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-start">{t(lang, 'date')}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'النوع' : 'Type'}</th>
                <th className="px-4 py-3 text-end">{t(lang, 'amount')}</th>
                <th className="px-4 py-3 text-start">{t(lang, 'description')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground"><ArrowRightLeft className="h-12 w-12 mx-auto mb-2 opacity-30" />{lang === 'ar' ? 'لا توجد حركات' : 'No transactions'}</td></tr>
              ) : filtered.map(tr => (
                <tr key={tr.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-xs">{formatDate(tr.date)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={tr.type === 'RECEIPT' ? 'default' : tr.type === 'PAYMENT' ? 'destructive' : 'secondary'} className="flex items-center gap-1 w-fit">
                      {tr.type === 'RECEIPT' && <ArrowDownCircle className="h-3 w-3" />}
                      {tr.type === 'PAYMENT' && <ArrowUpCircle className="h-3 w-3" />}
                      {tr.type === 'TRANSFER' && <ArrowRightLeft className="h-3 w-3" />}
                      {tr.type}
                    </Badge>
                  </td>
                  <td className={`px-4 py-3 text-end font-bold ${tr.type === 'PAYMENT' ? 'text-red-600' : tr.type === 'RECEIPT' ? 'text-emerald-600' : ''}`}>
                    {tr.type === 'PAYMENT' ? '-' : tr.type === 'RECEIPT' ? '+' : ''}{formatMoney(tr.amount)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{tr.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <TransactionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} cash={cash} banks={banks} lang={lang} />
    </div>
  )
}

function SimpleDialog({ open, onClose, onSaved, title, fields, endpoint, lang }: {
  open: boolean; onClose: () => void; onSaved: () => void; title: string
  fields: { key: string; label: string; type?: string; required?: boolean }[]
  endpoint: string; lang: 'ar' | 'en'
}) {
  const [form, setForm] = React.useState<any>({})
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      const init: any = {}
      fields.forEach(f => init[f.key] = '')
      setForm(init)
    }
  }, [open])

  const submit = async () => {
    if (submitting) return
    const required = fields.filter(f => f.required)
    for (const f of required) {
      if (!form[f.key]) { toast.error(`${f.label} ${lang === 'ar' ? 'مطلوب' : 'required'}`); return }
    }
    setSubmitting(true)
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { toast.success(lang === 'ar' ? 'تمت الإضافة' : 'Added'); onSaved(); onClose() }
      else { const e = await res.json(); toast.error(e.error || 'Error') }
    } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-4">
          {fields.map(f => (
            <div key={f.key}>
              <Label>{f.label} {f.required && '*'}</Label>
              <Input
                type={f.type || 'text'}
                value={form[f.key] || ''}
                onChange={e => setForm({ ...form, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
                dir={f.key === 'code' || f.key === 'accountNo' || f.key === 'iban' ? 'ltr' : undefined}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
          <Button onClick={submit} disabled={submitting}>{submitting ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TransactionDialog({ open, onClose, onSaved, cash, banks, lang }: {
  open: boolean; onClose: () => void; onSaved: () => void
  cash: Cash[]; banks: Bank[]; lang: 'ar' | 'en'
}) {
  const [form, setForm] = React.useState<any>({ type: 'RECEIPT', amount: 0, description: '', sourceType: 'cash', sourceId: '', destType: 'cash', destId: '' })
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) setForm({ type: 'RECEIPT', amount: 0, description: '', sourceType: 'cash', sourceId: '', destType: 'cash', destId: '' })
  }, [open])

  const submit = async () => {
    if (submitting) return
    if (form.amount <= 0) { toast.error(lang === 'ar' ? 'المبلغ يجب أن يكون أكبر من صفر' : 'Amount must be > 0'); return }
    if (!form.sourceId) { toast.error(lang === 'ar' ? 'حدد المصدر' : 'Select source'); return }
    if (form.type === 'TRANSFER' && !form.destId) { toast.error(lang === 'ar' ? 'حدد الوجهة' : 'Select destination'); return }

    setSubmitting(true)
    try {
      const body: any = {
        type: form.type,
        amount: form.amount,
        description: form.description,
        cashId: form.sourceType === 'cash' ? form.sourceId : null,
        bankId: form.sourceType === 'bank' ? form.sourceId : null,
      }
      if (form.type === 'TRANSFER') {
        body.toCashId = form.destType === 'cash' ? form.destId : null
        body.toBankId = form.destType === 'bank' ? form.destId : null
      }
      const res = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { toast.success(lang === 'ar' ? 'تمت الحركة' : 'Transaction created'); onSaved(); onClose() }
      else { const e = await res.json(); toast.error(e.error || 'Error') }
    } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{lang === 'ar' ? 'حركة مالية جديدة' : 'New Transaction'}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-4">
          <div>
            <Label>{lang === 'ar' ? 'نوع الحركة' : 'Type'}</Label>
            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RECEIPT">{lang === 'ar' ? 'إيصال قبض' : 'Receipt'}</SelectItem>
                <SelectItem value="PAYMENT">{lang === 'ar' ? 'إيصال صرف' : 'Payment'}</SelectItem>
                <SelectItem value="TRANSFER">{lang === 'ar' ? 'تحويل' : 'Transfer'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>{t(lang, 'amount')} *</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{lang === 'ar' ? 'نوع المصدر' : 'Source Type'}</Label>
              <Select value={form.sourceType} onValueChange={v => setForm({ ...form, sourceType: v, sourceId: '' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{lang === 'ar' ? 'خزينة' : 'Cash'}</SelectItem>
                  <SelectItem value="bank">{lang === 'ar' ? 'بنك' : 'Bank'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{lang === 'ar' ? 'المصدر' : 'Source'}</Label>
              <Select value={form.sourceId || '_none'} onValueChange={v => setForm({ ...form, sourceId: v === '_none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'اختر' : 'Select'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">{lang === 'ar' ? 'اختر' : 'Select'}</SelectItem>
                  {form.sourceType === 'cash'
                    ? cash.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)
                    : banks.map(b => <SelectItem key={b.id} value={b.id}>{b.code} - {b.bankName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {form.type === 'TRANSFER' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{lang === 'ar' ? 'نوع الوجهة' : 'Dest Type'}</Label>
                <Select value={form.destType} onValueChange={v => setForm({ ...form, destType: v, destId: '' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{lang === 'ar' ? 'خزينة' : 'Cash'}</SelectItem>
                    <SelectItem value="bank">{lang === 'ar' ? 'بنك' : 'Bank'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{lang === 'ar' ? 'الوجهة' : 'Destination'}</Label>
                <Select value={form.destId || '_none'} onValueChange={v => setForm({ ...form, destId: v === '_none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'اختر' : 'Select'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">{lang === 'ar' ? 'اختر' : 'Select'}</SelectItem>
                    {form.destType === 'cash'
                      ? cash.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)
                      : banks.map(b => <SelectItem key={b.id} value={b.id}>{b.code} - {b.bankName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div><Label>{t(lang, 'description')}</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
          <Button onClick={submit} disabled={submitting}>{submitting ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
