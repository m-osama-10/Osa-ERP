'use client'

import Link from 'next/link'
import { useApp } from '@/components/erp/app-context'
import { Button } from '@/components/ui/button'
import { Compass, Home } from 'lucide-react'

export default function NotFound() {
  const { lang } = useApp()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="text-center max-w-md">
        <div className="grid h-24 w-24 mx-auto place-items-center rounded-3xl bg-gradient-to-br from-primary to-primary/70 text-5xl font-black text-primary-foreground shadow-xl mb-6">
          404
        </div>
        <h1 className="text-3xl font-extrabold mb-2">
          {lang === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {lang === 'ar'
            ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
            : 'Sorry, the page you are looking for does not exist or has been moved.'}
        </p>
        <Link href="/">
          <Button size="lg" className="gap-2">
            <Home className="h-4 w-4" />
            {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </Link>
      </div>
    </div>
  )
}
