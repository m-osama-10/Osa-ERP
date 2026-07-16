'use client'

import * as React from 'react'
import { useApp } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Shield, UserPlus, Edit, Trash2, UserX, Crown, KeyRound, History, CheckCircle2 } from 'lucide-react'

export function PermissionsSection() {
  const { lang } = useApp()

  const adminAbilities = [
    { icon: UserPlus, ar: 'إنشاء مستخدم جديد', en: 'Create new user' },
    { icon: Edit, ar: 'تعديل بيانات المستخدم', en: 'Edit user data' },
    { icon: Trash2, ar: 'حذف المستخدم', en: 'Delete user' },
    { icon: UserX, ar: 'إيقاف المستخدم مؤقتاً', en: 'Suspend user' },
    { icon: Crown, ar: 'إنشاء أدوار جديدة (Roles)', en: 'Create new roles' },
    { icon: KeyRound, ar: 'تحديد صلاحيات كل مستخدم', en: 'Set per-user permissions' },
    { icon: Edit, ar: 'تعديل الصلاحيات في أي وقت', en: 'Edit permissions anytime' },
    { icon: History, ar: 'Audit Log لجميع العمليات', en: 'Full Audit Log' },
  ]

  return (
    <section id="features" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Shield className="h-4 w-4" />
            {lang === 'ar' ? 'نظام صلاحيات احترافي' : 'Pro Permissions System'}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            {lang === 'ar' ? 'تحكم كامل في الصلاحيات' : 'Full Access Control'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {lang === 'ar'
              ? '44 صلاحية دقيقة + 8 أدوار جاهزة + سجل عمليات كامل'
              : '44 fine-grained permissions + 8 ready roles + full audit log'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Admin abilities */}
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Crown className="h-6 w-6 text-amber-500" />
              {lang === 'ar' ? 'الأدمن يستطيع' : 'Admin Can'}
            </h3>
            <div className="space-y-3">
              {adminAbilities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                    <a.icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{lang === 'ar' ? a.ar : a.en}</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 ms-auto" />
                </div>
              ))}
            </div>
          </Card>

          {/* Roles overview */}
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <KeyRound className="h-6 w-6 text-primary" />
              {lang === 'ar' ? 'أدوار جاهزة' : 'Ready Roles'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { ar: 'مدير عام', en: 'Admin', color: 'bg-amber-500' },
                { ar: 'محاسب', en: 'Accountant', color: 'bg-emerald-500' },
                { ar: 'مبيعات', en: 'Sales', color: 'bg-blue-500' },
                { ar: 'موارد بشرية', en: 'HR', color: 'bg-purple-500' },
                { ar: 'أمين مخزن', en: 'Warehouse', color: 'bg-pink-500' },
                { ar: 'كاشير', en: 'Cashier', color: 'bg-cyan-500' },
                { ar: 'مندوب', en: 'Representative', color: 'bg-teal-500' },
                { ar: 'مستخدم', en: 'User', color: 'bg-gray-500' },
              ].map((role, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-border">
                  <div className={`h-3 w-3 rounded-full ${role.color}`} />
                  <span className="font-medium text-sm">{lang === 'ar' ? role.ar : role.en}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3 mb-2">
                <History className="h-5 w-5 text-primary" />
                <h4 className="font-bold">{lang === 'ar' ? 'سجل العمليات (Audit Log)' : 'Audit Log'}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {lang === 'ar'
                  ? 'يسجّل النظام كل عملية (إنشاء/تعديل/حذف) مع المستخدم والوقت و IP لتحقيق الشفافية الكاملة والمساءلة.'
                  : 'The system logs every action (create/edit/delete) with user, time, and IP for full transparency and accountability.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
