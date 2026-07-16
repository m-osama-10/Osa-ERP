'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/components/erp/app-context'
import { Rocket, ArrowRight, ShieldCheck, RefreshCw, MousePointerClick } from 'lucide-react'

export function LiveDemo() {
  const { lang, setUser } = useApp()

  const enterDemo = async () => {
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

  return (
    <section id="demo" className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-blue-500/5" />
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <MousePointerClick className="h-4 w-4" />
            {lang === 'ar' ? 'تجربة فورية' : 'Instant Access'}
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
            {lang === 'ar' ? 'جرّب النظام الآن' : 'Try The System Now'}
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {lang === 'ar'
              ? 'يمكنك تجربة النظام الحقيقي مباشرة دون الحاجة للتسجيل. جميع البيانات تجريبية ويتم إعادة ضبطها دورياً للحفاظ على تجربة نظيفة لكل زائر.'
              : 'Try the real system directly without registration. All data is demo and resets periodically to keep a clean experience for every visitor.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {lang === 'ar' ? 'بياناتك آمنة' : 'Safe to use'}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              {lang === 'ar' ? 'إعادة ضبط دورية' : 'Periodic resets'}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Rocket className="h-4 w-4 text-amber-500" />
              {lang === 'ar' ? 'وصول فوري' : 'Instant access'}
            </div>
          </div>

          <Button
            onClick={enterDemo}
            size="lg"
            className="h-16 px-10 text-lg bg-gradient-to-r from-primary to-primary/70 hover:opacity-90 shadow-2xl hover:scale-105 transition-transform"
          >
            <Rocket className="h-6 w-6 ml-2" />
            {lang === 'ar' ? '🚀 الدخول إلى النسخة التجريبية' : '🚀 Enter Live Demo'}
            <ArrowRight className="h-5 w-5 ml-2 rtl:rotate-180" />
          </Button>

          <p className="mt-6 text-xs text-muted-foreground">
            {lang === 'ar'
              ? 'سيتم تسجيل دخولك تلقائياً بحساب تجريبي بصلاحيات محدودة'
              : 'You will be auto-logged in with a demo account (limited permissions)'}
          </p>
        </div>
      </div>
    </section>
  )
}
