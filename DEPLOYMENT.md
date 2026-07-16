# 🚀 دليل النشر على Vercel — OSA ERP

## الخطوة 1: تبديل Prisma إلى PostgreSQL

قبل النشر، غيّر `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // بدل "sqlite"
  url      = env("DATABASE_URL")
}
```

ثم commit + push.

## الخطوة 2: ربط المشروع بـ Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط **New Project**
3. اختر الـ repo: `m-osama-10/Osa-ERP`
4. اترك الإعدادات الافتراضية (Vercel سيكتشف Next.js تلقائياً)

## الخطوة 3: متغيرات البيئة

في Vercel → Settings → Environment Variables، أضف:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres.fcbaoaucywuqmjcsnfyb:%40M7mad1995105@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` |
| `NEXTAUTH_SECRET` | (generate with `openssl rand -hex 32`) |
| `DEMO_EMAIL` | `demo@osaerp.com` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fcbaoaucywuqmjcsnfyb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_UGLiQhJLPlFUy33R9LPA4A_ZfCy9-rk` |

## الخطوة 4: إنشاء قاعدة البيانات على Supabase

بعد أول deployment، شغّل الـ migration:

```bash
# محلياً مع DIRECT_URL
npx prisma db push
npx prisma db seed
```

أو من Vercel CLI:
```bash
vercel env pull .env.vercel
npx prisma db push --schema prisma/schema.prisma
npx tsx scripts/seed.ts
```

## الخطوة 5: Deploy

اضغط **Deploy** في Vercel ✅

## 🔐 الأمان

- ✅ لا توجد بيانات اعتماد في الكود
- ✅ الـ Demo Login عبر API server-side فقط
- ✅ HMAC signed sessions
- ✅ bcrypt password hashing
- ✅ Security headers (XSS, CSRF, etc.)
- ✅ `.env` محمي في `.gitignore`

## 🔑 الحسابات

| الحساب | البريد | كلمة المرور |
|--------|--------|-------------|
| 👑 المالك | mohamed.osama@osa-erp.com | Osama@2026 |
| 🎯 تجريبي | demo@osaerp.com | Demo@123 |
