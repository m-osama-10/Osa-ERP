'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, Plus, MapPin, Phone, Users } from 'lucide-react'

export function Branches() {
  const { lang } = useApp()

  const branches = [
    { id: 1, name: 'الفرع الرئيسي', code: 'BR-01', address: 'الرياض - حي العليا', phone: '0112345678', employees: 6, status: 'نشط' },
    { id: 2, name: 'فرع جدة', code: 'BR-02', address: 'جدة - حي الروضة', phone: '0126834590', employees: 2, status: 'نشط' },
  ]

  return (
    <div className="space-y-6 animate-in-fade">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary"><Building2 className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الفروع' : 'Total Branches'}</p><p className="text-xl font-bold">{branches.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><Users className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الموظفين' : 'Total Employees'}</p><p className="text-xl font-bold">{branches.reduce((s, b) => s + b.employees, 0)}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600"><MapPin className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'المدن' : 'Cities'}</p><p className="text-xl font-bold">2</p></div></div></Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{t(lang, 'branches')}</h3>
          <Button><Plus className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'فرع جديد' : 'New Branch'}</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map(b => (
            <div key={b.id} className="rounded-xl border-2 border-border p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-white">
                  <Building2 className="h-6 w-6" />
                </div>
                <Badge>{b.status}</Badge>
              </div>
              <h4 className="font-bold text-lg">{b.name}</h4>
              <p className="text-xs text-muted-foreground mb-3 font-mono">{b.code}</p>
              <div className="space-y-2 text-sm border-t border-border pt-3">
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {b.address}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {b.phone}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> {b.employees} {lang === 'ar' ? 'موظف' : 'employees'}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
