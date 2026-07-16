'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Coins, Plus, Trash2, RefreshCw, ArrowRightLeft, Star, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

type Currency = { id: string; code: string; name: string; nameEn: string | null; symbol: string; isBase: boolean; isActive: boolean }
type Rate = { id: string; fromCode: string; toCode: string; rate: number; date: string; isActive: boolean }

export function Currencies() {
  const { lang, displayCurrency, setDisplayCurrency, exchangeRates, convertAmount } = useApp()
  const [currencies, setCurrencies] = React.useState<Currency[]>([])
  const [rates, setRates] = React.useState<Rate[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [rateDialogOpen, setRateDialogOpen] = React.useState(false)
  const [convertOpen, setConvertOpen] = React.useState(false)
  const [convertAmountVal, setConvertAmountVal] = React.useState(1000)
  const [convertFrom, setConvertFrom] = React.useState('EGP')
  const [convertTo, setConvertTo] = React.useState('USD')

  const load = () => {
    fetch('/api/currencies').then(r => r.json()).then(d => {
      setCurrencies(d.currencies); setRates(d.rates); setLoading(false)
    })
  }
  React.useEffect(load, [])

  const getRate = (from: string, to: string) => {
    if (from === to) return 1
    return exchangeRates[`${from}_${to}`] || null
  }

  return (
    <div className="space-y-6 animate-in-fade">
      {/* Display currency selector */}
      <Card className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">{t(lang, 'displayCurrency')}</h3>
              <p className="text-xs text-muted-foreground">
                {lang === 'ar' ? 'اختر العملة التي تظهر بها كل المبالغ في النظام' : 'Select currency to display all amounts'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currencies.map(c => (
              <button
                key={c.code}
                onClick={() => { setDisplayCurrency(c.code as any); toast.success(lang === 'ar' ? `تم التحويل إلى ${c.name}` : `Switched to ${c.nameEn}`) }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  displayCurrency === c.code
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-background border border-border hover:border-primary/40'
                }`}
              >
                {c.isBase && <Star className="h-3 w-3" />}
                <span className="font-mono">{c.code}</span>
                <span className="opacity-75">{c.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary"><Coins className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'العملات' : 'Currencies'}</p><p className="text-xl font-bold">{currencies.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><ArrowRightLeft className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'أسعار الصرف' : 'Exchange Rates'}</p><p className="text-xl font-bold">{rates.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-600"><Star className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'العملة الأساسية' : 'Base Currency'}</p><p className="text-xl font-bold">EGP</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600"><TrendingUp className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? '1 USD =' : '1 USD ='}</p><p className="text-xl font-bold">{getRate('USD', 'EGP')?.toFixed(2) || '48'} EGP</p></div></div></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currencies */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">{lang === 'ar' ? 'العملات المعرفة' : 'Defined Currencies'}</h3>
            <Button onClick={() => setDialogOpen(true)} size="sm"><Plus className="h-4 w-4 ml-1" />{t(lang, 'add')}</Button>
          </div>
          <div className="space-y-2">
            {currencies.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary font-bold">{c.symbol}</div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.nameEn} • {c.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.isBase && <Badge className="bg-amber-500"><Star className="h-3 w-3 ml-1" />{lang === 'ar' ? 'أساسية' : 'Base'}</Badge>}
                  <Badge variant={c.isActive ? 'default' : 'secondary'}>{c.isActive ? (lang === 'ar' ? 'نشطة' : 'Active') : (lang === 'ar' ? 'متوقفة' : 'Off')}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Exchange Rates */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">{t(lang, 'exchangeRate')}</h3>
            <div className="flex gap-2">
              <Button onClick={() => setConvertOpen(true)} variant="outline" size="sm"><ArrowRightLeft className="h-4 w-4 ml-1" />{lang === 'ar' ? 'محول' : 'Convert'}</Button>
              <Button onClick={() => setRateDialogOpen(true)} size="sm"><Plus className="h-4 w-4 ml-1" />{lang === 'ar' ? 'سعر جديد' : 'New Rate'}</Button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-start">{lang === 'ar' ? 'من' : 'From'}</th>
                  <th className="px-3 py-2 text-start">{lang === 'ar' ? 'إلى' : 'To'}</th>
                  <th className="px-3 py-2 text-end">{t(lang, 'rate')}</th>
                  <th className="px-3 py-2 text-start">{t(lang, 'date')}</th>
                </tr>
              </thead>
              <tbody>
                {rates.map(r => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2 font-mono font-semibold">{r.fromCode}</td>
                    <td className="px-3 py-2 font-mono font-semibold">{r.toCode}</td>
                    <td className="px-3 py-2 text-end font-bold text-primary">{r.rate.toFixed(4)}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Converter Dialog */}
      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle><ArrowRightLeft className="h-5 w-5 ml-2 inline" />{lang === 'ar' ? 'محول العملات' : 'Currency Converter'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>{lang === 'ar' ? 'المبلغ' : 'Amount'}</Label><Input type="number" value={convertAmountVal} onChange={e => setConvertAmountVal(parseFloat(e.target.value) || 0)} dir="ltr" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{lang === 'ar' ? 'من' : 'From'}</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={convertFrom} onChange={e => setConvertFrom(e.target.value)}>
                  {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>{lang === 'ar' ? 'إلى' : 'To'}</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={convertTo} onChange={e => setConvertTo(e.target.value)}>
                  {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="rounded-xl bg-primary/10 p-4 text-center">
              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'النتيجة' : 'Result'}</p>
              <p className="text-2xl font-bold text-primary">
                {convertAmount(convertAmountVal, convertFrom as any, convertTo as any).toFixed(2)} {convertTo}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                1 {convertFrom} = {(getRate(convertFrom, convertTo) || 0).toFixed(4)} {convertTo}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Rate Dialog */}
      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lang === 'ar' ? 'إضافة سعر صرف' : 'Add Exchange Rate'}</DialogTitle></DialogHeader>
          <RateForm currencies={currencies} onSaved={() => { load(); setRateDialogOpen(false) }} />
        </DialogContent>
      </Dialog>

      {/* New Currency Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lang === 'ar' ? 'إضافة عملة' : 'Add Currency'}</DialogTitle></DialogHeader>
          <CurrencyForm onSaved={() => { load(); setDialogOpen(false) }} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CurrencyForm({ onSaved }: { onSaved: () => void }) {
  const { lang } = useApp()
  const [form, setForm] = React.useState({ code: '', name: '', nameEn: '', symbol: '', isBase: false })

  const submit = async () => {
    const res = await fetch('/api/currencies', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) { toast.success(lang === 'ar' ? 'تمت الإضافة' : 'Added'); onSaved() }
  }

  return (
    <div className="space-y-3 py-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} dir="ltr" placeholder="USD" /></div>
        <div><Label>Symbol</Label><Input value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} placeholder="$" /></div>
        <div><Label>{t(lang, 'name')}</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>{t(lang, 'nameEn')}</Label><Input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} dir="ltr" /></div>
      </div>
      <Button onClick={submit} className="w-full">{t(lang, 'save')}</Button>
    </div>
  )
}

function RateForm({ currencies, onSaved }: { currencies: Currency[]; onSaved: () => void }) {
  const { lang } = useApp()
  const [form, setForm] = React.useState({ fromCode: 'EGP', toCode: 'USD', rate: 48 })

  const submit = async () => {
    const res = await fetch('/api/currencies', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'rate', ...form })
    })
    if (res.ok) { toast.success(lang === 'ar' ? 'تمت الإضافة' : 'Added'); onSaved() }
  }

  return (
    <div className="space-y-3 py-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{lang === 'ar' ? 'من' : 'From'}</Label>
          <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={form.fromCode} onChange={e => setForm({ ...form, fromCode: e.target.value })}>
            {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
          </select>
        </div>
        <div>
          <Label>{lang === 'ar' ? 'إلى' : 'To'}</Label>
          <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={form.toCode} onChange={e => setForm({ ...form, toCode: e.target.value })}>
            {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
          </select>
        </div>
      </div>
      <div><Label>{t(lang, 'rate')}</Label><Input type="number" step="0.0001" value={form.rate} onChange={e => setForm({ ...form, rate: parseFloat(e.target.value) || 0 })} dir="ltr" /></div>
      <Button onClick={submit} className="w-full">{t(lang, 'save')}</Button>
    </div>
  )
}
