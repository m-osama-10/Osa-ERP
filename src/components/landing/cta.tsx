'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Button } from '@/components/ui/button'
import { Rocket, Mail, ArrowRight } from 'lucide-react'

export function CTA() {
  const { lang, setUser } = useApp()

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

  return (
    <section id="contact" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/70 p-12 lg:p-20 text-center text-primary-foreground shadow-2xl">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute inset-0 grid-bg opacity-30" />
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
            {lang === 'ar' ? 'ابدأ اليوم في إدارة شركتك باحترافية' : 'Start Managing Your Business Professionally Today'}
          </h2>

          <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            {lang === 'ar'
              ? 'انضم لأكثر من 1200 شركة تستخدم Osa ERP يومياً. جرّب النظام مجاناً الآن.'
              : 'Join 1,200+ companies using Osa ERP daily. Try the system for free now.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={quickDemo}
              size="lg"
              variant="secondary"
              className="h-14 px-8 text-base"
            >
              <Rocket className="h-5 w-5 ml-2" />
              {lang === 'ar' ? 'جرّب النظام' : 'Try The System'}
              <ArrowRight className="h-4 w-4 ml-2 rtl:rotate-180" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base bg-transparent border-white text-white hover:bg-white hover:text-primary"
              asChild
            >
              <a href="mailto:info@osa-erp.com">
                <Mail className="h-5 w-5 ml-2" />
                {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
