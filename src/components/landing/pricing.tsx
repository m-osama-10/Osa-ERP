'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Check, X, ShoppingCart, FileText, Package, Users, BarChart3,
  ShieldCheck, RefreshCw, Sparkles, Headphones, Globe, Crown,
  Info, Building2, Wallet, Star, Zap,
} from 'lucide-react'

export function Pricing() {
  const { lang } = useApp()

  // Two plans: Standard + Enterprise (yearly only)
  const plans = [
    {
      name_ar: 'Standard',
      name_en: 'Standard',
      desc_ar: 'للشركات الصغيرة والمتوسطة',
      desc_en: 'For small & medium businesses',
      icon: Sparkles,
      color: 'border-blue-500',
      iconBg: 'bg-blue-500',
      features_ar: 'كل ما تحتاجه لإدارة أعمالك بكفاءة',
      features_en: 'Everything you need to manage your business',
      popular: false,
    },
    {
      name_ar: 'Enterprise',
      name_en: 'Enterprise',
      desc_ar: 'للشركات الكبيرة والمؤسسات',
      desc_en: 'For large companies & enterprises',
      icon: Crown,
      color: 'border-primary ring-2 ring-primary',
      iconBg: 'gradient-primary',
      features_ar: 'حلول متقدمة + دعم مخصص + خادم منفصل',
      features_en: 'Advanced solutions + dedicated support + separate server',
      popular: true,
    },
  ]

  const comparisonFeatures = [
    { icon: ShoppingCart, ar: 'إدارة المبيعات والفواتير', en: 'Sales & Invoices', standard: true, enterprise: true },
    { icon: FileText, ar: 'إدارة المشتريات', en: 'Purchases', standard: true, enterprise: true },
    { icon: Package, ar: 'إدارة المخازن', en: 'Inventory', standard: true, enterprise: true },
    { icon: Users, ar: 'إدارة العملاء (CRM)', en: 'Customers (CRM)', standard: true, enterprise: true },
    { icon: BarChart3, ar: 'إدارة الحسابات والتقارير', en: 'Accounts & Reports', standard: true, enterprise: true },
    { icon: ShieldCheck, ar: 'إدارة المستخدمين والصلاحيات', en: 'Users & Permissions', standard: true, enterprise: true },
    { icon: RefreshCw, ar: 'نسخ احتياطي دوري', en: 'Periodic Backups', standard: true, enterprise: true },
    { icon: Sparkles, ar: 'تحديثات مجانية', en: 'Free Updates', standard: true, enterprise: true },
    { icon: Headphones, ar: 'دعم فني', en: 'Tech Support', standard: 'email', enterprise: 'dedicated 24/7' },
    { icon: Globe, ar: 'دومين مجاني (Vercel)', en: 'Free Domain (Vercel)', standard: true, enterprise: true },
    { icon: Crown, ar: 'دومين احترافي (.com)', en: 'Professional Domain', standard: '700 EGP', enterprise: true },
    { icon: Users, ar: 'عدد المستخدمين', en: 'Users', standard: 'حتى 10', enterprise: 'غير محدود' },
    { icon: Building2, ar: 'عدد الفروع', en: 'Branches', standard: 'حتى 3', enterprise: 'غير محدود' },
    { icon: Wallet, ar: 'نقطة البيع (POS)', en: 'POS', standard: true, enterprise: true },
    { icon: Users, ar: 'الموارد البشرية (HR)', en: 'HR Module', standard: true, enterprise: true },
    { icon: BarChart3, ar: 'تقارير الربحية', en: 'Profitability Reports', standard: true, enterprise: true },
    { icon: FileText, ar: 'تصدير PDF و Excel', en: 'PDF & Excel Export', standard: true, enterprise: true },
    { icon: Globe, ar: 'API كامل', en: 'Full API', standard: false, enterprise: true },
    { icon: Crown, ar: 'خادم مخصص (Dedicated)', en: 'Dedicated Server', standard: false, enterprise: true },
    { icon: Star, ar: 'تدريب الفريق', en: 'Team Training', standard: false, enterprise: true },
    { icon: Zap, ar: 'SLA 99.9%', en: 'SLA 99.9%', standard: false, enterprise: true },
  ]

  const renderValue = (val: any) => {
    if (val === true) return <Check className="h-5 w-5 text-emerald-500 mx-auto" />
    if (val === false) return <X className="h-5 w-5 text-red-400 mx-auto" />
    return <span className="text-xs font-bold">{val}</span>
  }

  const terms = [
    { ar: 'الاشتراك يُدفع مقدمًا ويُجدد سنويًا.', en: 'Subscription is paid in advance and renewed yearly.' },
    { ar: 'يشمل الاشتراك الاستضافة والتحديثات والدعم الفني طوال مدة الاشتراك.', en: 'Includes hosting, updates, and tech support during subscription.' },
    { ar: 'في حالة اختيار دومين احترافي، يتحمل العميل رسوم تجديد الدومين بعد السنة الأولى.', en: 'Professional domain renewal after first year at registrar rate.' },
    { ar: 'في حالة استخدام الدومين المجاني (Vercel)، لا توجد رسوم دومين.', en: 'Free Vercel domain has no domain fees.' },
    { ar: 'لا يتم استرداد قيمة الاشتراك بعد تفعيل الخدمة.', en: 'Non-refundable after activation.' },
  ]

  return (
    <section id="pricing" className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 gradient-mesh opacity-50" />
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full glass border border-primary/30 px-4 py-1.5 text-sm font-semibold text-primary mb-6 animate-fade-in-down">
            <Crown className="h-4 w-4" />
            {lang === 'ar' ? 'أسعار OSA ERP — اشتراك سنوي' : 'OSA ERP Pricing — Yearly'}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 animate-fade-in-up">
            {lang === 'ar' ? 'باقتان تناسبان احتياجاتك' : 'Two Plans For Your Needs'}
          </h2>
          <p className="text-lg text-muted-foreground animate-fade-in-up delay-100">
            {lang === 'ar' ? 'اشتراك سنوي يشمل الاستضافة والتحديثات والدعم الفني' : 'Yearly subscription includes hosting, updates, and tech support'}
          </p>
        </div>

        {/* Two Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {plans.map((plan, i) => {
            const Icon = plan.icon
            return (
              <Card key={i} className={`relative p-8 border-2 ${plan.color} card-lift animate-fade-in-up ${plan.popular ? 'shadow-soft-xl' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-glow flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {lang === 'ar' ? 'الأكثر طلباً' : 'Most Popular'}
                  </div>
                )}

                <div className={`inline-grid h-16 w-16 place-items-center rounded-2xl ${plan.iconBg} text-white shadow-soft mb-4`}>
                  <Icon className="h-8 w-8" />
                </div>

                <h3 className="text-2xl font-extrabold mb-1">{lang === 'ar' ? plan.name_ar : plan.name_en}</h3>
                <p className="text-sm text-muted-foreground mb-2">{lang === 'ar' ? plan.desc_ar : plan.desc_en}</p>
                <p className="text-xs text-muted-foreground mb-6">{lang === 'ar' ? plan.features_ar : plan.features_en}</p>

                <Button size="lg" className={`w-full h-14 text-base ${plan.popular ? 'btn-primary-gradient btn-ripple shadow-glow' : ''}`} variant={plan.popular ? 'default' : 'outline'} asChild>
                  <a href="#contact">
                    <Crown className="h-5 w-5 ml-2" />
                    {lang === 'ar' ? 'اطلب عرض سعر' : 'Request Quote'}
                  </a>
                </Button>
              </Card>
            )
          })}
        </div>

        {/* Domain Options */}
        <div className="max-w-4xl mx-auto mb-16">
          <h3 className="text-2xl font-extrabold text-center mb-8 flex items-center justify-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            {lang === 'ar' ? 'خيارات الدومين' : 'Domain Options'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-2 border-emerald-500/40 bg-emerald-500/5 card-lift">
              <div className="flex items-start gap-3 mb-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-white shrink-0"><Globe className="h-6 w-6" /></div>
                <div>
                  <h4 className="font-bold text-lg">{lang === 'ar' ? 'الدومين المجاني' : 'Free Domain'}</h4>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5" dir="ltr">yourcompany.vercel.app</p>
                </div>
              </div>
              <div className="mb-3"><span className="text-3xl font-extrabold text-emerald-600">{lang === 'ar' ? 'مجاني' : 'Free'}</span></div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Info className="h-3.5 w-3.5" />{lang === 'ar' ? 'بدون أي رسوم إضافية' : 'No additional fees'}</p>
            </Card>
            <Card className="p-6 border-2 border-primary bg-primary/5 card-lift shadow-soft-lg relative">
              <div className="absolute -top-3 right-4 rounded-full gradient-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground shadow-soft">{lang === 'ar' ? 'موصى به' : 'Recommended'}</div>
              <div className="flex items-start gap-3 mb-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-white shrink-0"><Crown className="h-6 w-6" /></div>
                <div>
                  <h4 className="font-bold text-lg">{lang === 'ar' ? 'الدومين الاحترافي' : 'Professional Domain'}</h4>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5" dir="ltr">yourcompany.com</p>
                </div>
              </div>
              <div className="mb-3"><span className="text-3xl font-extrabold text-gradient">700 ج.م</span><span className="text-xs text-muted-foreground ms-1">{lang === 'ar' ? '/ السنة الأولى' : '/ first year'}</span></div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Info className="h-3.5 w-3.5" />{lang === 'ar' ? 'يشمل الحجز والربط والإعداد' : 'Includes registration, linking & setup'}</p>
            </Card>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-16">
          <h3 className="text-2xl font-extrabold text-center mb-8">{lang === 'ar' ? 'مقارنة المميزات' : 'Features Comparison'}</h3>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-4 text-start font-bold min-w-[200px]">{lang === 'ar' ? 'الميزة' : 'Feature'}</th>
                    <th className="px-4 py-4 text-center font-bold min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                        <span className="text-sm">Standard</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center font-bold min-w-[120px] bg-primary/10">
                      <div className="flex flex-col items-center gap-1">
                        <Crown className="h-5 w-5 text-primary" />
                        <span className="text-sm text-primary font-bold">Enterprise ⭐</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((f, i) => (
                    <tr key={i} className={`border-t border-border hover:bg-muted/30 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <f.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">{lang === 'ar' ? f.ar : f.en}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{renderValue(f.standard)}</td>
                      <td className="px-4 py-3 text-center bg-primary/5">{renderValue(f.enterprise)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Terms & Conditions */}
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 lg:p-8 bg-muted/30 border-dashed">
            <h3 className="text-xl font-extrabold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              {lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
            </h3>
            <ul className="space-y-3">
              {terms.map((term, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <div className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-primary text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</div>
                  <span className="leading-relaxed">{lang === 'ar' ? term.ar : term.en}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  )
}
