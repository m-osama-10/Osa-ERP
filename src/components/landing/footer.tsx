'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react'

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
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Logo + description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/osa-logo.png" alt="Osa ERP" className="h-10 w-10 rounded-lg" />
              <span className="text-xl font-extrabold">
                <span className="text-primary">Osa</span> ERP
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              {lang === 'ar'
                ? 'نظام إدارة مؤسسات متكامل للمحاسبة والمبيعات والمخازن والموارد البشرية. مبني بأحدث التقنيات.'
                : 'Complete enterprise management system for accounting, sales, inventory, and HR. Built with modern tech.'}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" /> info@osa-erp.com
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" /> +20 100 123 4567
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}
              </div>
            </div>
          </div>

          {/* Link sections */}
          {sections.map((section, i) => (
            <div key={i}>
              <h4 className="font-bold mb-4">{lang === 'ar' ? section.title_ar : section.title_en}</h4>
              <ul className="space-y-2">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {lang === 'ar' ? link.ar : link.en}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {year} Osa ERP • {lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>
          <div className="flex items-center gap-3">
            {[
              { Icon: Facebook, label: 'Facebook' },
              { Icon: Twitter, label: 'Twitter' },
              { Icon: Linkedin, label: 'LinkedIn' },
              { Icon: Youtube, label: 'YouTube' },
            ].map(({ Icon, label }, i) => (
              <a key={i} href="#" aria-label={label} className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:border-primary hover:text-primary transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
