'use client'

import * as React from 'react'
import { AppProvider, useApp } from '@/components/erp/app-context'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/topbar'
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

function MainContent() {
  const { activeModule, sidebarOpen, lang } = useApp()

  const modules: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    accounting: <Accounting />,
    customers: <Customers />,
    suppliers: <Suppliers />,
    treasury: <Treasury />,
    inventory: <Inventory />,
    production: <Production />,
    hr: <HR />,
    sales: <Sales />,
    representatives: <Representatives />,
    reports: <Reports />,
    branches: <Branches />,
    permissions: <Permissions />,
    settings: <SettingsView />,
  }

  const paddingStyle = sidebarOpen
    ? { [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: '18rem' } as React.CSSProperties
    : {}

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Sidebar />
      <div style={paddingStyle} className="flex min-h-screen flex-col transition-all duration-300">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6">
          {modules[activeModule] || <Dashboard />}
        </main>
        <footer className="border-t border-border bg-card/50 px-6 py-4 text-center text-xs text-muted-foreground">
          <p>
            Osa ERP © 2026 • {lang === 'ar' ? 'نظام إدارة المؤسسات المتكامل' : 'Enterprise Resource Planning System'}
            <span className="mx-2">•</span>
            <span>v1.0.0</span>
          </p>
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
