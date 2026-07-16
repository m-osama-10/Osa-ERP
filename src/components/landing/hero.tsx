'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/components/erp/app-context'
import { Rocket, Calendar, Play, ArrowLeft, TrendingUp, Users, Building2, CheckCircle2 } from 'lucide-react'

function AnimatedCounter({ value, suffix = '', duration = 2000 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = React.useState(0)
  const ref = React.useRef<HTMLSpanElement>(null)
  const started = React.useRef(false)

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const steps = 60
        const stepValue = value / steps
        let current = 0
        const interval = setInterval(() => {
          current += stepValue
          if (current >= value) {
            setCount(value)
            clearInterval(interval)
          } else {
            setCount(Math.floor(current))
          }
        }, duration / steps)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, duration])

  return <span ref={ref}>{count.toLocaleString('en-US')}{suffix}</span>
}

export function Hero() {
  const { lang, setUser } = useApp()

  const quickDemo = async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@osa-erp.com', password: 'Demo@2026' })
    })
    if (res.ok) {
      const data = await res.json()
      setUser(data)
    }
  }

  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-10 left-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute inset-0 grid-bg opacity-40" />
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 animate-in-fade">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {lang === 'ar' ? 'الإصدار 3.0 متاح الآن' : 'Version 3.0 Now Available'}
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            {lang === 'ar' ? (
              <>
                كل ما تحتاجه لإدارة <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">شركتك</span> في نظام واحد
              </>
            ) : (
              <>
                Everything you need to run your <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">business</span> in one system
              </>
            )}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            {lang === 'ar'
              ? 'نظام ERP متكامل بالمحاسبة والمبيعات والمخازن والموارد البشرية. مبني بأحدث التقنيات، آمن، سريع، ومدعوم بالجنيه المصري والدولار الأمريكي مع تقارير احترافية.'
              : 'A complete ERP system with accounting, sales, inventory, and HR. Built with modern tech, secure, fast, and backed with multi-currency support and professional reports.'}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button onClick={quickDemo} size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-primary to-primary/70 hover:opacity-90 shadow-xl">
              <Rocket className="h-5 w-5 ml-2" />
              {lang === 'ar' ? 'جرّب النسخة التجريبية' : 'Try Free Demo'}
              <ArrowLeft className="h-4 w-4 ml-2 rtl:rotate-180" />
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 text-base" asChild>
              <a href="#demo">
                <Calendar className="h-5 w-5 ml-2" />
                {lang === 'ar' ? 'احجز Demo' : 'Book a Demo'}
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Users, value: 1200, suffix: '+', labelAr: 'عميل نشط', labelEn: 'Active Clients' },
              { icon: TrendingUp, value: 850000, suffix: '+', labelAr: 'فاتورة مُصدرة', labelEn: 'Invoices Generated' },
              { icon: Building2, value: 350, suffix: '+', labelAr: 'شركة تستخدمنا', labelEn: 'Companies Using Us' },
              { icon: CheckCircle2, value: 99, suffix: '%', labelAr: 'رضا العملاء', labelEn: 'Client Satisfaction' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary mb-3 mx-auto">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">
                  {lang === 'ar' ? stat.labelAr : stat.labelEn}
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard mockup preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-x-0 -top-4 h-32 bg-gradient-to-b from-transparent to-background z-10 pointer-events-none" />
            <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 text-center text-xs text-muted-foreground font-mono">osa-erp.com/dashboard</div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-br from-primary/5 to-transparent">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="rounded-xl border border-border bg-card p-4">
                    <div className="h-2 w-20 bg-muted rounded mb-3" />
                    <div className="h-8 w-24 bg-primary/20 rounded mb-2" />
                    <div className="h-2 w-16 bg-muted rounded" />
                  </div>
                ))}
                <div className="md:col-span-4 rounded-xl border border-border bg-card p-6 h-48">
                  <div className="h-2 w-32 bg-muted rounded mb-4" />
                  <div className="flex items-end gap-2 h-32">
                    {[40, 65, 50, 80, 70, 95, 85, 60, 75].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
