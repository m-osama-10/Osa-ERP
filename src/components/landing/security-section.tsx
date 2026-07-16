'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Lock, KeyRound, Database, ShieldCheck, Globe, Code2, RefreshCw, Smartphone } from 'lucide-react'

export function SecuritySection() {
  const { lang } = useApp()

  const securityFeatures = [
    { icon: Lock, ar: 'تشفير كلمات المرور', en: 'Password Encryption', desc: 'bcrypt + salt', color: 'bg-red-500' },
    { icon: Globe, ar: 'HTTPS', en: 'HTTPS', desc: 'SSL/TLS', color: 'bg-blue-500' },
    { icon: KeyRound, ar: 'JWT Sessions', en: 'JWT Sessions', desc: 'HMAC signed', color: 'bg-emerald-500' },
    { icon: RefreshCw, ar: 'Backup تلقائي', en: 'Auto Backup', desc: 'Daily', color: 'bg-amber-500' },
    { icon: ShieldCheck, ar: 'حماية XSS', en: 'XSS Protection', desc: 'Sanitized', color: 'bg-purple-500' },
    { icon: Code2, ar: 'حماية SQL Injection', en: 'SQL Injection Protection', desc: 'Prisma ORM', color: 'bg-pink-500' },
    { icon: Database, ar: 'Rate Limiting', en: 'Rate Limiting', desc: 'Anti-brute-force', color: 'bg-cyan-500' },
    { icon: Smartphone, ar: '2FA', en: '2FA', desc: 'Two-factor', color: 'bg-teal-500' },
  ]

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
            <ShieldCheck className="h-4 w-4" />
            {lang === 'ar' ? 'أمان مؤسسي' : 'Enterprise Security'}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            {lang === 'ar' ? 'بياناتك في أمان تام' : 'Your Data is Secure'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {lang === 'ar'
              ? 'بنينا النظام بأحدث معايير الأمان لحماية بياناتك المالية'
              : 'We built the system with the latest security standards to protect your financial data'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {securityFeatures.map((f, i) => (
            <Card key={i} className="p-6 text-center hover:scale-105 transition-transform">
              <div className={`inline-grid h-14 w-14 place-items-center rounded-2xl ${f.color} text-white mb-3`}>
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="font-bold mb-1 text-sm">{lang === 'ar' ? f.ar : f.en}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
