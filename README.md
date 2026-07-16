# 🏢 OSA ERP — نظام إدارة المؤسسات المتكامل

> **بكل فخر صُنع في صعيد مصر** 🇪🇬

نظام ERP متكامل للمحاسبة والمبيعات والمخازن والموارد البشرية. مبني بأحدث التقنيات، آمن، سريع، وجاهز للإنتاج.

## ✨ المميزات

- 📊 **لوحة تحكم تفاعلية** مع KPIs ورسوم بيانية
- 🧮 **محاسبة كاملة** (دليل حسابات، قيود، ميزان، قوائم مالية)
- 👥 **عملاء وموردون** (CRUD + حدود ائتمانية + كشف حساب)
- 💰 **خزائن وبنوك** (تحويلات + قبض/صرف + أرصدة)
- 📦 **مخازن** (أصناف + باركود + جرد + حد إعادة طلب)
- 🏭 **إنتاج** (BOM + أوامر إنتاج + تكلفة)
- 👨‍💼 **موارد بشرية** (موظفين + حضور + رواتب + إجازات + سلف + مأموريات)
- 🛒 **مبيعات** (فواتير + POS + خصومات)
- 🚚 **مندوبين** (تتبع + زيارات + تحصيل)
- 📈 **ربحية** (مقارنة فترات + رسوم بيانية + PDF/Excel)
- 🔐 **صلاحيات** (44 صلاحية + 8 أدوار + Audit Log)
- 💱 **عملات** (EGP + USD + محوّل)
- 🌍 **ثنائي اللغة** (عربي/إنجليزي + RTL)
- 🌙 **Dark/Light Mode**

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+ أو Bun
- PostgreSQL (أو SQLite للتطوير)

### التثبيت
```bash
bun install
cp .env.development .env
bun run db:push
bun run db:seed
bun run dev
```

### الحسابات التجريبية
| الحساب | البريد | كلمة المرور |
|--------|--------|-------------|
| 👑 المالك | mohamed.osama@osa-erp.com | Osama@2026 |
| 🎯 تجريبي | demo@osaerp.com | Demo@123 |

## 📦 النشر على Vercel

1. ارفع المشروع على GitHub
2. اربط الـ repo بـ Vercel
3. أضف متغيرات البيئة (انظر `.env.production.example`)
4. اضبط Build Command: `prisma generate && next build`
5. Deploy ✅

### متغيرات البيئة المطلوبة
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_SECRET=<32-char-hex>
DEMO_EMAIL=demo@osaerp.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🛠️ التقنيات

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: bcrypt + HMAC sessions + RBAC
- **Charts**: Recharts
- **Export**: jsPDF + XLSX
- **Icons**: Lucide React
- **Font**: Alexandria (Google Fonts)

## 📞 تواصل

- 📞 01030123052
- 📧 M.osama10@outlook.com
- 📘 [facebook.com/Osa.Erp.eg](https://www.facebook.com/Osa.Erp.eg)
- 📍 أسيوط، مصر

## 📄 الترخيص

© 2026 OSA ERP. جميع الحقوق محفوظة.
