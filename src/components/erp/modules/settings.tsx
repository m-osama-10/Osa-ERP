'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Moon, Sun, Languages, Cloud, Bell, Database, Shield, Palette, Globe, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

export function SettingsView() {
  const { lang, setLang, theme, toggleTheme } = useApp()
  const [notifications, setNotifications] = React.useState({ email: true, push: true, sms: false, invoices: true, lowStock: true })
  const [company, setCompany] = React.useState({ name: 'شركة أوسا التجارية', currency: 'SAR', taxNo: '300000000000003', vatRate: '15' })

  return (
    <div className="space-y-6 animate-in-fade">
      {/* General Settings */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">{lang === 'ar' ? 'الإعدادات العامة' : 'General Settings'}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{lang === 'ar' ? 'اسم الشركة' : 'Company Name'}</Label>
            <Input value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} />
          </div>
          <div>
            <Label>{lang === 'ar' ? 'الرقم الضريبي' : 'Tax Number'}</Label>
            <Input value={company.taxNo} onChange={e => setCompany({ ...company, taxNo: e.target.value })} dir="ltr" />
          </div>
          <div>
            <Label>{lang === 'ar' ? 'العملة' : 'Currency'}</Label>
            <Select value={company.currency} onValueChange={v => setCompany({ ...company, currency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SAR">ر.س - ريال سعودي</SelectItem>
                <SelectItem value="USD">$ - دولار أمريكي</SelectItem>
                <SelectItem value="EUR">€ - يورو</SelectItem>
                <SelectItem value="AED">د.إ - درهم إماراتي</SelectItem>
                <SelectItem value="EGP">ج.م - جنيه مصري</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{lang === 'ar' ? 'نسبة الضريبة' : 'VAT Rate'}</Label>
            <Select value={company.vatRate} onValueChange={v => setCompany({ ...company, vatRate: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15%</SelectItem>
                <SelectItem value="14">14%</SelectItem>
                <SelectItem value="0">0% - معفى</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => toast.success(lang === 'ar' ? 'تم الحفظ' : 'Saved')}>{t(lang, 'save')}</Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">{lang === 'ar' ? 'المظهر' : 'Appearance'}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Sun className="h-6 w-6 text-amber-500" /> : <Moon className="h-6 w-6 text-indigo-500" />}
              <div>
                <Label>{lang === 'ar' ? 'الوضع الليلي' : 'Dark Mode'}</Label>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'تبديل بين الوضعين' : 'Toggle theme'}</p>
              </div>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <Languages className="h-6 w-6 text-primary" />
              <div>
                <Label>{lang === 'ar' ? 'اللغة' : 'Language'}</Label>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'تبديل اللغة' : 'Switch language'}</p>
              </div>
            </div>
            <Select value={lang} onValueChange={v => setLang(v as 'ar' | 'en')}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div className="flex items-center gap-3"><Globe className="h-5 w-5 text-blue-500" /><div><Label>{lang === 'ar' ? 'إشعارات البريد' : 'Email Notifications'}</Label></div></div>
            <Switch checked={notifications.email} onCheckedChange={v => setNotifications({ ...notifications, email: v })} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div className="flex items-center gap-3"><Smartphone className="h-5 w-5 text-purple-500" /><div><Label>{lang === 'ar' ? 'إشعارات الدفع' : 'Push Notifications'}</Label></div></div>
            <Switch checked={notifications.push} onCheckedChange={v => setNotifications({ ...notifications, push: v })} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div className="flex items-center gap-3"><Bell className="h-5 w-5 text-amber-500" /><div><Label>{lang === 'ar' ? 'تنبيهات الفواتير' : 'Invoice Alerts'}</Label></div></div>
            <Switch checked={notifications.invoices} onCheckedChange={v => setNotifications({ ...notifications, invoices: v })} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div className="flex items-center gap-3"><Bell className="h-5 w-5 text-red-500" /><div><Label>{lang === 'ar' ? 'تنبيه المخزون المنخفض' : 'Low Stock Alerts'}</Label></div></div>
            <Switch checked={notifications.lowStock} onCheckedChange={v => setNotifications({ ...notifications, lowStock: v })} />
          </div>
        </div>
      </Card>

      {/* Cloud / System */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">{lang === 'ar' ? 'النظام السحابي والنسخ الاحتياطي' : 'Cloud & Backup'}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border p-4">
            <Cloud className="h-7 w-7 text-primary mb-2" />
            <p className="font-semibold text-sm">{lang === 'ar' ? 'الحالة السحابية' : 'Cloud Status'}</p>
            <div className="flex items-center gap-2 mt-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-xs text-muted-foreground">{lang === 'ar' ? 'متصل' : 'Connected'}</span></div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <Database className="h-7 w-7 text-blue-500 mb-2" />
            <p className="font-semibold text-sm">{lang === 'ar' ? 'آخر نسخة احتياطية' : 'Last Backup'}</p>
            <p className="text-xs text-muted-foreground mt-1">منذ 4 ساعات</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <Shield className="h-7 w-7 text-emerald-500 mb-2" />
            <p className="font-semibold text-sm">{lang === 'ar' ? 'التشفير' : 'Encryption'}</p>
            <Badge variant="default" className="mt-1">AES-256</Badge>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Osa ERP</h3>
            <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'نظام إدارة المؤسسات المتكامل' : 'Enterprise Resource Planning'}</p>
            <div className="mt-2 flex gap-2 flex-wrap">
              <Badge variant="secondary">v1.0.0</Badge>
              <Badge variant="outline">Next.js 16</Badge>
              <Badge variant="outline">PostgreSQL</Badge>
              <Badge variant="outline">Prisma</Badge>
              <Badge variant="outline">TypeScript</Badge>
            </div>
          </div>
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-3xl font-black text-primary-foreground shadow-lg">
            O
          </div>
        </div>
      </Card>
    </div>
  )
}
