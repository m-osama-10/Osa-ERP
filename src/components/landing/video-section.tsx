'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Play, Youtube } from 'lucide-react'

export function VideoSection() {
  const { lang } = useApp()
  const [playing, setPlaying] = React.useState(false)

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Youtube className="h-4 w-4" />
            {lang === 'ar' ? 'فيديو توضيحي' : 'Demo Video'}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            {lang === 'ar' ? 'شاهد النظام أثناء العمل' : 'See The System In Action'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {lang === 'ar' ? 'فيديو شامل يشرح كل المميزات في 5 دقائق' : 'A comprehensive video explaining all features in 5 minutes'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-video rounded-2xl border border-border shadow-2xl overflow-hidden bg-gradient-to-br from-primary to-primary/70">
            {!playing ? (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 grid place-items-center group"
              >
                <div className="grid h-20 w-20 place-items-center rounded-full bg-white/90 group-hover:scale-110 transition-transform shadow-2xl">
                  <Play className="h-10 w-10 text-primary ms-1" fill="currentColor" />
                </div>
                <p className="absolute bottom-8 text-white font-medium">
                  {lang === 'ar' ? 'اضغط للتشغيل' : 'Click to play'}
                </p>
              </button>
            ) : (
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Osa ERP Demo"
                allow="accelerated-with-tests; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
