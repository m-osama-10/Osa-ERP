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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Settings, Moon, Sun, Languages, Bell, Database, Shield, Palette, Globe, Smartphone, Building2, Percent, Printer, FileText, Mail, Coins, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export function SettingsView() {
  const { lang, setLang, theme, toggleTheme } = useApp()
  const [tab, setTab] = React.useState('company')

  return (
    <div className="space-y-6 animate-in-fade">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
          <TabsTrigger value="company" className="flex flex-col items-center gap-1 py-2"><Building2 className="h-4 w-4" /><span className="text-xs">{t(lang, 'settings')}</span></TabsTrigger>
          <TabsTrigger value="taxes" className="flex flex-col items-center gap-1 py-2"><Percent className="h-4 w-4" /><span className="text-xs">{lang === 'ar' ? 'ضرائب' : 'Taxes'}</span></TabsTrigger>
          <TabsTrigger value="currencies" className="flex flex-col items-center gap-1 py-2"><Coins className="h-4 w-4" /><span className="text-xs">{lang === 'ar' ? 'عملات' : 'Currencies'}</span></TabsTrigger>
          <TabsTrigger value="email" className="flex flex-col items-center gap-1 py-2"><Mail className="h-4 w-4" /><span className="text-xs">{lang === 'ar' ? 'بريد' : 'Email'}</span></TabsTrigger>
          <TabsTrigger value="printer" className="flex flex-col items-center gap-1 py-2"><Printer className="h-4 w-4" /><span className="text-xs">{lang === 'ar' ? 'طابعة' : 'Printer'}</span></TabsTrigger>
          <TabsTrigger value="appearance" className="flex flex-col items-center gap-1 py-2"><Palette className="h-4 w-4" /><span className="text-xs">{lang === 'ar' ? 'مظهر' : 'Appearance'}</span></TabsTrigger>
        </TabsList>

        <TabsContent value="company"><CompanySettings /></TabsContent>
        <TabsContent value="taxes"><TaxSettings /></TabsContent>
        <TabsContent value="currencies"><CurrenciesSettings /></TabsContent>
        <TabsContent value="email"><EmailSettings /></TabsContent>
        <TabsContent value="printer"><PrinterSettings /></TabsContent>
        <TabsContent value="appearance"><AppearanceSettings /></TabsContent>
      </Tabs>
    </div>
  )
}

function CompanySettings() {
  const { lang } = useApp()
  const [company, setCompany] = React.useState<any>(null)

  React.useEffect(() => { fetch('/api/settings/company').then(r => r.json()).then(setCompany) }, [])

  const save = async () => {
    await fetch('/api/settings/company', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(company) })
    toast.success(lang === 'ar' ? 'تم حفظ بيانات الشركة' : 'Company saved')
  }

  if (!company) return null

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">{lang === 'ar' ? 'بيانات الشركة' : 'Company Info'}</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>{t(lang, 'name')}</Label><Input value={company.name || ''} onChange={e => setCompany({ ...company, name: e.target.value })} /></div>
        <div><Label>{t(lang, 'nameEn')}</Label><Input value={company.nameEn || ''} onChange={e => setCompany({ ...company, nameEn: e.target.value })} dir="ltr" /></div>
        <div><Label>{lang === 'ar' ? 'الرقم الضريبي' : 'Tax No'}</Label><Input value={company.taxNo || ''} onChange={e => setCompany({ ...company, taxNo: e.target.value })} dir="ltr" /></div>
        <div><Label>{t(lang, 'phone')}</Label><Input value={company.phone || ''} onChange={e => setCompany({ ...company, phone: e.target.value })} dir="ltr" /></div>
        <div><Label>{t(lang, 'email')}</Label><Input value={company.email || ''} onChange={e => setCompany({ ...company, email: e.target.value })} dir="ltr" /></div>
        <div>
          <Label>{lang === 'ar' ? 'العملة الافتراضية' : 'Default Currency'}</Label>
          <Select value={company.currency || 'EGP'} onValueChange={v => setCompany({ ...company, currency: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="EGP">ج.م - جنيه مصري</SelectItem>
              <SelectItem value="USD">$ - دولار أمريكي</SelectItem>
              <SelectItem value="SAR">ر.س - ريال سعودي</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2"><Label>{t(lang, 'address')}</Label><Input value={company.address || ''} onChange={e => setCompany({ ...company, address: e.target.value })} /></div>
      </div>
      <div className="mt-4 flex justify-end"><Button onClick={save}>{t(lang, 'save')}</Button></div>

      {company.branches && (
        <div className="mt-6">
          <h4 className="font-bold mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" />{lang === 'ar' ? 'الفروع' : 'Branches'} ({company.branches.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {company.branches.map((b: any) => (
              <div key={b.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between mb-1"><span className="font-medium">{b.name}</span><Badge variant="outline">{b.code}</Badge></div>
                <p className="text-xs text-muted-foreground">{b.address} • {b.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

function TaxSettings() {
  const { lang } = useApp()
  const [settings, setSettings] = React.useState<any>(null)

  React.useEffect(() => { fetch('/api/settings/system').then(r => r.json()).then(setSettings) }, [])
  const save = async () => {
    await fetch('/api/settings/system', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
    toast.success(lang === 'ar' ? 'تم الحفظ' : 'Saved')
  }
  if (!settings) return null

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2"><Percent className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">{lang === 'ar' ? 'إعدادات الضرائب' : 'Tax Settings'}</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{lang === 'ar' ? 'نسبة ضريبة القيمة المضافة' : 'VAT Rate'}</Label>
          <Select value={String(settings.taxRate)} onValueChange={v => setSettings({ ...settings, taxRate: parseFloat(v) })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="14">14% - {lang === 'ar' ? 'مصر' : 'Egypt'}</SelectItem>
              <SelectItem value="15">15% - {lang === 'ar' ? 'السعودية' : 'Saudi'}</SelectItem>
              <SelectItem value="5">5% - {lang === 'ar' ? 'الإمارات' : 'UAE'}</SelectItem>
              <SelectItem value="0">0% - {lang === 'ar' ? 'معفى' : 'Exempt'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>{lang === 'ar' ? 'الرقم الضريبي للشركة' : 'Company Tax Number'}</Label><Input value={settings.taxNumber} onChange={e => setSettings({ ...settings, taxNumber: e.target.value })} dir="ltr" /></div>
      </div>
      <div className="mt-4 rounded-xl bg-muted/40 p-4 text-sm">
        <p className="font-medium mb-2">{lang === 'ar' ? 'معلومات ضريبية' : 'Tax Info'}</p>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• {lang === 'ar' ? 'سيتم تطبيق نسبة الضريبة تلقائياً على جميع الفواتير الجديدة' : 'VAT will be auto-applied to all new invoices'}</li>
          <li>• {lang === 'ar' ? 'الرقم الضريبي يظهر في ترويسة الفواتير والتقارير' : 'Tax number appears in invoice and report headers'}</li>
          <li>• {lang === 'ar' ? 'يمكن تجاوز النسبة لكل فاتورة على حدة' : 'Rate can be overridden per invoice'}</li>
        </ul>
      </div>
      <div className="mt-4 flex justify-end"><Button onClick={save}>{t(lang, 'save')}</Button></div>
    </Card>
  )
}

function CurrenciesSettings() {
  const { lang } = useApp()
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2"><Coins className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">{lang === 'ar' ? 'إعدادات العملات' : 'Currency Settings'}</h3></div>
      <div className="rounded-xl bg-primary/10 p-4">
        <p className="text-sm font-medium mb-2">{lang === 'ar' ? 'العملات المدعومة' : 'Supported Currencies'}</p>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="rounded-lg bg-background p-3 text-center"><p className="text-2xl font-bold text-emerald-600">ج.م</p><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'جنيه مصري (أساسية)' : 'EGP (base)'}</p></div>
          <div className="rounded-lg bg-background p-3 text-center"><p className="text-2xl font-bold text-blue-600">$</p><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'دولار أمريكي' : 'USD'}</p></div>
          <div className="rounded-lg bg-background p-3 text-center"><p className="text-2xl font-bold text-amber-600">ر.س</p><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'ريال سعودي' : 'SAR'}</p></div>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {lang === 'ar' ? 'لإدارة العملات وأسعار الصرف، انتقل إلى وحدة العملات من القائمة الجانبية.' : 'To manage currencies and exchange rates, go to the Currencies module in the sidebar.'}
      </p>
    </Card>
  )
}

function EmailSettings() {
  const { lang } = useApp()
  const [settings, setSettings] = React.useState<any>(null)
  const [testEmail, setTestEmail] = React.useState('')
  const [testing, setTesting] = React.useState(false)

  React.useEffect(() => { fetch('/api/settings/system').then(r => r.json()).then(setSettings) }, [])
  const save = async () => {
    await fetch('/api/settings/system', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
    toast.success(lang === 'ar' ? 'تم حفظ إعدادات البريد' : 'Email settings saved')
  }
  const testConnection = async () => {
    if (!testEmail) { toast.error(lang === 'ar' ? 'أدخل بريد الاختبار' : 'Enter test email'); return }
    setTesting(true)
    try {
      const res = await fetch('/api/email-test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings.email, toEmail: testEmail })
      })
      const data = await res.json()
      if (res.ok) toast.success(data.message)
      else toast.error(data.error)
    } finally { setTesting(false) }
  }
  if (!settings) return null

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">{lang === 'ar' ? 'إعدادات البريد الإلكتروني (SMTP)' : 'Email Settings (SMTP)'}</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>SMTP Host</Label><Input value={settings.email.smtpHost} onChange={e => setSettings({ ...settings, email: { ...settings.email, smtpHost: e.target.value } })} dir="ltr" placeholder="smtp.gmail.com" /></div>
        <div><Label>SMTP Port</Label><Input type="number" value={settings.email.smtpPort} onChange={e => setSettings({ ...settings, email: { ...settings.email, smtpPort: parseInt(e.target.value) || 587 } })} dir="ltr" /></div>
        <div><Label>SMTP Username</Label><Input value={settings.email.smtpUser} onChange={e => setSettings({ ...settings, email: { ...settings.email, smtpUser: e.target.value } })} dir="ltr" placeholder="you@gmail.com" /></div>
        <div><Label>SMTP Password / App Password</Label><Input type="password" value={settings.email.smtpPassword} onChange={e => setSettings({ ...settings, email: { ...settings.email, smtpPassword: e.target.value } })} dir="ltr" /></div>
        <div><Label>{lang === 'ar' ? 'بريد الإرسال' : 'From Email'}</Label><Input value={settings.email.fromEmail} onChange={e => setSettings({ ...settings, email: { ...settings.email, fromEmail: e.target.value } })} dir="ltr" /></div>
        <div><Label>{lang === 'ar' ? 'اسم المرسل' : 'From Name'}</Label><Input value={settings.email.fromName} onChange={e => setSettings({ ...settings, email: { ...settings.email, fromName: e.target.value } })} /></div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-border p-3">
        <div><Label>SSL / TLS</Label><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'استخدام اتصال آمن' : 'Use secure connection'}</p></div>
        <Switch checked={settings.email.secure} onCheckedChange={v => setSettings({ ...settings, email: { ...settings.email, secure: v } })} />
      </div>

      <div className="mt-4 rounded-xl bg-muted/40 p-4">
        <Label>{lang === 'ar' ? 'اختبار الاتصال' : 'Test Connection'}</Label>
        <div className="mt-2 flex gap-2">
          <Input value={testEmail} onChange={e => setTestEmail(e.target.value)} dir="ltr" placeholder="test@example.com" />
          <Button onClick={testConnection} disabled={testing}>{testing ? '...' : lang === 'ar' ? 'اختبار' : 'Test'}</Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {lang === 'ar' ? 'لـ Gmail، استخدم App Password من إعدادات حساب Google.' : 'For Gmail, use an App Password from Google Account settings.'}
        </p>
      </div>

      <div className="mt-4 flex justify-end"><Button onClick={save}>{t(lang, 'save')}</Button></div>
    </Card>
  )
}

function PrinterSettings() {
  const { lang } = useApp()
  const [settings, setSettings] = React.useState<any>(null)
  React.useEffect(() => { fetch('/api/settings/system').then(r => r.json()).then(setSettings) }, [])
  const save = async () => {
    await fetch('/api/settings/system', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
    toast.success(lang === 'ar' ? 'تم الحفظ' : 'Saved')
  }
  if (!settings) return null

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2"><Printer className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">{lang === 'ar' ? 'إعدادات الطباعة' : 'Printer Settings'}</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{lang === 'ar' ? 'حجم الورق' : 'Paper Size'}</Label>
          <Select value={settings.printer.paperSize} onValueChange={v => setSettings({ ...settings, printer: { ...settings.printer, paperSize: v } })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="A5">A5</SelectItem>
              <SelectItem value="Letter">Letter</SelectItem>
              <SelectItem value="80mm">80mm - {lang === 'ar' ? 'حرارية' : 'Thermal'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{lang === 'ar' ? 'الاتجاه' : 'Orientation'}</Label>
          <Select value={settings.printer.orientation} onValueChange={v => setSettings({ ...settings, printer: { ...settings.printer, orientation: v } })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">{lang === 'ar' ? 'عمودي' : 'Portrait'}</SelectItem>
              <SelectItem value="landscape">{lang === 'ar' ? 'أفقي' : 'Landscape'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>{lang === 'ar' ? 'عدد النسخ' : 'Copies'}</Label><Input type="number" min={1} value={settings.printer.copies} onChange={e => setSettings({ ...settings, printer: { ...settings.printer, copies: parseInt(e.target.value) || 1 } })} /></div>
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-border p-3">
          <div><Label>{lang === 'ar' ? 'إظهار شعار الشركة' : 'Show Company Logo'}</Label></div>
          <Switch checked={settings.printer.showLogo} onCheckedChange={v => setSettings({ ...settings, printer: { ...settings.printer, showLogo: v } })} />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border p-3">
          <div><Label>{lang === 'ar' ? 'مساحة للتوقيع' : 'Signature Space'}</Label></div>
          <Switch checked={settings.printer.showSignature} onCheckedChange={v => setSettings({ ...settings, printer: { ...settings.printer, showSignature: v } })} />
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-bold mb-3 flex items-center gap-2"><FileText className="h-4 w-4" />{lang === 'ar' ? 'إعدادات الفواتير' : 'Invoice Settings'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>{lang === 'ar' ? 'بادئة رقم الفاتورة' : 'Invoice Prefix'}</Label><Input value={settings.invoice.prefix} onChange={e => setSettings({ ...settings, invoice: { ...settings.invoice, prefix: e.target.value } })} dir="ltr" /></div>
          <div><Label>{lang === 'ar' ? 'رقم البداية' : 'Start Number'}</Label><Input type="number" value={settings.invoice.startNumber} onChange={e => setSettings({ ...settings, invoice: { ...settings.invoice, startNumber: parseInt(e.target.value) || 1000 } })} /></div>
          <div className="md:col-span-2"><Label>{lang === 'ar' ? 'نص التذييل' : 'Footer Text'}</Label><Input value={settings.invoice.footerText} onChange={e => setSettings({ ...settings, invoice: { ...settings.invoice, footerText: e.target.value } })} /></div>
          <div className="md:col-span-2"><Label>{lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}</Label><Input value={settings.invoice.termsConditions} onChange={e => setSettings({ ...settings, invoice: { ...settings.invoice, termsConditions: e.target.value } })} /></div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-border p-3">
          <div><Label>{lang === 'ar' ? 'إظهار QR Code' : 'Show QR Code'}</Label></div>
          <Switch checked={settings.invoice.showQR} onCheckedChange={v => setSettings({ ...settings, invoice: { ...settings.invoice, showQR: v } })} />
        </div>
      </div>

      <div className="mt-4 flex justify-end"><Button onClick={save}>{t(lang, 'save')}</Button></div>
    </Card>
  )
}

function AppearanceSettings() {
  const { lang, setLang, theme, toggleTheme } = useApp()
  const [notifications, setNotifications] = React.useState({ email: true, push: true, sms: false, invoices: true, lowStock: true })

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">{lang === 'ar' ? 'المظهر' : 'Appearance'}</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Sun className="h-6 w-6 text-amber-500" /> : <Moon className="h-6 w-6 text-indigo-500" />}
              <div><Label>{lang === 'ar' ? 'الوضع الليلي' : 'Dark Mode'}</Label><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'تبديل بين الوضعين' : 'Toggle theme'}</p></div>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div className="flex items-center gap-3"><Languages className="h-6 w-6 text-primary" /><div><Label>{lang === 'ar' ? 'اللغة' : 'Language'}</Label></div></div>
            <Select value={lang} onValueChange={v => setLang(v as 'ar' | 'en')}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="ar">العربية</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</h3></div>
        <div className="space-y-3">
          {[
            { key: 'email', icon: Globe, label: lang === 'ar' ? 'إشعارات البريد' : 'Email Notifications' },
            { key: 'push', icon: Smartphone, label: lang === 'ar' ? 'إشعارات الدفع' : 'Push Notifications' },
            { key: 'invoices', icon: FileText, label: lang === 'ar' ? 'تنبيهات الفواتير' : 'Invoice Alerts' },
            { key: 'lowStock', icon: Bell, label: lang === 'ar' ? 'تنبيه المخزون المنخفض' : 'Low Stock Alerts' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div className="flex items-center gap-3"><n.icon className="h-5 w-5 text-muted-foreground" /><Label>{n.label}</Label></div>
              <Switch checked={(notifications as any)[n.key]} onCheckedChange={v => setNotifications({ ...notifications, [n.key]: v })} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Osa ERP</h3>
            <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'نظام إدارة المؤسسات المتكامل' : 'Enterprise Resource Planning'}</p>
            <div className="mt-2 flex gap-2 flex-wrap">
              <Badge variant="secondary">v2.0.0</Badge>
              <Badge variant="outline">Next.js 16</Badge>
              <Badge variant="outline">Prisma</Badge>
              <Badge variant="outline">TypeScript</Badge>
            </div>
          </div>
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-3xl font-black text-primary-foreground shadow-lg">O</div>
        </div>
      </Card>
    </div>
  )
}
