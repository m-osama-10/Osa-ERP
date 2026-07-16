'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Moon, Sun, Rocket } from 'lucide-react'
import { useApp } from '@/components/erp/app-context'

const navLinks = [
  { href: '#home', labelAr: 'الرئيسية', labelEn: 'Home' },
  { href: '#features', labelAr: 'المميزات', labelEn: 'Features' },
  { href: '#modules', labelAr: 'الوحدات', labelEn: 'Modules' },
  { href: '#pricing', labelAr: 'الأسعار', labelEn: 'Pricing' },
  { href: '#demo', labelAr: 'تجربة', labelEn: 'Demo' },
  { href: '#faq', labelAr: 'الأسئلة', labelEn: 'FAQ' },
  { href: '#contact', labelAr: 'تواصل', labelEn: 'Contact' },
]

export function Navbar() {
  const { lang, theme, toggleTheme, setUser } = useApp()
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'glass-strong shadow-soft py-2' : 'bg-transparent py-3'
    }`}>
      <nav className="container mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2 shrink-0 group">
          <img src="/osa-logo.png" alt="Osa ERP" className="h-10 w-10 rounded-xl object-cover shadow-soft group-hover:scale-110 transition-transform" />
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-gradient-navy">Osa</span>{' '}
            <span className="text-gradient">ERP</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <a key={link.href} href={link.href}
              className="px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all hover:scale-105">
              {lang === 'ar' ? link.labelAr : link.labelEn}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all hover:scale-110">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <Button
            onClick={quickDemo}
            className="hidden sm:flex btn-primary-gradient btn-ripple gap-2"
            size="sm"
          >
            <Rocket className="h-4 w-4" />
            {lang === 'ar' ? '🚀 دخول تجريبي' : '🚀 Live Demo'}
          </Button>

          <button onClick={() => setMobileOpen(o => !o)} className="lg:hidden grid h-9 w-9 place-items-center rounded-xl hover:bg-muted transition-colors">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden glass-strong border-t border-border animate-fade-in-down">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors">
                {lang === 'ar' ? link.labelAr : link.labelEn}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
