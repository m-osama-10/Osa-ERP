'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bike, MapPin, Smartphone, Wifi, WifiOff, Navigation, DollarSign, Printer } from 'lucide-react'

export function Representatives() {
  const { lang } = useApp()

  const reps = [
    { name: 'ماجد العتيبي', code: 'REP-001', phone: '0551234567', route: 'الرياض - شمال', visits: 12, collected: 4500, status: 'online', lastSync: 'منذ 5 دقائق' },
    { name: 'سعد القحطاني', code: 'REP-002', phone: '0552345678', route: 'الرياض - جنوب', visits: 8, collected: 3200, status: 'online', lastSync: 'منذ 12 دقيقة' },
    { name: 'فهد الدوسري', code: 'REP-003', phone: '0553456789', route: 'جدة - وسط البلد', visits: 15, collected: 6800, status: 'offline', lastSync: 'منذ ساعة' },
    { name: 'عبدالعزيز الحربي', code: 'REP-004', phone: '0554567890', route: 'الدمام - الكورنيش', visits: 6, collected: 2400, status: 'online', lastSync: 'منذ 2 دقيقة' },
  ]

  return (
    <div className="space-y-6 animate-in-fade">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/70 p-6 text-primary-foreground shadow-xl">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold flex items-center gap-2"><Bike className="h-7 w-7" /> {t(lang, 'representatives')}</h2>
            <p className="mt-1 text-sm opacity-90">{lang === 'ar' ? 'إدارة ومتابعة مندوبي المبيعات الميدانيين' : 'Field sales reps management'}</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Smartphone className="h-16 w-16 opacity-50" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary"><Bike className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'المندوبين' : 'Reps'}</p><p className="text-xl font-bold">{reps.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><Wifi className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'متصل' : 'Online'}</p><p className="text-xl font-bold">{reps.filter(r => r.status === 'online').length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600"><Navigation className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الزيارات' : 'Total Visits'}</p><p className="text-xl font-bold">{reps.reduce((s, r) => s + r.visits, 0)}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-600"><DollarSign className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي التحصيل' : 'Total Collected'}</p><p className="text-xl font-bold">{new Intl.NumberFormat('ar-EG').format(reps.reduce((s, r) => s + r.collected, 0))}</p></div></div></Card>
      </div>

      {/* Features Banner */}
      <Card className="p-6 bg-gradient-to-br from-muted/40 to-muted/20">
        <h3 className="text-base font-bold mb-4">{lang === 'ar' ? 'ميزات تطبيق المندوب' : 'Mobile App Features'}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-background p-4 text-center">
            <WifiOff className="h-7 w-7 mx-auto mb-2 text-primary" />
            <p className="text-xs font-medium">{lang === 'ar' ? 'يعمل بدون إنترنت' : 'Offline Mode'}</p>
          </div>
          <div className="rounded-xl bg-background p-4 text-center">
            <Wifi className="h-7 w-7 mx-auto mb-2 text-emerald-500" />
            <p className="text-xs font-medium">{lang === 'ar' ? 'مزامنة تلقائية' : 'Auto Sync'}</p>
          </div>
          <div className="rounded-xl bg-background p-4 text-center">
            <Printer className="h-7 w-7 mx-auto mb-2 text-blue-500" />
            <p className="text-xs font-medium">{lang === 'ar' ? 'طباعة Bluetooth' : 'Bluetooth Print'}</p>
          </div>
          <div className="rounded-xl bg-background p-4 text-center">
            <MapPin className="h-7 w-7 mx-auto mb-2 text-amber-500" />
            <p className="text-xs font-medium">{lang === 'ar' ? 'تتبع GPS' : 'GPS Tracking'}</p>
          </div>
        </div>
      </Card>

      {/* Reps list */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{lang === 'ar' ? 'قائمة المندوبين' : 'Reps List'}</h3>
          <Button><Bike className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'مندوب جديد' : 'Add Rep'}</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reps.map(r => (
            <div key={r.code} className="rounded-xl border-2 border-border p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-white font-bold">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.code} • {r.phone}</p>
                  </div>
                </div>
                <Badge variant={r.status === 'online' ? 'default' : 'secondary'} className="flex items-center gap-1">
                  {r.status === 'online' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {r.status === 'online' ? (lang === 'ar' ? 'متصل' : 'Online') : (lang === 'ar' ? 'غير متصل' : 'Offline')}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {lang === 'ar' ? 'الخط' : 'Route'}</span>
                  <span className="font-medium">{r.route}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{lang === 'ar' ? 'الزيارات' : 'Visits'}</span>
                  <span className="font-bold">{r.visits}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{lang === 'ar' ? 'التحصيل' : 'Collected'}</span>
                  <span className="font-bold text-primary">{new Intl.NumberFormat('ar-EG').format(r.collected)} ج.م</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{lang === 'ar' ? 'آخر مزامنة' : 'Last sync'}</span>
                  <span>{r.lastSync}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
