'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const screenshots = [
  { title_ar: 'لوحة التحكم', title_en: 'Dashboard', color: 'from-blue-500 to-blue-700' },
  { title_ar: 'المحاسبة', title_en: 'Accounting', color: 'from-emerald-500 to-emerald-700' },
  { title_ar: 'نقطة البيع POS', title_en: 'POS', color: 'from-purple-500 to-purple-700' },
  { title_ar: 'المخازن', title_en: 'Inventory', color: 'from-amber-500 to-amber-700' },
  { title_ar: 'الربحية', title_en: 'Profitability', color: 'from-pink-500 to-pink-700' },
  { title_ar: 'الموارد البشرية', title_en: 'HR', color: 'from-cyan-500 to-cyan-700' },
]

export function ScreenshotsSlider() {
  const { lang } = useApp()
  const [current, setCurrent] = React.useState(0)

  const next = () => setCurrent(c => (c + 1) % screenshots.length)
  const prev = () => setCurrent(c => (c - 1 + screenshots.length) % screenshots.length)

  React.useEffect(() => {
    const interval = setInterval(next, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            {lang === 'ar' ? 'معرض الصور' : 'Screenshots'}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            {lang === 'ar' ? 'نظرة على النظام' : 'A Look Inside'}
          </h2>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-2xl">
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${current * 100}%)` }}>
              {screenshots.map((s, i) => (
                <div key={i} className="min-w-full">
                  <div className={`h-64 md:h-96 bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                    <div className="text-center text-white">
                      <div className="text-6xl mb-3">📊</div>
                      <h3 className="text-2xl md:text-3xl font-bold">
                        {lang === 'ar' ? s.title_ar : s.title_en}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation arrows */}
            <button onClick={prev} className="absolute top-1/2 left-4 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-background/80 backdrop-blur hover:bg-background">
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button onClick={next} className="absolute top-1/2 right-4 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-background/80 backdrop-blur hover:bg-background">
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {screenshots.map((_, i) => (
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
