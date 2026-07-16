'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-background to-red-100/50 dark:from-red-950/20 dark:via-background dark:to-red-950/10 p-4">
      <div className="text-center max-w-md">
        <div className="grid h-24 w-24 mx-auto place-items-center rounded-3xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-xl mb-6">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">
          حدث خطأ ما
        </h1>
        <p className="text-muted-foreground mb-6">
          حدث خطأ غير متوقع. حاول مرة أخرى أو عاود المحاولة لاحقاً.
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={reset} size="lg" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2">
              <Home className="h-4 w-4" />
              الرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
