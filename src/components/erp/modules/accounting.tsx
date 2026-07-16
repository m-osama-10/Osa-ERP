'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, FileText, BookOpen, Scale, TrendingUp, Wallet, Building2 } from 'lucide-react'
import { toast } from 'sonner'

type Account = {
  id: string
  code: string
  name: string
  nameEn: string | null
  type: string
  parentId: string | null
  balance: number
  isActive: boolean
}

type JournalEntry = {
  id: string
  entryNo: string
  date: string
  description: string
  totalDebit: number
  totalCredit: number
  status: string
  lines: { id: string; accountId: string; account: Account; debit: number; credit: number; description: string | null }[]
}

const typeColors: Record<string, string> = {
  ASSET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  LIABILITY: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  EQUITY: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  REVENUE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  EXPENSE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

const typeLabels: Record<string, { ar: string; en: string }> = {
  ASSET: { ar: 'أصول', en: 'Assets' },
  LIABILITY: { ar: 'خصوم', en: 'Liabilities' },
  EQUITY: { ar: 'حقوق ملكية', en: 'Equity' },
  REVENUE: { ar: 'إيرادات', en: 'Revenue' },
  EXPENSE: { ar: 'مصروفات', en: 'Expenses' },
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(n)
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function Accounting() {
  const { lang } = useApp()
  const [tab, setTab] = React.useState('accounts')

  return (
    <div className="space-y-6 animate-in-fade">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
          <TabsTrigger value="accounts" className="flex flex-col items-center gap-1 py-2">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs">{t(lang, 'chartOfAccounts')}</span>
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex flex-col items-center gap-1 py-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs">{t(lang, 'journalEntries')}</span>
          </TabsTrigger>
          <TabsTrigger value="trial" className="flex flex-col items-center gap-1 py-2">
            <Scale className="h-4 w-4" />
            <span className="text-xs">{t(lang, 'trialBalance')}</span>
          </TabsTrigger>
          <TabsTrigger value="income" className="flex flex-col items-center gap-1 py-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">{t(lang, 'incomeStatement')}</span>
          </TabsTrigger>
          <TabsTrigger value="balance" className="flex flex-col items-center gap-1 py-2">
            <Building2 className="h-4 w-4" />
            <span className="text-xs">{t(lang, 'balanceSheet')}</span>
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex flex-col items-center gap-1 py-2">
            <Wallet className="h-4 w-4" />
            <span className="text-xs">{t(lang, 'cashFlow')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts"><ChartOfAccounts /></TabsContent>
        <TabsContent value="journal"><JournalEntries /></TabsContent>
        <TabsContent value="trial"><TrialBalance /></TabsContent>
        <TabsContent value="income"><IncomeStatement /></TabsContent>
        <TabsContent value="balance"><BalanceSheet /></TabsContent>
        <TabsContent value="cashflow"><CashFlow /></TabsContent>
      </Tabs>
    </div>
  )
}

// =============== Chart of Accounts ===============
function ChartOfAccounts() {
  const { lang } = useApp()
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const load = () => {
    fetch('/api/accounts').then(r => r.json()).then(d => { setAccounts(d); setLoading(false) })
  }
  React.useEffect(load, [])

  if (loading) return <Skeleton className="h-96" />

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{t(lang, 'chartOfAccounts')}</h3>
          <p className="text-sm text-muted-foreground">{accounts.length} {lang === 'ar' ? 'حساب' : 'accounts'}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-1" />
          {t(lang, 'add')}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start font-medium">{t(lang, 'code')}</th>
              <th className="px-4 py-3 text-start font-medium">{t(lang, 'name')}</th>
              <th className="px-4 py-3 text-start font-medium">{t(lang, 'type')}</th>
              <th className="px-4 py-3 text-end font-medium">{t(lang, 'balance')}</th>
              <th className="px-4 py-3 text-center font-medium">{t(lang, 'status')}</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(a => (
              <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-mono font-semibold">{a.code}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{lang === 'ar' ? a.name : (a.nameEn || a.name)}</p>
                  <p className="text-xs text-muted-foreground">{a.nameEn}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${typeColors[a.type]}`}>
                    {typeLabels[a.type]?.[lang] || a.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-end font-semibold">{formatCurrency(a.balance)}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={a.isActive ? 'default' : 'secondary'}>
                    {a.isActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'متوقف' : 'Inactive')}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddAccountDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} parents={accounts} />
    </Card>
  )
}

function AddAccountDialog({ open, onClose, onSaved, parents }: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  parents: Account[]
}) {
  const { lang } = useApp()
  const [form, setForm] = React.useState({ code: '', name: '', nameEn: '', type: 'ASSET', parentId: '', balance: 0 })

  const submit = async () => {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, parentId: form.parentId || null }),
    })
    if (res.ok) {
      toast.success(lang === 'ar' ? 'تمت إضافة الحساب' : 'Account added')
      setForm({ code: '', name: '', nameEn: '', type: 'ASSET', parentId: '', balance: 0 })
      onSaved()
      onClose()
    } else {
      toast.error(lang === 'ar' ? 'فشل الإضافة' : 'Failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(lang, 'add')} - {t(lang, 'account')}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div><Label>{t(lang, 'code')}</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="1100" /></div>
          <div>
            <Label>{t(lang, 'type')}</Label>
            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v[lang]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>{t(lang, 'name')}</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>{t(lang, 'nameEn')}</Label><Input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} dir="ltr" /></div>
          <div>
            <Label>{lang === 'ar' ? 'الحساب الأب' : 'Parent Account'}</Label>
            <Select value={form.parentId} onValueChange={v => setForm({ ...form, parentId: v })}>
              <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'بدون' : 'None'} /></SelectTrigger>
              <SelectContent>
                {parents.map(p => <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>{t(lang, 'balance')}</Label><Input type="number" value={form.balance} onChange={e => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t(lang, 'cancel')}</Button>
          <Button onClick={submit}>{t(lang, 'save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// =============== Journal Entries ===============
function JournalEntries() {
  const { lang } = useApp()
  const [entries, setEntries] = React.useState<JournalEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [accounts, setAccounts] = React.useState<Account[]>([])

  const load = () => {
    fetch('/api/journal').then(r => r.json()).then(d => { setEntries(d); setLoading(false) })
  }
  React.useEffect(() => {
    load()
    fetch('/api/accounts').then(r => r.json()).then(setAccounts)
  }, [])

  if (loading) return <Skeleton className="h-96" />

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{t(lang, 'journalEntries')}</h3>
          <p className="text-sm text-muted-foreground">{entries.length} {lang === 'ar' ? 'قيد' : 'entries'}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-1" />
          {t(lang, 'newEntry')}
        </Button>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {entries.map(e => (
          <div key={e.id} className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between bg-muted/40 p-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-primary">{e.entryNo}</span>
                <span className="text-sm text-muted-foreground">{formatDate(e.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{e.status}</Badge>
                <span className="text-sm font-semibold">{formatCurrency(e.totalDebit)}</span>
              </div>
            </div>
            <div className="p-3">
              <p className="mb-2 text-sm font-medium">{e.description}</p>
              <table className="w-full text-xs">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="text-start py-1">{t(lang, 'account')}</th>
                    <th className="text-end py-1">{t(lang, 'debit')}</th>
                    <th className="text-end py-1">{t(lang, 'credit')}</th>
                  </tr>
                </thead>
                <tbody>
                  {e.lines.map(l => (
                    <tr key={l.id} className="border-t border-border">
                      <td className="py-1.5"><span className="font-mono text-muted-foreground">{l.account.code}</span> {l.account.name}</td>
                      <td className="text-end font-medium">{l.debit > 0 ? formatCurrency(l.debit) : '-'}</td>
                      <td className="text-end font-medium">{l.credit > 0 ? formatCurrency(l.credit) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <AddJournalDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} accounts={accounts} />
    </Card>
  )
}

function AddJournalDialog({ open, onClose, onSaved, accounts }: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  accounts: Account[]
}) {
  const { lang } = useApp()
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = React.useState('')
  const [lines, setLines] = React.useState<{ accountId: string; debit: number; credit: number }[]>([
    { accountId: '', debit: 0, credit: 0 },
    { accountId: '', debit: 0, credit: 0 },
  ])

  const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0

  const submit = async () => {
    if (!isBalanced) {
      toast.error(lang === 'ar' ? 'مدين ودائن غير متوازنين' : 'Not balanced')
      return
    }
    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, description, lines: lines.filter(l => l.accountId) }),
    })
    if (res.ok) {
      toast.success(lang === 'ar' ? 'تم إضافة القيد' : 'Entry added')
      setDescription('')
      setLines([{ accountId: '', debit: 0, credit: 0 }, { accountId: '', debit: 0, credit: 0 }])
      onSaved()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t(lang, 'newEntry')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>{t(lang, 'date')}</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
            <div><Label>{t(lang, 'description')}</Label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-start">{t(lang, 'account')}</th>
                  <th className="px-3 py-2 text-end w-32">{t(lang, 'debit')}</th>
                  <th className="px-3 py-2 text-end w-32">{t(lang, 'credit')}</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2">
                      <Select value={l.accountId} onValueChange={v => setLines(lines.map((x, j) => j === i ? { ...x, accountId: v } : x))}>
                        <SelectTrigger className="h-8"><SelectValue placeholder={lang === 'ar' ? 'اختر الحساب' : 'Select account'} /></SelectTrigger>
                        <SelectContent>
                          {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2"><Input type="number" className="h-8 text-end" value={l.debit} onChange={e => setLines(lines.map((x, j) => j === i ? { ...x, debit: parseFloat(e.target.value) || 0, credit: 0 } : x))} /></td>
                    <td className="px-3 py-2"><Input type="number" className="h-8 text-end" value={l.credit} onChange={e => setLines(lines.map((x, j) => j === i ? { ...x, credit: parseFloat(e.target.value) || 0, debit: 0 } : x))} /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/30 font-semibold">
                <tr>
                  <td className="px-3 py-2">{t(lang, 'total')}</td>
                  <td className="px-3 py-2 text-end">{formatCurrency(totalDebit)}</td>
                  <td className="px-3 py-2 text-end">{formatCurrency(totalCredit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setLines([...lines, { accountId: '', debit: 0, credit: 0 }])}>
              <Plus className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'سطر جديد' : 'Add line'}
            </Button>
            <Badge variant={isBalanced ? 'default' : 'destructive'}>
              {isBalanced ? '✓ ' + (lang === 'ar' ? 'متوازن' : 'Balanced') : (lang === 'ar' ? 'غير متوازن' : 'Not balanced')}
            </Badge>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t(lang, 'cancel')}</Button>
          <Button onClick={submit} disabled={!isBalanced}>{t(lang, 'save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// =============== Trial Balance ===============
function TrialBalance() {
  const { lang } = useApp()
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/accounts').then(r => r.json()).then(d => { setAccounts(d); setLoading(false) })
  }, [])

  if (loading) return <Skeleton className="h-96" />

  const totalDebit = accounts.filter(a => ['ASSET', 'EXPENSE'].includes(a.type)).reduce((s, a) => s + a.balance, 0)
  const totalCredit = accounts.filter(a => ['LIABILITY', 'EQUITY', 'REVENUE'].includes(a.type)).reduce((s, a) => s + a.balance, 0)

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">{t(lang, 'trialBalance')}</h3>
        <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'كشف بأرصدة الحسابات' : 'Account balances statement'}</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-start">{t(lang, 'code')}</th>
              <th className="px-4 py-3 text-start">{t(lang, 'account')}</th>
              <th className="px-4 py-3 text-start">{t(lang, 'type')}</th>
              <th className="px-4 py-3 text-end">{t(lang, 'debit')}</th>
              <th className="px-4 py-3 text-end">{t(lang, 'credit')}</th>
            </tr>
          </thead>
          <tbody>
            {accounts.filter(a => a.balance > 0).map(a => (
              <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-mono">{a.code}</td>
                <td className="px-4 py-3 font-medium">{a.name}</td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${typeColors[a.type]}`}>{typeLabels[a.type]?.[lang]}</span></td>
                <td className="px-4 py-3 text-end font-medium">{['ASSET', 'EXPENSE'].includes(a.type) ? formatCurrency(a.balance) : '-'}</td>
                <td className="px-4 py-3 text-end font-medium">{['LIABILITY', 'EQUITY', 'REVENUE'].includes(a.type) ? formatCurrency(a.balance) : '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-primary/10 font-bold">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-end">{t(lang, 'total')}</td>
              <td className="px-4 py-3 text-end">{formatCurrency(totalDebit)}</td>
              <td className="px-4 py-3 text-end">{formatCurrency(totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  )
}

// =============== Income Statement ===============
function IncomeStatement() {
  const { lang } = useApp()
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/accounts').then(r => r.json()).then(d => { setAccounts(d); setLoading(false) })
  }, [])

  if (loading) return <Skeleton className="h-96" />

  const revenues = accounts.filter(a => a.type === 'REVENUE' && a.balance > 0)
  const expenses = accounts.filter(a => a.type === 'EXPENSE' && a.balance > 0)
  const totalRev = revenues.reduce((s, a) => s + a.balance, 0)
  const totalExp = expenses.reduce((s, a) => s + a.balance, 0)
  const netProfit = totalRev - totalExp

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">{t(lang, 'incomeStatement')}</h3>
        <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'قائمة الدخل للفترة' : 'Period Income Statement'}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenues */}
        <div>
          <h4 className="mb-3 font-semibold text-emerald-600">{lang === 'ar' ? 'الإيرادات' : 'Revenues'}</h4>
          <div className="space-y-2">
            {revenues.map(a => (
              <div key={a.id} className="flex justify-between rounded-lg border border-border p-3">
                <span className="text-sm">{a.name}</span>
                <span className="font-semibold">{formatCurrency(a.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 font-bold">
              <span>{lang === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</span>
              <span>{formatCurrency(totalRev)}</span>
            </div>
          </div>
        </div>
        {/* Expenses */}
        <div>
          <h4 className="mb-3 font-semibold text-red-600">{lang === 'ar' ? 'المصروفات' : 'Expenses'}</h4>
          <div className="space-y-2">
            {expenses.map(a => (
              <div key={a.id} className="flex justify-between rounded-lg border border-border p-3">
                <span className="text-sm">{a.name}</span>
                <span className="font-semibold">{formatCurrency(a.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between rounded-lg bg-red-50 dark:bg-red-950/30 p-3 font-bold">
              <span>{lang === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}</span>
              <span>{formatCurrency(totalExp)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={`mt-6 flex items-center justify-between rounded-xl p-5 ${netProfit >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
        <div>
          <p className="text-sm opacity-80">{lang === 'ar' ? 'صافي الربح / الخسارة' : 'Net Profit / Loss'}</p>
          <p className="text-2xl font-extrabold">{formatCurrency(netProfit)}</p>
        </div>
        <TrendingUp className={`h-10 w-10 ${netProfit < 0 ? 'rotate-180' : ''}`} />
      </div>
    </Card>
  )
}

// =============== Balance Sheet ===============
function BalanceSheet() {
  const { lang } = useApp()
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/accounts').then(r => r.json()).then(d => { setAccounts(d); setLoading(false) })
  }, [])

  if (loading) return <Skeleton className="h-96" />

  const assets = accounts.filter(a => a.type === 'ASSET' && a.balance > 0)
  const liabilities = accounts.filter(a => a.type === 'LIABILITY' && a.balance > 0)
  const equity = accounts.filter(a => a.type === 'EQUITY' && a.balance > 0)
  const totalAssets = assets.reduce((s, a) => s + a.balance, 0)
  const totalLiab = liabilities.reduce((s, a) => s + a.balance, 0)
  const totalEq = equity.reduce((s, a) => s + a.balance, 0)

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">{t(lang, 'balanceSheet')}</h3>
        <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'المركز المالي للشركة' : 'Financial Position'}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="mb-3 font-semibold text-emerald-600">{lang === 'ar' ? 'الأصول' : 'Assets'}</h4>
          <div className="space-y-2">
            {assets.map(a => (
              <div key={a.id} className="flex justify-between rounded-lg border border-border p-3">
                <span className="text-sm">{a.name}</span>
                <span className="font-semibold">{formatCurrency(a.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 font-bold">
              <span>{lang === 'ar' ? 'إجمالي الأصول' : 'Total Assets'}</span>
              <span>{formatCurrency(totalAssets)}</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-red-600">{lang === 'ar' ? 'الخصوم' : 'Liabilities'}</h4>
          <div className="space-y-2">
            {liabilities.map(a => (
              <div key={a.id} className="flex justify-between rounded-lg border border-border p-3">
                <span className="text-sm">{a.name}</span>
                <span className="font-semibold">{formatCurrency(a.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between rounded-lg bg-red-50 dark:bg-red-950/30 p-3 font-bold">
              <span>{lang === 'ar' ? 'إجمالي الخصوم' : 'Total Liabilities'}</span>
              <span>{formatCurrency(totalLiab)}</span>
            </div>
          </div>
          <h4 className="mt-4 mb-3 font-semibold text-purple-600">{lang === 'ar' ? 'حقوق الملكية' : 'Equity'}</h4>
          <div className="space-y-2">
            {equity.map(a => (
              <div key={a.id} className="flex justify-between rounded-lg border border-border p-3">
                <span className="text-sm">{a.name}</span>
                <span className="font-semibold">{formatCurrency(a.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between rounded-lg bg-purple-50 dark:bg-purple-950/30 p-3 font-bold">
              <span>{lang === 'ar' ? 'إجمالي حقوق الملكية' : 'Total Equity'}</span>
              <span>{formatCurrency(totalEq)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// =============== Cash Flow ===============
function CashFlow() {
  const { lang } = useApp()
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/accounts').then(r => r.json()).then(d => { setAccounts(d); setLoading(false) })
  }, [])

  if (loading) return <Skeleton className="h-96" />

  const operatingCash = accounts.filter(a => ['4100', '5100', '5200', '5300', '5400'].includes(a.code)).reduce((s, a) => s + a.balance, 0)
  const investingCash = accounts.filter(a => ['1201', '1202'].includes(a.code)).reduce((s, a) => s + a.balance, 0)
  const financingCash = accounts.filter(a => ['3100'].includes(a.code)).reduce((s, a) => s + a.balance, 0)
  const netCash = operatingCash - investingCash + financingCash

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">{t(lang, 'cashFlow')}</h3>
        <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'قائمة التدفقات النقدية' : 'Cash Flow Statement'}</p>
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">{lang === 'ar' ? 'الأنشطة التشغيلية' : 'Operating Activities'}</h4>
            <span className={`font-bold ${operatingCash >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(operatingCash)}</span>
          </div>
          <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الإيرادات ناقص المصروفات التشغيلية' : 'Revenue minus operating expenses'}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">{lang === 'ar' ? 'الأنشطة الاستثمارية' : 'Investing Activities'}</h4>
            <span className={`font-bold ${investingCash <= 0 ? 'text-red-600' : 'text-emerald-600'}`}>-{formatCurrency(investingCash)}</span>
          </div>
          <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'شراء الأصول الثابتة' : 'Purchase of fixed assets'}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">{lang === 'ar' ? 'الأنشطة التمويلية' : 'Financing Activities'}</h4>
            <span className={`font-bold ${financingCash >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(financingCash)}</span>
          </div>
          <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'زيادة رأس المال' : 'Capital increase'}</p>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-primary p-5 text-primary-foreground">
          <div>
            <p className="text-sm opacity-90">{lang === 'ar' ? 'صافي التدفق النقدي' : 'Net Cash Flow'}</p>
            <p className="text-2xl font-extrabold">{formatCurrency(netCash)}</p>
          </div>
          <Wallet className="h-10 w-10 opacity-80" />
        </div>
      </div>
    </Card>
  )
}
