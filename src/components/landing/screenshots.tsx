'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

const screenshots = [
  { src: '/screenshots/dashboard.png', title_ar: 'لوحة التحكم', title_en: 'Dashboard' },
  { src: '/screenshots/hr.png', title_ar: 'الموارد البشرية', title_en: 'Human Resources' },
  { src: '/screenshots/attendance.png', title_ar: 'الحضور والانصراف', title_en: 'Attendance' },
  { src: '/screenshots/treasury.png', title_ar: 'الخزائن والبنوك', title_en: 'Treasury & Banks' },
  { src: '/screenshots/profitability.png', title_ar: 'الربحية والخسائر', title_en: 'Profitability' },
  { src: '/screenshots/representatives.png', title_ar: 'المندوبين', title_en: 'Representatives' },
  { src: '/screenshots/purchases.png', title_ar: 'المشتريات', title_en: 'Purchases' },
  { src: '/screenshots/branches.png', title_ar: 'الفروع', title_en: 'Branches' },
  { src: '/screenshots/currencies.png', title_ar: 'العملات', title_en: 'Currencies' },
  { src: '/screenshots/permissions.png', title_ar: 'الصلاحيات', title_en: 'Permissions' },
]

export function ScreenshotsSlider() {
  const { lang } = useApp()
  const [current, setCurrent] = React.useState(0)
  const [lightbox, setLightbox] = React.useState(false)

  const next = () => setCurrent(c => (c + 1) % screenshots.length)
  const prev = () => setCurrent(c => (c - 1 + screenshots.length) % screenshots.length)

  React.useEffect(() => {
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full glass border border-primary/30 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
            {lang === 'ar' ? 'معرض الصور' : 'Screenshots'}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            {lang === 'ar' ? 'نظرة على النظام الحقيقي' : 'Real System Screenshots'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {lang === 'ar' ? 'صور حقيقية من نظام OSA ERP' : 'Actual screenshots from OSA ERP'}
          </p>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-soft-xl">
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${current * 100}%)` }}>
              {screenshots.map((s, i) => (
                <div key={i} className="min-w-full relative">
                  <img src={s.src} alt={lang === 'ar' ? s.title_ar : s.title_en} className="w-full h-64 md:h-96 object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white">
                    <h3 className="text-xl md:text-2xl font-bold drop-shadow-lg">
                      {lang === 'ar' ? s.title_ar : s.title_en}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={prev} className="absolute top-1/2 left-4 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full glass-strong hover:bg-background transition-colors">
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button onClick={next} className="absolute top-1/2 right-4 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full glass-strong hover:bg-background transition-colors">
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button onClick={() => setLightbox(true)} className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-lg glass-strong hover:bg-background transition-colors">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
            {screenshots.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-16 w-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${current === i ? 'border-primary scale-105' : 'border-border opacity-60 hover:opacity-100'}`}
              >
                <img src={s.src} alt="" className="h-full w-full object-cover object-top" />
              </button>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightbox(false)}>
            <button className="absolute top-4 right-4 text-white text-2xl" onClick={() => setLightbox(false)}>✕</button>
            <img src={screenshots[current].src} alt="" className="max-w-full max-h-full rounded-xl" onClick={e => e.stopPropagation()} />
            <h3 className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-xl font-bold">
              {lang === 'ar' ? screenshots[current].title_ar : screenshots[current].title_en}
            </h3>
          </div>
        )}
      </div>
    </section>
  )
}
