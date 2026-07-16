'use client'

import Link from 'next/link'
import { useApp } from '@/components/erp/app-context'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const { lang } = useApp()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-background to-red-100/50 p-4">
      <div className="text-center max-w-md">
        <div className="grid h-24 w-24 mx-auto place-items-center rounded-3xl bg-gradient-to-br from-red-500 to-red-700 text-5xl font-black text-white shadow-xl mb-6">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">
          {lang === 'ar' ? 'حدث خطأ ما' : 'Something went wrong'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {lang === 'ar'
            ? 'حدث خطأ غير متوقع. حاول مرة أخرى أو عاود المحاولة لاحقاً.'
            : 'An unexpected error occurred. Please try again or come back later.'}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={reset} size="lg" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {lang === 'ar' ? 'إعادة المحاولة' : 'Try again'}
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2">
              <Home className="h-4 w-4" />
              {lang === 'ar' ? 'الرئيسية' : 'Home'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
