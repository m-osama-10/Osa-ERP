'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck, Sparkles, Phone, Facebook, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export function Login() {
  const { lang, setUser } = useApp()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPass, setShowPass] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 gradient-mesh" />
      <div className="absolute inset-0 -z-10 grid-bg opacity-40" />
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full gradient-accent opacity-20 blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full gradient-primary opacity-20 blur-3xl animate-float-slow" />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative">
            <img src="/osa-logo.png" alt="Osa ERP" className="h-20 w-20 rounded-3xl object-cover shadow-soft-xl" />
            <div className="absolute -inset-2 rounded-3xl gradient-accent opacity-30 blur-xl -z-10 animate-pulse-glow" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
            <span className="text-gradient-navy">Osa</span>{' '}
            <span className="text-gradient">ERP</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            {lang === 'ar' ? 'نظام إدارة المؤسسات المتكامل' : 'Enterprise Resource Planning'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-soft-xl">
          <div className="mb-6 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-soft">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">{t(lang, 'login')}</h2>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="font-semibold">{t(lang, 'email')}</Label>
              <div className="relative mt-1.5 group">
                <Mail className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" style={{ [lang === 'ar' ? 'right' : 'left']: 12 } as React.CSSProperties} />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-11 rounded-xl focus:ring-2 focus:ring-primary/30 transition-all"
                  style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: 36 } as React.CSSProperties}
                  dir="ltr"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <Label className="font-semibold">{t(lang, 'password')}</Label>
              <div className="relative mt-1.5 group">
                <Lock className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" style={{ [lang === 'ar' ? 'right' : 'left']: 12 } as React.CSSProperties} />
                <Input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-11 rounded-xl focus:ring-2 focus:ring-primary/30 transition-all"
                  style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: 36, [lang === 'ar' ? 'paddingLeft' : 'paddingRight']: 36 } as React.CSSProperties}
                  dir="ltr"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  style={{ [lang === 'ar' ? 'left' : 'right']: 12 } as React.CSSProperties}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base btn-primary-gradient btn-ripple"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  {t(lang, 'login')}
                  <ArrowLeft className="h-4 w-4 ml-2 rtl:rotate-180" />
                </>
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 rounded-2xl glass p-4 text-xs">
            <p className="font-bold mb-2 text-primary flex items-center gap-1">
              <span className="h-2 w-2 rounded-full gradient-accent animate-pulse-glow" />
              {lang === 'ar' ? 'حساب تجريبي للزوار' : 'Demo Account'}
            </p>
            <button
              type="button"
              onClick={() => { setEmail('demo@osa-erp.com'); setPassword('Demo@2026') }}
              className="block w-full text-start hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted/50 font-mono"
              dir="ltr"
            >
              👤 demo@osa-erp.com / Demo@2026
            </button>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {lang === 'ar' ? 'هذا الحساب للتجربة فقط — البيانات تُعاد ضبطها دورياً' : 'Demo only — data resets periodically'}
            </p>
          </div>
        </div>

        {/* Contact + Made in Egypt */}
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
            <a href="tel:01030123052" className="flex flex-col items-center gap-1 p-2 rounded-xl glass hover:shadow-soft transition-shadow">
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span dir="ltr">01030123052</span>
            </a>
            <a href="mailto:M.osama10@outlook.com" className="flex flex-col items-center gap-1 p-2 rounded-xl glass hover:shadow-soft transition-shadow">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span className="truncate w-full text-center">M.osama10</span>
            </a>
            <a href="https://www.facebook.com/Osa.Erp.eg" target="_blank" rel="noopener" className="flex flex-col items-center gap-1 p-2 rounded-xl glass hover:shadow-soft transition-shadow">
              <Facebook className="h-3.5 w-3.5 text-primary" />
              <span>Osa.Erp.eg</span>
            </a>
          </div>

          {/* Proudly made in Upper Egypt */}
          <div className="rounded-2xl gradient-primary p-4 text-center text-primary-foreground shadow-soft">
            <p className="text-sm font-bold flex items-center justify-center gap-2">
              <span className="text-lg">🇪🇬</span>
              {lang === 'ar' ? 'بكل فخر صُنع في صعيد مصر' : 'Proudly Made in Upper Egypt'}
            </p>
            <p className="text-[10px] opacity-80 mt-1 flex items-center justify-center gap-1">
              <MapPin className="h-3 w-3" />
              {lang === 'ar' ? 'أسيوط، مصر' : 'Asyut, Egypt'} • © {new Date().getFullYear()} Osa ERP
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
