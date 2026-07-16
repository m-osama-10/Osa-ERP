'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q_ar: 'هل النظام يدعم اللغة العربية بالكامل؟',
    q_en: 'Does the system fully support Arabic?',
    a_ar: 'نعم، النظام يدعم العربية والإنجليزية بالكامل مع RTL، ويمكنك التبديل بين اللغتين بنقرة واحدة.',
    a_en: 'Yes, the system fully supports Arabic and English with RTL, and you can switch between languages with one click.',
  },
  {
    q_ar: 'ما هي العملات المدعومة؟',
    q_en: 'What currencies are supported?',
    a_ar: 'النظام يعمل بالجنيه المصري (EGP) كعملة أساسية، مع دعم الدولار الأمريكي (USD) كعملة ثانوية. يمكنك إضافة عملات أخرى وأسعار صرف.',
    a_en: 'The system uses EGP as base currency, with USD as secondary. You can add other currencies and exchange rates.',
  },
  {
    q_ar: 'هل بياناتي آمنة؟',
    q_en: 'Is my data secure?',
    a_ar: 'نعم، نستخدم تشفير bcrypt لكلمات المرور، HMAC لتوقيع الجلسات، HTTPS، حماية من XSS و SQL Injection، Rate Limiting، وخيار 2FA.',
    a_en: 'Yes, we use bcrypt for passwords, HMAC for sessions, HTTPS, XSS/SQL injection protection, rate limiting, and optional 2FA.',
  },
  {
    q_ar: 'هل يمكنني تجربة النظام قبل الشراء؟',
    q_en: 'Can I try the system before buying?',
    a_ar: 'نعم، يمكنك الدخول للنسخة التجريبية فوراً بدون تسجيل. البيانات تجريبية ويتم إعادة ضبطها دورياً.',
    a_en: 'Yes, you can access the live demo instantly without registration. Data is demo and resets periodically.',
  },
  {
    q_ar: 'هل يدعم النظام عدة فروع؟',
    q_en: 'Does the system support multiple branches?',
    a_ar: 'نعم، النظام يدعم عدداً غير محدود من الفروع (حسب الباقة)، مع تقارير مجمعة أو منفصلة لكل فرع.',
    a_en: 'Yes, the system supports unlimited branches (depending on plan), with consolidated or separate reports per branch.',
  },
  {
    q_ar: 'هل يمكنني تصدير التقارير؟',
    q_en: 'Can I export reports?',
    a_ar: 'نعم، يمكنك تصدير أي تقرير بصيغة PDF احترافية منسّقة بشعار الشركة، أو Excel متعدد الأوراق، أو الطباعة المباشرة.',
    a_en: 'Yes, you can export any report as professional PDF with your company logo, multi-sheet Excel, or print directly.',
  },
  {
    q_ar: 'هل هناك دعم فني؟',
    q_en: 'Is there technical support?',
    a_ar: 'نعم، نوفر دعماً فنياً عبر البريد لجميع الباقات، ودعم priority 24/7 للباقات المدفوعة، ومدير حساب مخصص للباقة Enterprise.',
    a_en: 'Yes, we provide email support for all plans, priority 24/7 for paid plans, and a dedicated account manager for Enterprise.',
  },
  {
    q_ar: 'هل يمكنني إلغاء الاشتراك في أي وقت؟',
    q_en: 'Can I cancel my subscription anytime?',
    a_ar: 'نعم، يمكنك إلغاء الاشتراك في أي وقت بدون رسوم. سنحتفظ ببياناتك لمدة 90 يوماً لإعادة التفعيل.',
    a_en: 'Yes, you can cancel anytime without fees. We retain your data for 90 days for reactivation.',
  },
]

function FAQItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between py-5 text-start"
      >
        <span className="font-semibold text-lg">{q}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-5 text-muted-foreground leading-relaxed">{a}</div>
      )}
    </div>
  )
}

export function FAQ() {
  const { lang } = useApp()

  return (
    <section id="faq" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            {lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            {lang === 'ar' ? 'أسئلة يطرحها العملاء' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              q={lang === 'ar' ? faq.q_ar : faq.q_en}
              a={lang === 'ar' ? faq.a_ar : faq.a_en}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
