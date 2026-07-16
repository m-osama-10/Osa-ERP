'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck, Sparkles, Phone, Facebook, MapPin, KeyRound, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

type Mode = 'login' | 'forgot' | 'reset'

export function Login() {
  const { lang, setUser, setShowLogin } = useApp()
  const [mode, setMode] = React.useState<Mode>('login')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPass, setShowPass] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(true)
  const [resetToken, setResetToken] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [success, setSuccess] = React.useState(false)

  // Check for reset token in URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('reset')
    if (token) {
      setResetToken(token)
      setMode('reset')
    }
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setSuccess(false)
    try {
      if (mode === 'login') {
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
      } else if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()
        if (res.ok) {
          setSuccess(true)
          toast.success(data.message || (lang === 'ar' ? 'تم الإرسال' : 'Sent'))
        } else {
          toast.error(data.error || 'Error')
        }
      } else if (mode === 'reset') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetToken, newPassword }),
        })
        const data = await res.json()
        if (res.ok) {
          setSuccess(true)
          toast.success(data.message || (lang === 'ar' ? 'تم التغيير' : 'Changed'))
          setTimeout(() => { setMode('login'); setSuccess(false); setNewPassword(''); setResetToken('') }, 2000)
        } else {
          toast.error(data.error || 'Error')
        }
      }
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
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4 animate-scale-in" />
              <h2 className="text-xl font-bold mb-2">
                {mode === 'forgot'
                  ? (lang === 'ar' ? 'تم الإرسال' : 'Sent')
                  : (lang === 'ar' ? 'تم التغيير' : 'Changed')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'forgot'
                  ? (lang === 'ar' ? 'إذا كان البريد موجوداً، سيتم إرسال رابط إعادة التعيين' : 'If email exists, a reset link has been sent')
                  : (lang === 'ar' ? 'سيتم تحويلك لتسجيل الدخول...' : 'Redirecting to login...')}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-soft">
                  {mode === 'login' ? <ShieldCheck className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
                </div>
                <h2 className="text-xl font-bold">
                  {mode === 'login' ? t(lang, 'login')
                    : mode === 'forgot' ? (lang === 'ar' ? 'نسيت كلمة المرور' : 'Forgot Password')
                    : (lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password')}
                </h2>
              </div>

              <form onSubmit={submit} className="space-y-4">
                {mode === 'login' && (
                  <>
                    <div>
                      <Label className="font-semibold">{t(lang, 'email')}</Label>
                      <div className="relative mt-1.5 group">
                        <Mail className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" style={{ [lang === 'ar' ? 'right' : 'left']: 12 } as React.CSSProperties} />
                        <Input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                          className="h-11 rounded-xl focus:ring-2 focus:ring-primary/30 transition-all"
                          style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: 36 } as React.CSSProperties}
                          dir="ltr" autoComplete="email" />
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold">{t(lang, 'password')}</Label>
                      <div className="relative mt-1.5 group">
                        <Lock className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" style={{ [lang === 'ar' ? 'right' : 'left']: 12 } as React.CSSProperties} />
                        <Input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                          className="h-11 rounded-xl focus:ring-2 focus:ring-primary/30 transition-all"
                          style={{ [lang === 'ar' ? 'paddingRight' : 'paddingLeft']: 36, [lang === 'ar' ? 'paddingLeft' : 'paddingRight']: 36 } as React.CSSProperties}
                          dir="ltr" autoComplete="current-password" />
                        <button type="button" onClick={() => setShowPass(s => !s)}
                          className="absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          style={{ [lang === 'ar' ? 'left' : 'right']: 12 } as React.CSSProperties}>
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="rounded h-4 w-4" />
                        {lang === 'ar' ? 'تذكرني' : 'Remember me'}
                      </label>
                      <button type="button" onClick={() => { setMode('forgot'); setSuccess(false) }} className="text-sm text-primary hover:underline">
                        {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                      </button>
                    </div>
                  </>
                )}

                {mode === 'forgot' && (
                  <div>
                    <Label className="font-semibold">{t(lang, 'email')}</Label>
                    <div className="relative mt-1.5 group">
                      <Mail className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" style={{ right: 12 }} />
                      <Input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        className="h-11 rounded-xl focus:ring-2 focus:ring-primary/30 transition-all pr-9"
                        dir="ltr" placeholder={lang === 'ar' ? 'بريدك الإلكتروني' : 'Your email'} />
                    </div>
                  </div>
                )}

                {mode === 'reset' && (
                  <div>
                    <Label className="font-semibold">{lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                    <div className="relative mt-1.5 group">
                      <Lock className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" style={{ right: 12 }} />
                      <Input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        className="h-11 rounded-xl focus:ring-2 focus:ring-primary/30 transition-all pr-9"
                        dir="ltr" placeholder="••••••••" minLength={8} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {lang === 'ar' ? '8 أحرف على الأقل، حرف كبير + رقم' : 'Min 8 chars, uppercase + number'}
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full h-12 text-base btn-primary-gradient btn-ripple" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      {mode === 'login' ? t(lang, 'login')
                        : mode === 'forgot' ? (lang === 'ar' ? 'إرسال الرابط' : 'Send Link')
                        : (lang === 'ar' ? 'إعادة التعيين' : 'Reset Password')}
                      <ArrowLeft className="h-4 w-4 ml-2 rtl:rotate-180" />
                    </>
                  )}
                </Button>
              </form>

              {mode !== 'login' && (
                <button onClick={() => { setMode('login'); setSuccess(false) }} className="mt-4 text-sm text-muted-foreground hover:text-primary transition-colors block w-full text-center">
                  {lang === 'ar' ? '← العودة لتسجيل الدخول' : '← Back to login'}
                </button>
              )}

              {/* Back to landing */}
              {mode === 'login' && (
                <button onClick={() => setShowLogin(false)} className="mt-4 text-sm text-muted-foreground hover:text-primary transition-colors block w-full text-center">
                  {lang === 'ar' ? '← العودة للرئيسية' : '← Back to home'}
                </button>
              )}

              {/* Demo Guest button — no credentials shown */}
              {mode === 'login' && (
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-3 text-muted-foreground">{lang === 'ar' ? 'أو' : 'OR'}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 mt-4 btn-ripple gap-2"
                    onClick={async () => {
                      setLoading(true)
                      try {
                        const res = await fetch('/api/auth/demo-login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                        })
                        const data = await res.json()
                        if (res.ok) {
                          setUser(data)
                          toast.success(lang === 'ar' ? `أهلاً ${data.name}` : `Welcome ${data.name}`)
                        } else {
                          toast.error(data.error || 'Error')
                        }
                      } catch {
                        toast.error(lang === 'ar' ? 'خطأ في الاتصال' : 'Connection error')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                  >
                    <Sparkles className="h-4 w-4" />
                    {lang === 'ar' ? '🚀 الدخول كضيف (Demo)' : '🚀 Login as Guest (Demo)'}
                  </Button>
                  <p className="mt-2 text-[10px] text-muted-foreground text-center">
                    {lang === 'ar' ? 'جرّب النظام مباشرة بدون تسجيل' : 'Try the system directly without registration'}
                  </p>
                </div>
              )}
            </>
          )}
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
