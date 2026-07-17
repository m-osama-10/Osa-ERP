'use client'

import * as React from 'react'
import { AppProvider, useApp } from '@/components/erp/app-context'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/topbar'
import { Loading } from '@/components/erp/loading'
import { Login } from '@/components/erp/login'
import { LandingPage } from '@/components/landing'

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loadingAuth, showLogin } = useApp()

  if (loadingAuth) return <Loading label="جاري التحميل..." />
  if (!user) {
    if (showLogin) return <Login />
    return <LandingPage />
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Sidebar />
      <div className="flex min-h-screen flex-col transition-all duration-300" style={{ paddingRight: '18rem' }}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
        <footer className="border-t border-border bg-card/50 px-6 py-4 text-center text-xs text-muted-foreground">
          <p>Osa ERP © {new Date().getFullYear()} • نظام إدارة المؤسسات المتكامل • v3.1.0</p>
        </footer>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AppProvider>
  )
}
