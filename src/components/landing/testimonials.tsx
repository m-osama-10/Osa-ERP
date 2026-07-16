'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  { name_ar: 'أحمد المصري', name_en: 'Ahmed Elmasry', role_ar: 'مدير عام - شركة النور', role_en: 'CEO - Al-Noor Co.', text_ar: 'نظام ممتاز! ساعدنا في تنظيم كل أعمالنا من محاسبة ومبيعات ومخزون في مكان واحد. وفّر علينا وقت وجهد كبير.', text_en: 'Excellent system! Helped us organize all our work — accounting, sales, inventory — in one place. Saved us a lot of time and effort.', rating: 5 },
  { name_ar: 'سارة عبد الله', name_en: 'Sarah Abdullah', role_ar: 'محاسبة - شركة الأفق', role_en: 'Accountant - Al-Ufuq Co.', text_ar: 'تقارير الأرباح والخسائر دقيقة جداً، والـ PDF احترافي بشعار الشركة. أصبح إعداد التقارير الشهرية أسهل بكثير.', text_en: 'P&L reports are very accurate, and the PDF export is professional with the company logo. Monthly reports are much easier now.', rating: 5 },
  { name_ar: 'محمد خالد', name_en: 'Mohammed Khaled', role_ar: 'صاحب سلسلة محلات', role_en: 'Shop Chain Owner', text_ar: 'نقطة البيع POS ممتازة وسريعة. أنجزت مئات المبيعات يومياً بدون مشاكل. التطبيق المخصص للمندوبين مفيد جداً.', text_en: 'POS is excellent and fast. I processed hundreds of daily sales without issues. The rep mobile app is very useful.', rating: 5 },
  { name_ar: 'فاطمة الزهراء', name_en: 'Fatima Al-Zahraa', role_ar: 'مديرة HR - مجموعة السلام', role_en: 'HR Manager - Al-Salam Group', text_ar: 'إدارة الحضور والرواتب أصبحت أسهل. النظام يتعامل مع 8 أقسام و 200+ موظف بدون أي مشاكل. أنصح به بشدة.', text_en: 'Attendance and payroll management is easier now. The system handles 8 departments and 200+ employees without issues. Highly recommend.', rating: 5 },
  { name_ar: 'خالد العتيبي', name_en: 'Khalid Al-Otaibi', role_ar: 'مدير مالي', role_en: 'CFO', text_ar: 'نظام الصلاحيات احترافي جداً، و الـ Audit Log يعطينا شفافية كاملة. ندرك كل من قام بأي تعديل ومتى.', text_en: 'The permissions system is very professional, and the Audit Log gives us full transparency. We know who did what and when.', rating: 5 },
]

export function Testimonials() {
  const { lang } = useApp()
  const [current, setCurrent] = React.useState(0)

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Star className="h-4 w-4" />
            {lang === 'ar' ? 'آراء العملاء' : 'Testimonials'}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            {lang === 'ar' ? 'عملاؤنا يحبوننا' : 'Our Clients Love Us'}
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 relative">
            <Quote className="absolute top-6 right-6 h-12 w-12 text-primary/20" />

            <div className="text-center">
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                "{lang === 'ar' ? testimonials[current].text_ar : testimonials[current].text_en}"
              </p>

              <div>
                <p className="font-bold text-lg">
                  {lang === 'ar' ? testimonials[current].name_ar : testimonials[current].name_en}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar' ? testimonials[current].role_ar : testimonials[current].role_en}
                </p>
              </div>
            </div>
          </Card>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${current === i ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/40'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
