'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Calculator, Users, Truck, Wallet, Package,
  Factory, UserCog, ShoppingCart, Bike, BarChart3, Building2,
  Shield, Settings, ChevronLeft, ChevronRight, X, Coins, TrendingUp, Bell
} from 'lucide-react'

type NavItem = {
  id: string
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
  perm: string
  badge?: string
}

type NavGroup = {
  titleKey: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    titleKey: 'overview',
    items: [
      { id: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard, perm: 'dashboard.view' },
      { id: 'profitability', labelKey: 'profitability', icon: TrendingUp, perm: 'profitability.view' },
      { id: 'reports', labelKey: 'reports', icon: BarChart3, perm: 'reports.view' },
    ]
  },
  {
    titleKey: 'mainModules',
    items: [
      { id: 'accounting', labelKey: 'accounting', icon: Calculator, perm: 'accounting.view' },
      { id: 'customers', labelKey: 'customers', icon: Users, perm: 'customers.view' },
      { id: 'suppliers', labelKey: 'suppliers', icon: Truck, perm: 'suppliers.view' },
      { id: 'treasury', labelKey: 'treasury', icon: Wallet, perm: 'treasury.view' },
      { id: 'inventory', labelKey: 'inventory', icon: Package, perm: 'inventory.view' },
      { id: 'production', labelKey: 'production', icon: Factory, perm: 'production.view' },
      { id: 'hr', labelKey: 'hr', icon: UserCog, perm: 'hr.view' },
      { id: 'sales', labelKey: 'sales', icon: ShoppingCart, perm: 'sales.view' },
      { id: 'representatives', labelKey: 'representatives', icon: Bike, perm: 'representatives.view' },
    ]
  },
  {
    titleKey: 'systemManagement',
    items: [
      { id: 'currencies', labelKey: 'currencies', icon: Coins, perm: 'currencies.view' },
      { id: 'branches', labelKey: 'branches', icon: Building2, perm: 'branches.view' },
      { id: 'permissions', labelKey: 'permissions', icon: Shield, perm: 'permissions.view' },
      { id: 'settings', labelKey: 'settings', icon: Settings, perm: 'settings.view' },
    ]
  }
]

export function Sidebar() {
  const { lang, activeModule, setActiveModule, sidebarOpen, setSidebarOpen, user, hasPermission } = useApp()

  if (!sidebarOpen) {
    return (
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
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
          'fixed inset-y-0 z-40 flex w-72 flex-col border-border bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300',
          lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-sidebar-border p-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-xl font-black text-primary-foreground shadow-lg">O</div>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold leading-tight">Osa ERP</h1>
            <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'نظام إدارة المؤسسات' : 'Enterprise System'}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-sidebar-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(item => hasPermission(item.perm))
            if (visibleItems.length === 0) return null
            return (
              <div key={group.titleKey} className="mb-6">
                <h2 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{t(lang, group.titleKey)}</h2>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = activeModule === item.id
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveModule(item.id)}
                        className={cn(
                          'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                          isActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground')} />
                        <span className="flex-1 text-start">{t(lang, item.labelKey)}</span>
                        {isActive && <div className={cn('h-1.5 w-1.5 rounded-full bg-primary-foreground', lang === 'ar' ? 'ml-1' : 'mr-1')} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* User Card */}
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary font-bold">
              {user?.name?.charAt(0) || 'م'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name || 'مستخدم'}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
    </>
  )
}
