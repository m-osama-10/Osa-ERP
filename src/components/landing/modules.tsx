'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import {
  Calculator, Users, Truck, Wallet, Package, ShoppingCart, Factory, UserCog,
  FileText, BarChart3, Building2, Shield, Coins, TrendingUp, Bike
} from 'lucide-react'

const modules = [
  {
    icon: Calculator,
    titleAr: 'الإدارة المالية والمحاسبة',
    titleEn: 'Financial & Accounting',
    color: 'from-emerald-500 to-emerald-600',
    featuresAr: [
      'دليل الحسابات', 'القيود اليومية', 'الأستاذ العام', 'ميزان المراجعة',
      'قائمة الدخل', 'الميزانية العمومية', 'الأرباح والخسائر',
      'التقارير المالية', 'التدفقات النقدية', 'الضرائب (VAT)',
      'دعم الجنيه المصري والدولار الأمريكي'
    ],
    featuresEn: [
      'Chart of Accounts', 'Journal Entries', 'General Ledger', 'Trial Balance',
      'Income Statement', 'Balance Sheet', 'Profit & Loss',
      'Financial Reports', 'Cash Flow', 'VAT',
      'EGP & USD support'
    ],
  },
  {
    icon: Users,
    titleAr: 'العملاء والموردون',
    titleEn: 'Customers & Suppliers',
    color: 'from-blue-500 to-blue-600',
    featuresAr: [
      'إدارة العملاء', 'إدارة الموردين', 'كشف حساب',
      'حدود ائتمانية', 'فواتير البيع', 'فواتير الشراء',
      'المرتجعات', 'عروض الأسعار', 'أوامر البيع والشراء'
    ],
    featuresEn: [
      'Customer Management', 'Supplier Management', 'Account Statement',
      'Credit Limits', 'Sales Invoices', 'Purchase Invoices',
      'Returns', 'Quotations', 'Sales & Purchase Orders'
    ],
  },
  {
    icon: Wallet,
    titleAr: 'الخزائن والبنوك',
    titleEn: 'Treasury & Banks',
    color: 'from-amber-500 to-amber-600',
    featuresAr: [
      'خزائن متعددة', 'حسابات بنكية', 'تحويلات',
      'أوراق قبض', 'أوراق دفع', 'شيكات',
      'التسويات البنكية'
    ],
    featuresEn: [
      'Multiple Cash', 'Bank Accounts', 'Transfers',
      'Receipt Notes', 'Payment Notes', 'Checks',
      'Bank Reconciliation'
    ],
  },
  {
    icon: Package,
    titleAr: 'المخازن',
    titleEn: 'Inventory',
    color: 'from-purple-500 to-purple-600',
    featuresAr: [
      'أصناف', 'Barcode', 'QR Code', 'تشغيلات Batch',
      'صلاحية المنتجات', 'جرد', 'تحويل مخازن',
      'حد إعادة الطلب'
    ],
    featuresEn: [
      'Items', 'Barcode', 'QR Code', 'Batch Tracking',
      'Expiry Dates', 'Stocktaking', 'Warehouse Transfer',
      'Reorder Level'
    ],
  },
  {
    icon: ShoppingCart,
    titleAr: 'المبيعات',
    titleEn: 'Sales',
    color: 'from-pink-500 to-pink-600',
    featuresAr: [
      'POS نقطة البيع', 'عروض أسعار', 'فواتير',
      'مرتجعات', 'خصومات (مبلغ/نسبة)', 'عمولات'
    ],
    featuresEn: [
      'POS', 'Quotations', 'Invoices',
      'Returns', 'Discounts (Amount/%)', 'Commissions'
    ],
  },
  {
    icon: Factory,
    titleAr: 'الإنتاج',
    titleEn: 'Production',
    color: 'from-indigo-500 to-indigo-600',
    featuresAr: [
      'وصفات التصنيع BOM', 'أوامر إنتاج',
      'تكلفة المنتج', 'متابعة مراحل الإنتاج'
    ],
    featuresEn: [
      'Bill of Materials', 'Production Orders',
      'Product Costing', 'Production Stages'
    ],
  },
  {
    icon: UserCog,
    titleAr: 'الموارد البشرية HR',
    titleEn: 'Human Resources',
    color: 'from-cyan-500 to-cyan-600',
    featuresAr: [
      'الموظفين', 'البصمة', 'الحضور والانصراف',
      'الإجازات', 'الرواتب', 'السلف', 'تقييم الأداء'
    ],
    featuresEn: [
      'Employees', 'Fingerprint', 'Attendance',
      'Leaves', 'Payroll', 'Advances', 'Performance'
    ],
  },
  {
    icon: Bike,
    titleAr: 'المندوبين',
    titleEn: 'Sales Reps',
    color: 'from-teal-500 to-teal-600',
    featuresAr: [
      'تطبيق موبايل', 'يعمل بدون إنترنت', 'مزامنة تلقائية',
      'تحصيل نقدي', 'طباعة Bluetooth', 'تحديد موقع GPS'
    ],
    featuresEn: [
      'Mobile App', 'Offline Mode', 'Auto Sync',
      'Cash Collection', 'Bluetooth Print', 'GPS Tracking'
    ],
  },
  {
    icon: Building2,
    titleAr: 'الفروع',
    titleEn: 'Branches',
    color: 'from-orange-500 to-orange-600',
    featuresAr: [
      'عدد غير محدود من الفروع', 'إدارة كل فرع',
      'تقارير مجمعة', 'تقارير منفصلة'
    ],
    featuresEn: [
      'Unlimited Branches', 'Per-branch Management',
      'Consolidated Reports', 'Separate Reports'
    ],
  },
  {
    icon: TrendingUp,
    titleAr: 'الربحية والخسائر',
    titleEn: 'Profitability',
    color: 'from-rose-500 to-rose-600',
    featuresAr: [
      'تقرير P&L لفترة محددة', 'يومي/أسبوعي/شهري/سنوي',
      'مقارنة بين فترتين', 'رسوم بيانية', 'تصدير PDF/Excel'
    ],
    featuresEn: [
      'P&L Report', 'Daily/Weekly/Monthly/Yearly',
      'Period Comparison', 'Charts', 'PDF/Excel Export'
    ],
  },
  {
    icon: BarChart3,
    titleAr: 'التقارير',
    titleEn: 'Reports',
    color: 'from-violet-500 to-violet-600',
    featuresAr: [
      'Dashboard احترافي', 'Charts بيانية',
      'أرباح وخسائر لفترة', 'تقارير العملاء والموردين',
      'تقارير المبيعات والمخزون', 'PDF/Excel/Print'
    ],
    featuresEn: [
      'Pro Dashboard', 'Charts',
      'Period P&L', 'Customer/Supplier Reports',
      'Sales/Inventory Reports', 'PDF/Excel/Print'
    ],
  },
  {
    icon: Coins,
    titleAr: 'العملات',
    titleEn: 'Currencies',
    color: 'from-lime-500 to-lime-600',
    featuresAr: [
      'الجنيه المصري (الأساسية)', 'الدولار الأمريكي',
      'محول عملات تفاعلي', 'أسعار صرف قابلة للتحديث'
    ],
    featuresEn: [
      'EGP (Base)', 'USD',
      'Interactive Converter', 'Updatable Rates'
    ],
  },
]

export function ModulesSection() {
  const { lang } = useApp()

  return (
    <section id="modules" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            {lang === 'ar' ? 'وحدات النظام' : 'System Modules'}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            {lang === 'ar' ? 'كل وحدة مبنية بإتقان' : 'Every Module Built With Care'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {lang === 'ar'
              ? '12 وحدة متكاملة تغطي كل جوانب أعمالك'
              : '12 integrated modules covering every aspect of your business'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, i) => {
            const Icon = mod.icon
            const features = lang === 'ar' ? mod.featuresAr : mod.featuresEn
            return (
              <Card
                key={i}
                className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-default"
              >
                <div className={`inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${mod.color} text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {lang === 'ar' ? mod.titleAr : mod.titleEn}
                </h3>
                <ul className="space-y-1.5">
                  {features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
