'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Button } from '@/components/ui/button'
import { Bell, Moon, Sun, Languages, Search, Menu, LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function TopBar() {
  const { lang, setLang, theme, toggleTheme, activeModule, setSidebarOpen, user, setUser } = useApp()
  const [notifOpen, setNotifOpen] = React.useState(false)
  const [userOpen, setUserOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)

  React.useEffect(() => {
    const loadNotifs = () => {
      fetch('/api/notifications?unread=1').then(r => r.json()).then(d => {
        setNotifications(d.slice(0, 8))
        setUnreadCount(d.length)
      })
    }
    loadNotifs()
    const interval = setInterval(loadNotifs, 30000)
    return () => clearInterval(interval)
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
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></Button>

      <div className="flex-1">
        <h2 className="text-lg font-bold">{t(lang, activeModule)}</h2>
        <p className="text-xs text-muted-foreground">
          {lang === 'ar' ? `مسار: الرئيسية / ${t(lang, activeModule)}` : `Path: Home / ${t(lang, activeModule)}`}
        </p>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" style={{ [lang === 'ar' ? 'right' : 'left']: 12 } as React.CSSProperties} />
        <input
          type="text" placeholder={t(lang, 'search')}
          className="h-10 w-64 rounded-lg border border-input bg-muted/40 pr-10 pl-4 text-sm outline-none focus:bg-background focus:ring-2 focus:ring-primary/20"
          style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: 36 } as React.CSSProperties}
        />
      </div>

      {/* Language */}
      <Button variant="ghost" size="icon" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} title={lang === 'ar' ? 'English' : 'العربية'}>
        <Languages className="h-5 w-5" />
      </Button>

      {/* Theme */}
      <Button variant="ghost" size="icon" onClick={toggleTheme} title={theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}>
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>

      {/* Notifications */}
      <div className="relative">
        <Button variant="ghost" size="icon" onClick={() => { setNotifOpen(o => !o); setUserOpen(false) }} className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">{unreadCount}</span>}
        </Button>
        {notifOpen && (
          <div className="absolute top-12 end-0 z-50 w-80 rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-3">
              <h4 className="font-bold text-sm">{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</h4>
              {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-primary hover:underline">{lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}</button>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">{lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}</p>
              ) : notifications.map(n => (
                <div key={n.id} className={`border-b border-border p-3 ${n.type === 'ERROR' ? 'bg-red-50/50 dark:bg-red-950/20' : n.type === 'WARNING' ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
                  <p className="text-sm font-medium">{n.title}</p>
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
        <button onClick={() => { setUserOpen(o => !o); setNotifOpen(false) }} className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {user?.name?.charAt(0) || 'م'}
        </button>
        {userOpen && (
          <div className="absolute top-12 end-0 z-50 w-56 rounded-xl border border-border bg-card shadow-xl p-1">
            <div className="border-b border-border p-3">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-primary mt-1">{user?.role}</p>
            </div>
            <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" /> {t(lang, 'logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
