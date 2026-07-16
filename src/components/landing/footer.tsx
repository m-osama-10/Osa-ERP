'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube, Heart } from 'lucide-react'

export function Footer() {
  const { lang } = useApp()
  const year = new Date().getFullYear()

  const sections = [
    {
      title_ar: 'المنتج', title_en: 'Product',
      links: [
        { ar: 'المميزات', en: 'Features', href: '#features' },
        { ar: 'الوحدات', en: 'Modules', href: '#modules' },
        { ar: 'الأسعار', en: 'Pricing', href: '#pricing' },
        { ar: 'النسخة التجريبية', en: 'Live Demo', href: '#demo' },
      ],
    },
    {
      title_ar: 'الشركة', title_en: 'Company',
      links: [
        { ar: 'من نحن', en: 'About Us', href: '#' },
        { ar: 'المدونة', en: 'Blog', href: '#' },
        { ar: 'الوظائف', en: 'Careers', href: '#' },
        { ar: 'تواصل معنا', en: 'Contact', href: '#contact' },
      ],
    },
    {
      title_ar: 'الدعم', title_en: 'Support',
      links: [
        { ar: 'مركز المساعدة', en: 'Help Center', href: '#faq' },
        { ar: 'الأسئلة الشائعة', en: 'FAQ', href: '#faq' },
        { ar: 'التوثيق', en: 'Documentation', href: '#' },
        { ar: 'حالة النظام', en: 'System Status', href: '#' },
      ],
    },
    {
      title_ar: 'قانوني', title_en: 'Legal',
      links: [
        { ar: 'سياسة الخصوصية', en: 'Privacy Policy', href: '#' },
        { ar: 'الشروط والأحكام', en: 'Terms & Conditions', href: '#' },
        { ar: 'اتفاقية الخدمة', en: 'Service Agreement', href: '#' },
        { ar: 'ملفات الارتباط', en: 'Cookies', href: '#' },
      ],
    },
  ]

  return (
    <footer className="relative border-t border-border bg-card overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-30 -z-10" />
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Logo + description + contact */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/osa-logo.png" alt="Osa ERP" className="h-12 w-12 rounded-2xl shadow-soft" />
              <span className="text-2xl font-extrabold">
                <span className="text-gradient-navy">Osa</span>{' '}
                <span className="text-gradient">ERP</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
              {lang === 'ar'
                ? 'نظام إدارة مؤسسات متكامل للمحاسبة والمبيعات والمخازن والموارد البشرية. مبني بأحدث التقنيات.'
                : 'Complete enterprise management system for accounting, sales, inventory, and HR. Built with modern tech.'}
            </p>
            <div className="space-y-2.5 text-sm">
              <a href="tel:01030123052" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted group-hover:gradient-primary group-hover:text-primary-foreground transition-all">
                  <Phone className="h-4 w-4" />
                </div>
                <span dir="ltr">01030123052</span>
              </a>
              <a href="mailto:M.osama10@outlook.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted group-hover:gradient-primary group-hover:text-primary-foreground transition-all">
                  <Mail className="h-4 w-4" />
                </div>
                M.osama10@outlook.com
              </a>
              <a href="https://Facebook.com/osa.erp" target="_blank" rel="noopener" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted group-hover:gradient-primary group-hover:text-primary-foreground transition-all">
                  <Facebook className="h-4 w-4" />
                </div>
                Facebook.com/osa.erp
              </a>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted">
                  <MapPin className="h-4 w-4" />
                </div>
                {lang === 'ar' ? 'أسيوط، مصر' : 'Asyut, Egypt'}
              </div>
            </div>
          </div>

          {/* Link sections */}
          {sections.map((section, i) => (
            <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <h4 className="font-bold mb-4 text-base">{lang === 'ar' ? section.title_ar : section.title_en}</h4>
              <ul className="space-y-2">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline">
                      {lang === 'ar' ? link.ar : link.en}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Made in Egypt Banner */}
        <div className="mb-8 rounded-2xl gradient-primary p-5 text-center text-primary-foreground shadow-soft relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="relative flex items-center justify-center gap-3 flex-wrap">
            <span className="text-3xl animate-float">🇪🇬</span>
            <p className="text-lg font-bold">
              {lang === 'ar' ? 'بكل فخر صُنع في صعيد مصر' : 'Proudly Made in Upper Egypt'}
            </p>
            <span className="text-3xl animate-float-slow">🇪🇬</span>
          </div>
          <p className="text-xs opacity-80 mt-2 relative">{lang === 'ar' ? 'أسيوط، جمهورية مصر العربية' : 'Asyut, Arab Republic of Egypt'}</p>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            © {year} Osa ERP • {lang === 'ar' ? 'صُنع بكل' : 'Made with'} <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> {lang === 'ar' ? 'في مصر' : 'in Egypt'}
          </p>
          <div className="flex items-center gap-2">
            {[
              { Icon: Facebook, label: 'Facebook' },
              { Icon: Twitter, label: 'Twitter' },
              { Icon: Linkedin, label: 'LinkedIn' },
              { Icon: Youtube, label: 'YouTube' },
            ].map(({ Icon, label }, i) => (
              <a key={i} href="#" aria-label={label} className="grid h-9 w-9 place-items-center rounded-xl border border-border hover:gradient-primary hover:text-primary-foreground hover:border-transparent transition-all hover:scale-110">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
