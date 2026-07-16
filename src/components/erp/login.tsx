'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

const isDev = process.env.NODE_ENV === 'development'

export function Login() {
  const { lang, setUser } = useApp()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPass, setShowPass] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return // prevent double-submit
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || (lang === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'))
        return
      }
      setUser(data)
      toast.success(lang === 'ar' ? `أهلاً ${data.name}` : `Welcome ${data.name}`)
    } catch {
      toast.error(lang === 'ar' ? 'خطأ في الاتصال' : 'Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4 grid-bg">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-3xl font-black text-primary-foreground shadow-xl">
            O
          </div>
          <h1 className="mt-3 text-2xl font-extrabold">Osa ERP</h1>
          <p className="text-sm text-muted-foreground">
            {lang === 'ar' ? 'نظام إدارة المؤسسات المتكامل' : 'Enterprise Resource Planning'}
          </p>
        </div>

        <Card className="p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">{t(lang, 'login')}</h2>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>{t(lang, 'email')}</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" style={{ [lang === 'ar' ? 'right' : 'left']: 12 } as React.CSSProperties} />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-11"
                  style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: 36 } as React.CSSProperties}
                  dir="ltr"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <Label>{t(lang, 'password')}</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" style={{ [lang === 'ar' ? 'right' : 'left']: 12 } as React.CSSProperties} />
                <Input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-11"
                  style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: 36, [lang === 'ar' ? 'paddingLeft' : 'paddingRight']: 36 } as React.CSSProperties}
                  dir="ltr"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  style={{ [lang === 'ar' ? 'left' : 'right']: 12 } as React.CSSProperties}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{t(lang, 'login')} <ArrowLeft className="h-4 w-4 ml-2 rtl:rotate-180" /></>}
            </Button>
          </form>

          {/* Demo credentials only in development */}
          {isDev && (
            <div className="mt-6 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4 text-xs">
              <p className="font-semibold mb-2 text-amber-700 dark:text-amber-400">⚠ {lang === 'ar' ? 'بيانات تجريبية (dev only)' : 'Demo (dev only)'}</p>
              <div className="space-y-1.5" dir="ltr">
                <button type="button" onClick={() => { setEmail('admin@osa-erp.com'); setPassword('Admin@123') }} className="block w-full text-start hover:text-primary transition-colors">
                  👑 admin@osa-erp.com / Admin@123
                </button>
                <button type="button" onClick={() => { setEmail('accountant@osa-erp.com'); setPassword('Account@123') }} className="block w-full text-start hover:text-primary transition-colors">
                  📊 accountant@osa-erp.com / Account@123
                </button>
                <button type="button" onClick={() => { setEmail('sales@osa-erp.com'); setPassword('Sales@123') }} className="block w-full text-start hover:text-primary transition-colors">
                  💰 sales@osa-erp.com / Sales@123
                </button>
              </div>
            </div>
          )}
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Osa ERP © {new Date().getFullYear()} • v2.1.0
        </p>
      </div>
    </div>
  )
}
