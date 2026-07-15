'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Button } from '@/components/ui/button'
import { Bell, Moon, Sun, Languages, Search, Menu } from 'lucide-react'

export function TopBar() {
  const { lang, setLang, theme, toggleTheme, activeModule, setSidebarOpen } = useApp()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <h2 className="text-lg font-bold">{t(lang, activeModule)}</h2>
        <p className="text-xs text-muted-foreground">
          {lang === 'ar'
            ? `مسار: الصفحة الرئيسية / ${t(lang, activeModule)}`
            : `Path: Home / ${t(lang, activeModule)}`}
        </p>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" style={{ [lang === 'ar' ? 'right' : 'left']: 12 } as React.CSSProperties} />
        <input
          type="text"
          placeholder={t(lang, 'search')}
          className="h-10 w-64 rounded-lg border border-input bg-muted/40 pr-10 pl-4 text-sm outline-none focus:bg-background focus:ring-2 focus:ring-primary/20"
          style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: 36 } as React.CSSProperties}
        />
      </div>

      {/* Language toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        title={lang === 'ar' ? 'English' : 'العربية'}
      >
        <Languages className="h-5 w-5" />
      </Button>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        title={theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
      </Button>

      {/* Avatar */}
      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        م
      </div>
    </header>
  )
}
