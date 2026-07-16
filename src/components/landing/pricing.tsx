'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, ChevronDown } from 'lucide-react'

const plans = [
  {
    name_ar: 'Starter',
    name_en: 'Starter',
    price_ar: '٤٩٩',
    price_en: '499',
    period_ar: 'شهرياً',
    period_en: '/month',
    desc_ar: 'للأعمال الصغيرة والشركات الناشئة',
    desc_en: 'For small businesses and startups',
    color: 'border-blue-500',
    popular: false,
    features_ar: [
      'حتى 3 مستخدمين',
      'فرع واحد',
      'المحاسبة الأساسية',
      'إدارة العملاء والموردين',
      'الفواتير والمشتريات',
      'المخازن',
      'تقارير أساسية',
      'دعم عبر البريد',
    ],
    features_en: [
      'Up to 3 users',
      'Single branch',
      'Basic accounting',
      'Customer & supplier management',
      'Invoices & purchases',
      'Inventory',
      'Basic reports',
      'Email support',
    ],
    notIncluded_ar: ['POS نقطة البيع', 'تطبيق المندوبين', 'API'],
    notIncluded_en: ['POS', 'Rep mobile app', 'API'],
  },
  {
    name_ar: 'Professional',
    name_en: 'Professional',
    price_ar: '٩٩٩',
    price_en: '999',
    period_ar: 'شهرياً',
    period_en: '/month',
    desc_ar: 'الأنسب للشركات المتوسطة',
    desc_en: 'Best for medium businesses',
    color: 'border-primary ring-2 ring-primary',
    popular: true,
    features_ar: [
      'مستخدمين غير محدودين',
      'حتى 5 فروع',
      'كل مميزات Starter',
      'POS نقطة البيع',
      'الموارد البشرية HR',
      'تقارير الربحية',
      'تصدير PDF و Excel',
      'إدارة العملات',
      'دعم priority 24/7',
    ],
    features_en: [
      'Unlimited users',
      'Up to 5 branches',
      'All Starter features',
      'POS',
      'HR module',
      'Profitability reports',
      'PDF & Excel export',
      'Currency management',
      'Priority 24/7 support',
    ],
    notIncluded_ar: ['تطبيق المندوبين', 'API كامل'],
    notIncluded_en: ['Rep mobile app', 'Full API'],
  },
  {
    name_ar: 'Enterprise',
    name_en: 'Enterprise',
    price_ar: '١٩٩٩',
    price_en: '1999',
    period_ar: 'شهرياً',
    period_en: '/month',
    desc_ar: 'للشركات الكبيرة والمؤسسات',
    desc_en: 'For large companies & enterprises',
    color: 'border-purple-500',
    popular: false,
    features_ar: [
      'كل مميزات Professional',
      'فروع غير محدودة',
      'تطبيق المندوبين',
      'API كامل',
      'تخصيصات متقدمة',
      'خادم مخصص (Dedicated)',
      'تكامل مع أنظمة خارجية',
      'تدريب الفريق',
      'مدير حساب مخصص',
      'SLA 99.9%',
    ],
    features_en: [
      'All Professional features',
      'Unlimited branches',
      'Rep mobile app',
      'Full API',
      'Advanced customizations',
      'Dedicated server',
      'External systems integration',
      'Team training',
      'Dedicated account manager',
      'SLA 99.9%',
    ],
    notIncluded_ar: [],
    notIncluded_en: [],
  },
]

export function Pricing() {
  const { lang } = useApp()

  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            {lang === 'ar' ? 'الأسعار' : 'Pricing'}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            {lang === 'ar' ? 'باقات تناسب احتياجاتك' : 'Plans That Fit Your Needs'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {lang === 'ar' ? 'اختر الباقة المناسبة — يمكنك الترقية في أي وقت' : 'Choose the right plan — upgrade anytime'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <Card key={i} className={`p-8 relative ${plan.color} ${plan.popular ? 'shadow-2xl scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                  {lang === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                </div>
              )}

              <h3 className="text-2xl font-bold mb-1">{lang === 'ar' ? plan.name_ar : plan.name_en}</h3>
              <p className="text-sm text-muted-foreground mb-6">{lang === 'ar' ? plan.desc_ar : plan.desc_en}</p>

              <div className="mb-6">
                <span className="text-4xl font-extrabold">{lang === 'ar' ? plan.price_ar : plan.price_en}</span>
                <span className="text-lg text-muted-foreground"> {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                <span className="text-sm text-muted-foreground ms-1">{lang === 'ar' ? plan.period_ar : plan.period_en}</span>
              </div>

              <Button
                variant={plan.popular ? 'default' : 'outline'}
                className="w-full mb-6"
                asChild
              >
                <a href="#contact">
                  {lang === 'ar' ? 'اطلب عرض سعر' : 'Request Quote'}
                </a>
              </Button>

              <div className="space-y-2">
                {(lang === 'ar' ? plan.features_ar : plan.features_en).map((f, j) => (
                  <div key={j} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
                {(lang === 'ar' ? plan.notIncluded_ar : plan.notIncluded_en).map((f, j) => (
                  <div key={j} className="flex items-start gap-2 text-sm text-muted-foreground/60">
                    <X className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="line-through">{f}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
