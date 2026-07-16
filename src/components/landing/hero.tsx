'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/components/erp/app-context'
import { Rocket, Calendar, Play, ArrowLeft, TrendingUp, Users, Building2, CheckCircle2, Sparkles, Lock, DollarSign } from 'lucide-react'

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
  const { lang, setUser, setShowLogin } = useApp()

  const quickDemo = async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@osaerp.com', password: 'Demo@123' })
    })
    if (res.ok) {
      const data = await res.json()
      setUser(data)
    }
  }

  const goLogin = () => {
    setShowLogin(true)
  }

  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-20 right-20 h-72 w-72 rounded-full gradient-accent opacity-20 blur-3xl animate-float" />
        <div className="absolute bottom-10 left-20 h-96 w-96 rounded-full gradient-primary opacity-20 blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl animate-float" />
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full glass border border-primary/30 px-4 py-1.5 text-sm font-semibold text-primary mb-6 animate-fade-in-down">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full gradient-primary" />
            </span>
            {lang === 'ar' ? 'الإصدار 3.0 متاح الآن' : 'Version 3.0 Now Available'}
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6 animate-fade-in-up">
            {lang === 'ar' ? (
              <>
                كل ما تحتاجه لإدارة <span className="text-gradient">شركتك</span> في نظام واحد
              </>
            ) : (
              <>
                Everything you need to run your <span className="text-gradient">business</span> in one system
              </>
            )}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-100">
            {lang === 'ar'
              ? 'نظام ERP متكامل بالمحاسبة والمبيعات والمخازن والموارد البشرية. مبني بأحدث التقنيات، آمن، سريع، ومدعوم بالجنيه المصري مع تقارير احترافية.'
              : 'A complete ERP system with accounting, sales, inventory, and HR. Built with modern tech, secure, fast, and backed with EGP support and professional reports.'}
          </p>

          {/* CTA buttons — 3 buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 animate-fade-in-up delay-200">
            <Button onClick={quickDemo} size="lg" className="h-14 px-6 text-base btn-primary-gradient btn-ripple shadow-glow">
              <Rocket className="h-5 w-5 ml-2" />
              {lang === 'ar' ? 'جرّب النسخة التجريبية' : 'Try Free Demo'}
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-6 text-base glass hover:shadow-soft transition-all hover:scale-105 gap-2" onClick={goLogin}>
              <Lock className="h-5 w-5" />
              {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-6 text-base glass hover:shadow-soft transition-all hover:scale-105 gap-2" asChild>
              <a href="#pricing">
                <DollarSign className="h-5 w-5" />
                {lang === 'ar' ? 'اطلب عرض سعر' : 'Get Quote'}
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Users, value: 1200, suffix: '+', labelAr: 'عميل نشط', labelEn: 'Active Clients', color: 'from-blue-500 to-blue-700' },
              { icon: TrendingUp, value: 850000, suffix: '+', labelAr: 'فاتورة مُصدرة', labelEn: 'Invoices Generated', color: 'from-emerald-500 to-emerald-700' },
              { icon: Building2, value: 350, suffix: '+', labelAr: 'شركة تستخدمنا', labelEn: 'Companies Using Us', color: 'from-purple-500 to-purple-700' },
              { icon: CheckCircle2, value: 99, suffix: '%', labelAr: 'رضا العملاء', labelEn: 'Client Satisfaction', color: 'from-amber-500 to-amber-700' },
            ].map((stat, i) => (
              <div key={i} className="text-center group animate-fade-in-up card-lift" style={{ animationDelay: `${0.3 + (i * 0.1)}s` }}>
                <div className={`inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${stat.color} text-white mb-3 mx-auto shadow-soft group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1 font-semibold">
                  {lang === 'ar' ? stat.labelAr : stat.labelEn}
                </div>
              </div>
            ))}
          </div>

          {/* Made in Egypt badge */}
          <div className="mt-12 inline-flex items-center gap-2 rounded-full gradient-primary px-5 py-2.5 text-primary-foreground shadow-soft animate-fade-in delay-700">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-bold">🇪🇬 {lang === 'ar' ? 'بكل فخر صُنع في صعيد مصر' : 'Proudly Made in Upper Egypt'}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
