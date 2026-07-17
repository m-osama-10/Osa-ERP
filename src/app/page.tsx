'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AppProvider, useApp } from '@/components/erp/app-context'
import { Loading } from '@/components/erp/loading'
import { Login } from '@/components/erp/login'
import { LandingPage } from '@/components/landing'

function MainContent() {
  const { user, loadingAuth, showLogin, setShowLogin } = useApp()
  const router = useRouter()

  React.useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (loadingAuth) return <Loading label="جاري التحميل..." />

  // If logged in, show loading while redirecting
  if (user) return <Loading label="جاري التوجيه..." />

  // If not logged in:
  //   - show Login form if showLogin is true
  //   - otherwise show Landing Page
  if (showLogin) return <Login />
  return <LandingPage />
}

export default function Home() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  )
}
