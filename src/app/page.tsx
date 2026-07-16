'use client'

import * as React from 'react'
import { AppProvider, useApp } from '@/components/erp/app-context'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/topbar'
import { Login } from '@/components/erp/login'
import { Loading } from '@/components/erp/loading'
import { Dashboard } from '@/components/erp/modules/dashboard'
import { Accounting } from '@/components/erp/modules/accounting'
import { Customers } from '@/components/erp/modules/customers'
import { Suppliers } from '@/components/erp/modules/suppliers'
import { Treasury } from '@/components/erp/modules/treasury'
import { Inventory } from '@/components/erp/modules/inventory'
import { HR } from '@/components/erp/modules/hr'
import { Sales } from '@/components/erp/modules/sales'
import { Reports } from '@/components/erp/modules/reports'
import { Production } from '@/components/erp/modules/production'
import { Representatives } from '@/components/erp/modules/representatives'
import { Branches } from '@/components/erp/modules/branches'
import { Permissions } from '@/components/erp/modules/permissions'
import { SettingsView } from '@/components/erp/modules/settings'
import { Currencies } from '@/components/erp/modules/currencies'
import { Profitability } from '@/components/erp/modules/profitability'
import { ShieldAlert } from 'lucide-react'

function MainContent() {
  const { activeModule, sidebarOpen, lang, user, loadingAuth, hasPermission } = useApp()

  if (loadingAuth) return <Loading label={lang === 'ar' ? 'جاري التحميل...' : 'Loading...'} />
  if (!user) return <Login />

  const modules: Record<string, { perm: string; component: React.ReactNode }> = {
    dashboard: { perm: 'dashboard.view', component: <Dashboard /> },
    profitability: { perm: 'profitability.view', component: <Profitability /> },
    accounting: { perm: 'accounting.view', component: <Accounting /> },
    customers: { perm: 'customers.view', component: <Customers /> },
    suppliers: { perm: 'suppliers.view', component: <Suppliers /> },
    treasury: { perm: 'treasury.view', component: <Treasury /> },
    inventory: { perm: 'inventory.view', component: <Inventory /> },
    production: { perm: 'production.view', component: <Production /> },
    hr: { perm: 'hr.view', component: <HR /> },
    sales: { perm: 'sales.view', component: <Sales /> },
    representatives: { perm: 'representatives.view', component: <Representatives /> },
    reports: { perm: 'reports.view', component: <Reports /> },
    currencies: { perm: 'currencies.view', component: <Currencies /> },
    branches: { perm: 'branches.view', component: <Branches /> },
    permissions: { perm: 'permissions.view', component: <Permissions /> },
    settings: { perm: 'settings.view', component: <SettingsView /> },
  }

  const current = modules[activeModule] || modules.dashboard
  const paddingStyle = sidebarOpen
    ? { [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: '18rem' } as React.CSSProperties
    : {}

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Sidebar />
      <div style={paddingStyle} className="flex min-h-screen flex-col transition-all duration-300">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6">
          {hasPermission(current.perm) ? (
            current.component
          ) : (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
              <ShieldAlert className="h-16 w-16 text-amber-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">
                {lang === 'ar' ? 'لا تملك صلاحية الوصول' : 'Access Denied'}
              </h2>
              <p className="text-muted-foreground max-w-sm">
                {lang === 'ar'
                  ? 'ليس لديك صلاحية للوصول إلى هذه الوحدة. تواصل مع المدير لمنحك الصلاحية.'
                  : 'You do not have permission to access this module. Contact your administrator.'}
              </p>
            </div>
          )}
        </main>
        <footer className="border-t border-border bg-card/50 px-6 py-4 text-center text-xs text-muted-foreground">
          <p>Osa ERP © 2026 • {lang === 'ar' ? 'نظام إدارة المؤسسات المتكامل' : 'Enterprise Resource Planning System'}<span className="mx-2">•</span><span>v2.0.0</span></p>
        </footer>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  )
}
