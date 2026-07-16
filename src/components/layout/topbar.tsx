'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Button } from '@/components/ui/button'
import { Bell, Moon, Sun, Languages, Search, Menu, LogOut, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export function TopBar() {
  const { lang, setLang, theme, toggleTheme, activeModule, setSidebarOpen, user, setUser } = useApp()
  const [notifOpen, setNotifOpen] = React.useState(false)
  const [userOpen, setUserOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const loadNotifs = async () => {
      try {
        const res = await fetch('/api/notifications?unread=1')
        if (!res.ok) return
        const data = await res.json()
        // Always validate: ensure we have an array before calling .slice()
        const notifs = Array.isArray(data) ? data : (data?.notifications ?? [])
        setNotifications(notifs.slice(0, 8))
        setUnreadCount(notifs.length)
      } catch {
        // Network error — silently ignore, will retry on next interval
      }
    }
    loadNotifs()
    const interval = setInterval(loadNotifs, 30000)
    return () => clearInterval(interval)
  }, [])

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) })
    setNotifications([])
    setUnreadCount(0)
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    toast.success(lang === 'ar' ? 'تم تسجيل الخروج' : 'Logged out')
  }

  return (
    <header className={`sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border px-4 backdrop-blur-md transition-all duration-300 lg:px-6 ${
      scrolled ? 'glass-strong shadow-soft' : 'bg-background/80'
    }`}>
      <Button variant="ghost" size="icon" className="lg:hidden hover:scale-105 transition-transform" onClick={() => setSidebarOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <h2 className="text-lg font-extrabold tracking-tight">{t(lang, activeModule)}</h2>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" />
          {lang === 'ar' ? `الرئيسية / ${t(lang, activeModule)}` : `Home / ${t(lang, activeModule)}`}
        </p>
      </div>

      {/* Search */}
      <div className="relative hidden md:block group">
        <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" style={{ [lang === 'ar' ? 'right' : 'left']: 12 } as React.CSSProperties} />
        <input
          type="text" placeholder={t(lang, 'search')}
          className="h-10 w-64 rounded-2xl border border-input bg-muted/40 pr-10 pl-4 text-sm outline-none focus:bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: 36 } as React.CSSProperties}
        />
      </div>

      {/* Language */}
      <Button variant="ghost" size="icon" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} title={lang === 'ar' ? 'English' : 'العربية'}
        className="hover:scale-110 hover:bg-accent transition-all">
        <Languages className="h-5 w-5" />
      </Button>

      {/* Theme */}
      <Button variant="ghost" size="icon" onClick={toggleTheme} title={theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}
        className="hover:scale-110 hover:bg-accent transition-all">
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>

      {/* Notifications */}
      <div className="relative">
        <Button variant="ghost" size="icon" onClick={() => { setNotifOpen(o => !o); setUserOpen(false) }}
          className="relative hover:scale-110 hover:bg-accent transition-all">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full gradient-accent px-1 text-[10px] font-bold text-white animate-pulse-glow">
              {unreadCount}
            </span>
          )}
        </Button>
        {notifOpen && (
          <div className="absolute top-12 end-0 z-50 w-80 rounded-2xl glass-strong shadow-soft-xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between border-b border-border p-3 gradient-mesh">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
              </h4>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline font-semibold">
                  {lang === 'ar' ? 'تحديد الكل' : 'Mark all'}
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  {lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
                </p>
              ) : notifications.map(n => (
                <div key={n.id} className={`border-b border-border p-3 hover:bg-muted/30 transition-colors ${n.type === 'ERROR' ? 'bg-red-50/50 dark:bg-red-950/20' : n.type === 'WARNING' ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString('ar-EG')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => { setUserOpen(o => !o); setNotifOpen(false) }}
          className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-sm font-bold text-primary-foreground shadow-soft hover:scale-110 transition-transform"
        >
          {user?.name?.charAt(0) || 'م'}
        </button>
        {userOpen && (
          <div className="absolute top-12 end-0 z-50 w-56 rounded-2xl glass-strong shadow-soft-xl p-1 animate-scale-in">
            <div className="border-b border-border p-3">
              <p className="text-sm font-bold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-primary font-semibold mt-1">{user?.role}</p>
            </div>
            <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors mt-1">
              <LogOut className="h-4 w-4" /> {t(lang, 'logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
