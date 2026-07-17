'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp, t } from '@/components/erp/app-context'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Calculator, Users, Truck, Wallet, Package,
  Factory, UserCog, ShoppingCart, Bike, BarChart3, Building2,
  Shield, Settings, ChevronLeft, ChevronRight, X, Coins, TrendingUp, Bell, User,
} from 'lucide-react'

type NavItem = {
  href: string
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
  perm: string
}

type NavGroup = {
  titleKey: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    titleKey: 'overview',
    items: [
      { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard, perm: 'dashboard.view' },
      { href: '/profitability', labelKey: 'profitability', icon: TrendingUp, perm: 'profitability.view' },
      { href: '/reports', labelKey: 'reports', icon: BarChart3, perm: 'reports.view' },
    ]
  },
  {
    titleKey: 'mainModules',
    items: [
      { href: '/accounting', labelKey: 'accounting', icon: Calculator, perm: 'accounting.view' },
      { href: '/customers', labelKey: 'customers', icon: Users, perm: 'customers.view' },
      { href: '/suppliers', labelKey: 'suppliers', icon: Truck, perm: 'suppliers.view' },
      { href: '/treasury', labelKey: 'treasury', icon: Wallet, perm: 'treasury.view' },
      { href: '/inventory', labelKey: 'inventory', icon: Package, perm: 'inventory.view' },
      { href: '/production', labelKey: 'production', icon: Factory, perm: 'production.view' },
      { href: '/hr', labelKey: 'hr', icon: UserCog, perm: 'hr.view' },
      { href: '/sales', labelKey: 'sales', icon: ShoppingCart, perm: 'sales.view' },
      { href: '/representatives', labelKey: 'representatives', icon: Bike, perm: 'representatives.view' },
    ]
  },
  {
    titleKey: 'systemManagement',
    items: [
      { href: '/currencies', labelKey: 'currencies', icon: Coins, perm: 'currencies.view' },
      { href: '/branches', labelKey: 'branches', icon: Building2, perm: 'branches.view' },
      { href: '/notifications', labelKey: 'permissions', icon: Bell, perm: 'dashboard.view' },
      { href: '/permissions', labelKey: 'permissions', icon: Shield, perm: 'permissions.view' },
      { href: '/settings', labelKey: 'settings', icon: Settings, perm: 'settings.view' },
    ]
  }
]

export function Sidebar() {
  const { lang, sidebarOpen, setSidebarOpen, user, hasPermission } = useApp()
  const pathname = usePathname()

  if (!sidebarOpen) {
    return (
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 z-50 grid h-11 w-11 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow hover:scale-110 transition-transform"
        style={{ [lang === 'ar' ? 'right' : 'left']: 16 } as React.CSSProperties}
        aria-label="Open sidebar"
      >
        {lang === 'ar' ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
    )
  }

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 z-40 flex w-72 flex-col glass text-sidebar-foreground shadow-soft-xl transition-all duration-300',
          lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'
        )}
      >
        {/* Logo */}
        <div className="relative overflow-hidden p-5 border-b border-sidebar-border">
          <div className="absolute inset-0 gradient-mesh opacity-50" />
          <div className="relative flex items-center gap-3">
            <img src="/osa-logo.png" alt="Osa ERP" className="h-12 w-12 rounded-2xl object-cover shadow-soft" />
            <div className="flex-1">
              <h1 className="text-xl font-extrabold leading-tight tracking-tight">
                <span className="text-gradient-navy">Osa</span>{' '}
                <span className="text-gradient">ERP</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide">
                {lang === 'ar' ? 'نظام إدارة المؤسسات' : 'Enterprise System'}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scroll-smooth">
          {navGroups.map((group, gIdx) => {
            const visibleItems = group.items.filter(item => hasPermission(item.perm))
            if (visibleItems.length === 0) return null
            return (
              <div key={group.titleKey} className="mb-6 animate-fade-in" style={{ animationDelay: `${gIdx * 0.1}s` }}>
                <h2 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  {t(lang, group.titleKey)}
                </h2>
                <div className="space-y-1">
                  {visibleItems.map((item, iIdx) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-300',
                          isActive
                            ? 'gradient-primary text-primary-foreground shadow-soft hover:shadow-glow'
                            : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1'
                        )}
                        style={{ animationDelay: `${(gIdx * 0.1) + (iIdx * 0.03)}s` }}
                      >
                        <Icon className={cn(
                          'h-5 w-5 shrink-0 transition-transform',
                          isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground group-hover:scale-110'
                        )} />
                        <span className="flex-1 text-start">{t(lang, item.labelKey)}</span>
                        {isActive && (
                          <div className={cn('h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse', lang === 'ar' ? 'ml-1' : 'mr-1')} />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* User Card */}
        <div className="border-t border-sidebar-border p-3">
          <Link href="/profile" className="flex items-center gap-3 rounded-xl glass p-3 hover:shadow-soft transition-shadow">
            <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground font-bold shadow-soft">
              {user?.name?.charAt(0) || 'م'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name || 'مستخدم'}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-glow" />
          </Link>
        </div>
      </aside>

      <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in" onClick={() => setSidebarOpen(false)} />
    </>
  )
}
