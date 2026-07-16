'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Compass, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="text-center max-w-md">
        <div className="grid h-24 w-24 mx-auto place-items-center rounded-3xl bg-gradient-to-br from-primary to-primary/70 text-5xl font-black text-primary-foreground shadow-xl mb-6">
          404
        </div>
        <h1 className="text-3xl font-extrabold mb-2">
          الصفحة غير موجودة
        </h1>
        <p className="text-muted-foreground mb-6">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link href="/">
          <Button size="lg" className="gap-2">
            <Home className="h-4 w-4" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  )
}
