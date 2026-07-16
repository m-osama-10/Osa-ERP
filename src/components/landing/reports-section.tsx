'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { FileText, FileSpreadsheet, Printer, Image as ImageIcon, TrendingUp, Calendar, BarChart3 } from 'lucide-react'

export function ReportsSection() {
  const { lang } = useApp()

  const reports = [
    { icon: BarChart3, ar: 'Dashboard احترافي', en: 'Pro Dashboard', color: 'bg-blue-500' },
    { icon: TrendingUp, ar: 'أرباح وخسائر لفترة', en: 'Period P&L', color: 'bg-emerald-500' },
    { icon: Calendar, ar: 'مقارنة الفترات', en: 'Period Comparison', color: 'bg-purple-500' },
    { icon: FileText, ar: 'تقارير العملاء', en: 'Customer Reports', color: 'bg-amber-500' },
    { icon: FileText, ar: 'تقارير الموردين', en: 'Supplier Reports', color: 'bg-pink-500' },
    { icon: FileText, ar: 'تقارير المبيعات', en: 'Sales Reports', color: 'bg-cyan-500' },
    { icon: FileText, ar: 'تقارير المخزون', en: 'Inventory Reports', color: 'bg-teal-500' },
    { icon: BarChart3, ar: 'رسوم بيانية', en: 'Charts', color: 'bg-indigo-500' },
  ]

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <FileText className="h-4 w-4" />
              {lang === 'ar' ? 'تقارير احترافية' : 'Professional Reports'}
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
              {lang === 'ar' ? 'تقارير ذكية لقرارات أفضل' : 'Smart Reports for Better Decisions'}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {lang === 'ar'
                ? 'تصدير PDF احترافي منسّق بشعار الشركة + Excel متعدد الأوراق + طباعة مباشرة. كل التقارير تدعم إضافة شعار الشركة وبياناتها.'
                : 'Professional PDF export with company logo + multi-sheet Excel + direct printing. All reports support adding company logo and info.'}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {reports.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl ${r.color} text-white`}>
                    <r.icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-sm">{lang === 'ar' ? r.ar : r.en}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export options card */}
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-transparent">
            <h3 className="text-xl font-bold mb-6">{lang === 'ar' ? 'خيارات التصدير' : 'Export Options'}</h3>

            <div className="space-y-4">
              {[
                { icon: FileText, label: 'PDF', desc: lang === 'ar' ? 'منسّق بشعار الشركة وأرقام صفحات' : 'Formatted with logo & page numbers', color: 'bg-red-500' },
                { icon: FileSpreadsheet, label: 'Excel (.xlsx)', desc: lang === 'ar' ? 'متعدد الأوراق للتحليل' : 'Multi-sheet for analysis', color: 'bg-emerald-500' },
                { icon: Printer, label: 'Print', desc: lang === 'ar' ? 'طباعة مباشرة من المتصفح' : 'Direct browser printing', color: 'bg-blue-500' },
                { icon: ImageIcon, label: 'Logo & Branding', desc: lang === 'ar' ? 'شعار الشركة على كل تقرير' : 'Company logo on every report', color: 'bg-amber-500' },
              ].map((opt, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 transition-colors">
                  <div className={`grid h-12 w-12 place-items-center rounded-xl ${opt.color} text-white`}>
                    <opt.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold">{opt.label}</p>
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
