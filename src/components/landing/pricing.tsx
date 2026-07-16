'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Check, ShoppingCart, FileText, Package, Users, BarChart3,
  ShieldCheck, RefreshCw, Sparkles, Headphones, Globe, Crown,
  Calendar, Info,
} from 'lucide-react'

export function Pricing() {
  const { lang } = useApp()

  const features = [
    { icon: ShoppingCart, ar: 'إدارة المبيعات والفواتير', en: 'Sales & Invoices' },
    { icon: FileText, ar: 'إدارة المشتريات', en: 'Purchases' },
    { icon: Package, ar: 'إدارة المخازن', en: 'Inventory' },
    { icon: Users, ar: 'إدارة العملاء (CRM)', en: 'Customers (CRM)' },
    { icon: BarChart3, ar: 'إدارة الحسابات والتقارير', en: 'Accounts & Reports' },
    { icon: ShieldCheck, ar: 'إدارة المستخدمين والصلاحيات', en: 'Users & Permissions' },
    { icon: RefreshCw, ar: 'نسخ احتياطي دوري', en: 'Periodic Backups' },
    { icon: Sparkles, ar: 'تحديثات مجانية طوال الاشتراك', en: 'Free Updates' },
    { icon: Headphones, ar: 'دعم فني', en: 'Tech Support' },
  ]

  const domainOptions = [
    {
      icon: Globe,
      title_ar: 'الدومين المجاني',
      title_en: 'Free Domain',
      url: 'yourcompany.vercel.app',
      price_ar: 'مجاني',
      price_en: 'Free',
      desc_ar: 'بدون أي رسوم إضافية',
      desc_en: 'No additional fees',
      color: 'border-emerald-500/40 bg-emerald-500/5',
      iconBg: 'bg-emerald-500',
      popular: false,
    },
    {
      icon: Crown,
      title_ar: 'الدومين الاحترافي',
      title_en: 'Professional Domain',
      url: 'yourcompany.com',
      price_ar: '700 ج.م',
      price_en: '700 EGP',
      priceSuffix_ar: '/ السنة الأولى',
      priceSuffix_en: '/ first year',
      desc_ar: 'يشمل الحجز والربط والإعداد',
      desc_en: 'Includes registration, linking & setup',
      color: 'border-primary bg-primary/5',
      iconBg: 'gradient-primary',
      popular: true,
    },
  ]

  const terms = [
    { ar: 'الاشتراك يُدفع مقدمًا ويُجدد سنويًا.', en: 'Subscription is paid in advance and renewed yearly.' },
    { ar: 'يشمل الاشتراك الاستضافة والتحديثات والدعم الفني طوال مدة الاشتراك.', en: 'Subscription includes hosting, updates, and tech support during the subscription period.' },
    { ar: 'في حالة اختيار دومين احترافي، يتحمل العميل رسوم تجديد الدومين بعد السنة الأولى حسب سعر شركة تسجيل الدومين وقت التجديد.', en: 'If a professional domain is chosen, the customer bears domain renewal fees after the first year at the registrar\'s current rate.' },
    { ar: 'في حالة استخدام الدومين المجاني (Vercel)، لا توجد رسوم دومين.', en: 'If the free Vercel domain is used, there are no domain fees.' },
    { ar: 'لا يتم استرداد قيمة الاشتراك بعد تفعيل الخدمة.', en: 'Subscription fee is non-refundable after service activation.' },
  ]

  // Monthly price calculation: 4,999 EGP/year ÷ 12 ≈ 417 EGP/month
  const monthlyPrice = '417'
  const yearlyPrice = '4,999'

  return (
    <section id="pricing" className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 gradient-mesh opacity-50" />
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full glass border border-primary/30 px-4 py-1.5 text-sm font-semibold text-primary mb-6 animate-fade-in-down">
            <Crown className="h-4 w-4" />
            {lang === 'ar' ? 'أسعار OSA ERP' : 'OSA ERP Pricing'}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 animate-fade-in-up">
            {lang === 'ar' ? 'باقة واحدة. كل المميزات.' : 'One Plan. All Features.'}
          </h2>
          <p className="text-lg text-muted-foreground animate-fade-in-up delay-100">
            {lang === 'ar'
              ? 'باقة احترافية واحدة تشمل كل ما تحتاجه لإدارة شركتك — بدون تعقيد'
              : 'One professional plan with everything you need — no complexity'}
          </p>
        </div>

        {/* Main Pricing Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="relative p-1 overflow-hidden animate-fade-in-up delay-200 shadow-soft-xl">
            {/* Animated gradient border */}
            <div className="absolute inset-0 gradient-animated opacity-20" />

            <div className="relative rounded-[calc(1rem-1px)] bg-card p-8 lg:p-10">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-glow flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {lang === 'ar' ? 'الإطلاق الرسمي' : 'Official Launch'}
              </div>

              {/* Header */}
              <div className="text-center mb-8 mt-4">
                <div className="inline-grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow mb-4">
                  <Crown className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-extrabold mb-1">
                  <span className="text-gradient-navy">OSA ERP</span>{' '}
                  <span className="text-gradient">Professional</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar' ? 'الباقة الكاملة لإدارة مؤسستك' : 'Complete plan for your enterprise'}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5">
                <div className="flex items-end justify-center gap-2">
                  <span className="text-5xl md:text-6xl font-extrabold tracking-tight text-gradient">
                    {monthlyPrice}
                  </span>
                  <div className="text-start pb-2">
                    <div className="text-2xl font-bold">ج.م</div>
                    <div className="text-xs text-muted-foreground font-semibold">/ {lang === 'ar' ? 'شهرياً' : 'month'}</div>
                  </div>
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-semibold text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {lang === 'ar' ? `أو ${yearlyPrice} ج.م / سنة` : `or ${yearlyPrice} EGP / year`}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <p className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  {lang === 'ar' ? 'يشمل الباقة:' : 'Includes:'}
                </p>
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors animate-fade-in-left"
                    style={{ animationDelay: `${0.3 + (i * 0.05)}s` }}
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-lg gradient-accent text-white shrink-0">
                      <f.icon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm flex-1">{lang === 'ar' ? f.ar : f.en}</span>
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full h-14 text-base btn-primary-gradient btn-ripple shadow-glow"
                asChild
              >
                <a href="#contact">
                  <Crown className="h-5 w-5 ml-2" />
                  {lang === 'ar' ? 'اطلب اشتراكك الآن' : 'Subscribe Now'}
                </a>
              </Button>
            </div>
          </Card>
        </div>

        {/* Domain Options */}
        <div className="max-w-4xl mx-auto mb-16">
          <h3 className="text-2xl font-extrabold text-center mb-8 flex items-center justify-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            {lang === 'ar' ? 'خيارات الدومين' : 'Domain Options'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {domainOptions.map((opt, i) => (
              <Card
                key={i}
                className={`p-6 border-2 ${opt.color} card-lift animate-fade-in-up relative ${opt.popular ? 'shadow-soft-lg' : ''}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {opt.popular && (
                  <div className="absolute -top-3 right-4 rounded-full gradient-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground shadow-soft">
                    {lang === 'ar' ? 'موصى به' : 'Recommended'}
                  </div>
                )}

                <div className="flex items-start gap-3 mb-4">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${opt.iconBg} text-white shrink-0`}>
                    <opt.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{lang === 'ar' ? opt.title_ar : opt.title_en}</h4>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5" dir="ltr">{opt.url}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-3xl font-extrabold text-gradient">{lang === 'ar' ? opt.price_ar : opt.price_en}</span>
                  {opt.priceSuffix_ar && (
                    <span className="text-xs text-muted-foreground ms-1">
                      {lang === 'ar' ? opt.priceSuffix_ar : opt.priceSuffix_en}
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  {lang === 'ar' ? opt.desc_ar : opt.desc_en}
                </p>
              </Card>
            ))}
          </div>
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
                  <div className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-primary text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
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
