'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet, Banknote, Landmark, ArrowRightLeft } from 'lucide-react'

type Cash = { id: string; code: string; name: string; balance: number; currency: string; isActive: boolean }
type Bank = { id: string; code: string; bankName: string; accountNo: string; iban: string | null; balance: number; currency: string; isActive: boolean }

function formatCurrency(n: number) {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(n)
}

export function Treasury() {
  const { lang } = useApp()
  const [tab, setTab] = React.useState('cash')
  const [cash, setCash] = React.useState<Cash[]>([])
  const [banks, setBanks] = React.useState<Bank[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([
      fetch('/api/cash').then(r => r.json()),
      fetch('/api/banks').then(r => r.json()),
    ]).then(([c, b]) => { setCash(c); setBanks(b); setLoading(false) })
  }, [])

  if (loading) return <Skeleton className="h-96" />

  const totalCash = cash.reduce((s, c) => s + c.balance, 0)
  const totalBanks = banks.reduce((s, b) => s + b.balance, 0)

  return (
    <div className="space-y-6 animate-in-fade">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي النقدية' : 'Total Cash'}</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalCash)}</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-600"><Wallet className="h-6 w-6" /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي البنوك' : 'Total Banks'}</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalBanks)}</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 text-blue-600"><Landmark className="h-6 w-6" /></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي السيولة' : 'Total Liquidity'}</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalCash + totalBanks)}</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary"><ArrowRightLeft className="h-6 w-6" /></div>
          </div>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cash" className="flex items-center gap-2"><Wallet className="h-4 w-4" /> {lang === 'ar' ? 'الخزائن' : 'Cash'}</TabsTrigger>
          <TabsTrigger value="banks" className="flex items-center gap-2"><Landmark className="h-4 w-4" /> {lang === 'ar' ? 'البنوك' : 'Banks'}</TabsTrigger>
        </TabsList>

        <TabsContent value="cash">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">{lang === 'ar' ? 'إدارة الخزائن' : 'Cash Management'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cash.map(c => (
                <div key={c.id} className="rounded-xl border-2 border-border p-5 hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                  </div>
                  <h4 className="font-bold text-lg">{c.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{c.currency}</p>
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الرصيد' : 'Balance'}</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(c.balance)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="banks">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">{lang === 'ar' ? 'إدارة البنوك' : 'Bank Accounts'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banks.map(b => (
                <div key={b.id} className="rounded-xl border-2 border-border p-5 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                      <Landmark className="h-6 w-6" />
                    </div>
                    <div className="text-end">
                      <p className="font-mono text-xs text-muted-foreground">{b.code}</p>
                      <span className="text-xs text-muted-foreground">{b.currency}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-lg">{b.bankName}</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'رقم الحساب' : 'Account'}</span><span className="font-mono">{b.accountNo}</span></div>
                    {b.iban && <div className="flex justify-between"><span className="text-muted-foreground">IBAN</span><span className="font-mono text-xs">{b.iban}</span></div>}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الرصيد' : 'Balance'}</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(b.balance)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
