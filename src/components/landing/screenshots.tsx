'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'

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
  const [loaded, setLoaded] = React.useState<Record<number, boolean>>({})

  const next = React.useCallback(() => setCurrent(c => (c + 1) % screenshots.length), [])
  const prev = React.useCallback(() => setCurrent(c => (c - 1 + screenshots.length) % screenshots.length), [])

  React.useEffect(() => {
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [next])

  const currentScreenshot = screenshots[current]

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

        <div className="max-w-5xl mx-auto">
          {/* Main image display — show only current image */}
          <div className="relative rounded-2xl border border-border shadow-soft-xl overflow-hidden bg-muted/30">
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              {/* Loading skeleton */}
              {!loaded[current] && (
                <div className="absolute inset-0 skeleton rounded-2xl" />
              )}
              <img
                key={current}
                src={currentScreenshot.src}
                alt={lang === 'ar' ? currentScreenshot.title_ar : currentScreenshot.title_en}
                className={`w-full h-full object-contain object-top transition-opacity duration-300 ${loaded[current] ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setLoaded(prev => ({ ...prev, [current]: true }))}
                onError={() => setLoaded(prev => ({ ...prev, [current]: true }))}
              />
              {/* Gradient overlay + title */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white pointer-events-none">
                <h3 className="text-lg md:text-2xl font-bold drop-shadow-lg">
                  {lang === 'ar' ? currentScreenshot.title_ar : currentScreenshot.title_en}
                </h3>
                <p className="text-xs opacity-75 mt-0.5">{current + 1} / {screenshots.length}</p>
              </div>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={prev}
              className="absolute top-1/2 left-3 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full glass-strong hover:bg-background transition-colors z-10"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button
              onClick={next}
              className="absolute top-1/2 right-3 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full glass-strong hover:bg-background transition-colors z-10"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>

            {/* Expand button */}
            <button
              onClick={() => setLightbox(true)}
              className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-lg glass-strong hover:bg-background transition-colors z-10"
              aria-label="Expand"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
            {screenshots.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-14 w-20 md:h-16 md:w-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${current === i ? 'border-primary scale-105 shadow-soft' : 'border-border opacity-60 hover:opacity-100'}`}
              >
                <img src={s.src} alt="" className="h-full w-full object-cover object-top" />
              </button>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setLightbox(false)}
          >
            <button className="absolute top-4 right-4 text-white text-2xl z-10" onClick={() => setLightbox(false)}>
              <X className="h-8 w-8" />
            </button>
            <img
              src={currentScreenshot.src}
              alt={lang === 'ar' ? currentScreenshot.title_ar : currentScreenshot.title_en}
              className="max-w-full max-h-[90vh] rounded-xl"
              onClick={e => e.stopPropagation()}
            />
            <h3 className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-xl font-bold">
              {lang === 'ar' ? currentScreenshot.title_ar : currentScreenshot.title_en}
            </h3>
          </div>
        )}
      </div>
    </section>
  )
}
