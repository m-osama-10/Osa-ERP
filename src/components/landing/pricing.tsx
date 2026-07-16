'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Check, X, ShoppingCart, FileText, Package, Users, BarChart3,
  ShieldCheck, RefreshCw, Sparkles, Headphones, Globe, Crown,
  Calendar, Info, Building2, Wallet, Star,
} from 'lucide-react'

export function Pricing() {
  const { lang } = useApp()

  const monthlyPrice = '417'
  const yearlyPrice = '4,999'

  const comparisonFeatures = [
    { icon: ShoppingCart, ar: 'إدارة المبيعات والفواتير', en: 'Sales & Invoices', starter: true, pro: true, ent: true },
    { icon: FileText, ar: 'إدارة المشتريات', en: 'Purchases', starter: true, pro: true, ent: true },
    { icon: Package, ar: 'إدارة المخازن', en: 'Inventory', starter: true, pro: true, ent: true },
    { icon: Users, ar: 'إدارة العملاء (CRM)', en: 'Customers (CRM)', starter: true, pro: true, ent: true },
    { icon: BarChart3, ar: 'إدارة الحسابات والتقارير', en: 'Accounts & Reports', starter: true, pro: true, ent: true },
    { icon: ShieldCheck, ar: 'إدارة المستخدمين والصلاحيات', en: 'Users & Permissions', starter: true, pro: true, ent: true },
    { icon: RefreshCw, ar: 'نسخ احتياطي دوري', en: 'Periodic Backups', starter: true, pro: true, ent: true },
    { icon: Sparkles, ar: 'تحديثات مجانية', en: 'Free Updates', starter: true, pro: true, ent: true },
    { icon: Headphones, ar: 'دعم فني', en: 'Tech Support', starter: 'email', pro: 'priority', ent: 'dedicated' },
    { icon: Globe, ar: 'دومين مجاني (Vercel)', en: 'Free Domain (Vercel)', starter: true, pro: true, ent: true },
    { icon: Crown, ar: 'دومين احترافي (.com)', en: 'Professional Domain', starter: false, pro: '700 EGP', ent: true },
    { icon: Users, ar: 'عدد المستخدمين', en: 'Users', starter: '3', pro: 'unlimited', ent: 'unlimited' },
    { icon: Building2, ar: 'عدد الفروع', en: 'Branches', starter: '1', pro: '5', ent: 'unlimited' },
    { icon: Wallet, ar: 'نقطة البيع (POS)', en: 'POS', starter: false, pro: true, ent: true },
    { icon: Users, ar: 'الموارد البشرية (HR)', en: 'HR Module', starter: false, pro: true, ent: true },
    { icon: BarChart3, ar: 'تقارير الربحية', en: 'Profitability Reports', starter: false, pro: true, ent: true },
    { icon: FileText, ar: 'تصدير PDF و Excel', en: 'PDF & Excel Export', starter: 'basic', pro: true, ent: true },
    { icon: Globe, ar: 'API كامل', en: 'Full API', starter: false, pro: false, ent: true },
    { icon: Crown, ar: 'خادم مخصص', en: 'Dedicated Server', starter: false, pro: false, ent: true },
    { icon: Star, ar: 'تدريب الفريق', en: 'Team Training', starter: false, pro: false, ent: true },
  ]

  const renderValue = (val: any) => {
    if (val === true) return <Check className="h-5 w-5 text-emerald-500 mx-auto" />
    if (val === false) return <X className="h-5 w-5 text-red-400 mx-auto" />
    return <span className="text-xs font-bold">{val}</span>
  }

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
            {lang === 'ar' ? 'باقة احترافية واحدة تشمل كل ما تحتاجه — بدون تعقيد' : 'One professional plan with everything you need'}
          </p>
        </div>

        {/* Main Pricing Card */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="relative p-1 overflow-hidden animate-fade-in-up delay-200 shadow-soft-xl">
            <div className="absolute inset-0 gradient-animated opacity-20" />
            <div className="relative rounded-[calc(1rem-1px)] bg-card p-8 lg:p-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-glow flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {lang === 'ar' ? 'الإطلاق الرسمي' : 'Official Launch'}
              </div>

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

              <div className="text-center mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5">
                <div className="flex items-end justify-center gap-2">
                  <span className="text-5xl md:text-6xl font-extrabold tracking-tight text-gradient">{monthlyPrice}</span>
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

              <Button size="lg" className="w-full h-14 text-base btn-primary-gradient btn-ripple shadow-glow" asChild>
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
        <div className="max-w-5xl mx-auto mb-16">
          <h3 className="text-2xl font-extrabold text-center mb-8">{lang === 'ar' ? 'مقارنة المميزات' : 'Features Comparison'}</h3>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-4 text-start font-bold min-w-[200px]">{lang === 'ar' ? 'الميزة' : 'Feature'}</th>
                    <th className="px-4 py-4 text-center font-bold min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground">Starter</span>
                        <span className="text-lg font-extrabold">٤٩٩</span>
                        <span className="text-[10px] text-muted-foreground">ج.م/شهر</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center font-bold min-w-[100px] bg-primary/10">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-primary font-bold">Professional ⭐</span>
                        <span className="text-lg font-extrabold text-primary">٤١٧</span>
                        <span className="text-[10px] text-muted-foreground">ج.م/شهر</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center font-bold min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground">Enterprise</span>
                        <span className="text-lg font-extrabold">٨٣٣</span>
                        <span className="text-[10px] text-muted-foreground">ج.م/شهر</span>
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
                      <td className="px-4 py-3 text-center">{renderValue(f.starter)}</td>
                      <td className="px-4 py-3 text-center bg-primary/5">{renderValue(f.pro)}</td>
                      <td className="px-4 py-3 text-center">{renderValue(f.ent)}</td>
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
              {[
                { ar: 'الاشتراك يُدفع مقدمًا ويُجدد سنويًا.', en: 'Subscription is paid in advance and renewed yearly.' },
                { ar: 'يشمل الاشتراك الاستضافة والتحديثات والدعم الفني طوال مدة الاشتراك.', en: 'Includes hosting, updates, and tech support during subscription.' },
                { ar: 'في حالة اختيار دومين احترافي، يتحمل العميل رسوم تجديد الدومين بعد السنة الأولى.', en: 'Professional domain renewal after first year at registrar rate.' },
                { ar: 'في حالة استخدام الدومين المجاني (Vercel)، لا توجد رسوم دومين.', en: 'Free Vercel domain has no domain fees.' },
                { ar: 'لا يتم استرداد قيمة الاشتراك بعد تفعيل الخدمة.', en: 'Non-refundable after activation.' },
              ].map((term, i) => (
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
