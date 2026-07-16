'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Zap, Shield, Headphones, RefreshCw, Smile, Cloud } from 'lucide-react'

export function WhyUs() {
  const { lang } = useApp()

  const reasons = [
    { icon: Zap, ar: 'سرعة فائقة', en: 'Lightning Fast', desc_ar: 'Next.js 16 + Turbopack لأداء عالٍ', desc_en: 'Next.js 16 + Turbopack for high performance', color: 'bg-amber-500' },
    { icon: Shield, ar: 'أمان قوي', en: 'Strong Security', desc_ar: 'HMAC sessions + bcrypt + RBAC', desc_en: 'HMAC sessions + bcrypt + RBAC', color: 'bg-red-500' },
    { icon: Headphones, ar: 'دعم فني', en: 'Tech Support', desc_ar: 'فريق دعم متخصص 24/7', desc_en: 'Specialized support team 24/7', color: 'bg-blue-500' },
    { icon: RefreshCw, ar: 'تحديثات مستمرة', en: 'Continuous Updates', desc_ar: 'ميزات جديدة كل شهر', desc_en: 'New features every month', color: 'bg-emerald-500' },
    { icon: Smile, ar: 'سهولة الاستخدام', en: 'Easy to Use', desc_ar: 'واجهة بسيطة بالعربية والإنجليزية', desc_en: 'Simple bilingual interface', color: 'bg-purple-500' },
    { icon: Cloud, ar: 'نسخة سحابية', en: 'Cloud Edition', desc_ar: 'وصول من أي مكان وأي جهاز', desc_en: 'Access from anywhere, any device', color: 'bg-cyan-500' },
  ]

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            {lang === 'ar' ? 'لماذا نحن؟' : 'Why Us?'}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            {lang === 'ar' ? 'لماذا تختار Osa ERP؟' : 'Why Choose Osa ERP?'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {lang === 'ar' ? 'مميزات تجعلنا الخيار الأفضل لإدارة أعمالك' : 'Features that make us the best choice for your business'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reasons.map((r, i) => (
            <Card key={i} className="p-8 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className={`inline-grid h-16 w-16 place-items-center rounded-2xl ${r.color} text-white mb-4`}>
                <r.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{lang === 'ar' ? r.ar : r.en}</h3>
              <p className="text-muted-foreground">{lang === 'ar' ? r.desc_ar : r.desc_en}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
