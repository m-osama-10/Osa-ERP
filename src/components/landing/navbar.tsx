'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Moon, Sun } from 'lucide-react'
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

  // Quick demo login from navbar
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

  const goLogin = () => {
    // Switch to login view by setting a session-less user? No—trigger showLogin via location
    window.location.href = '/?login=1'
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'
    }`}>
      <nav className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2 shrink-0">
          <img src="/osa-logo.png" alt="Osa ERP" className="h-10 w-10 rounded-lg object-cover" />
          <span className="text-xl font-extrabold">
            <span className="text-primary">Osa</span> ERP
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <a key={link.href} href={link.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
              {lang === 'ar' ? link.labelAr : link.labelEn}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted text-muted-foreground">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <Button variant="ghost" size="sm" onClick={goLogin} className="hidden sm:flex">
            {lang === 'ar' ? 'جرّب النظام' : 'Try Demo'}
          </Button>
          <Button size="sm" onClick={quickDemo} className="bg-gradient-to-r from-primary to-primary/70 hover:opacity-90">
            {lang === 'ar' ? '🚀 دخول تجريبي' : '🚀 Live Demo'}
          </Button>

          <button onClick={() => setMobileOpen(o => !o)} className="lg:hidden grid h-9 w-9 place-items-center rounded-lg hover:bg-muted">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background border-b border-border">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg">
                {lang === 'ar' ? link.labelAr : link.labelEn}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
