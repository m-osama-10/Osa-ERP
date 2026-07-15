'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, User, Plus, Lock, KeyRound, History, CheckCircle2 } from 'lucide-react'

export function Permissions() {
  const { lang } = useApp()

  const users = [
    { name: 'المدير العام', email: 'admin@osa-erp.com', role: 'ADMIN', lastLogin: 'منذ ساعة', status: 'active' },
    { name: 'المحاسب', email: 'accountant@osa-erp.com', role: 'ACCOUNTANT', lastLogin: 'منذ 3 ساعات', status: 'active' },
    { name: 'مسؤول المبيعات', email: 'sales@osa-erp.com', role: 'SALES', lastLogin: 'منذ يوم', status: 'active' },
  ]

  const roles = [
    { name: 'مدير عام', users: 1, permissions: 24, color: '#0d9488' },
    { name: 'محاسب', users: 1, permissions: 14, color: '#f59e0b' },
    { name: 'مبيعات', users: 1, permissions: 8, color: '#3b82f6' },
    { name: 'موارد بشرية', users: 0, permissions: 6, color: '#a855f7' },
  ]

  const auditLogs = [
    { user: 'المدير العام', action: 'تسجيل دخول', module: 'النظام', time: 'منذ ساعة', ip: '185.234.21.5' },
    { user: 'المحاسب', action: 'إضافة قيد يومية', module: 'المحاسبة', time: 'منذ 3 ساعات', ip: '185.234.21.6' },
    { user: 'مسؤول المبيعات', action: 'إنشاء فاتورة', module: 'المبيعات', time: 'منذ 5 ساعات', ip: '185.234.21.7' },
    { user: 'المحاسب', action: 'تعديل حساب', module: 'المحاسبة', time: 'منذ يوم', ip: '185.234.21.6' },
  ]

  const roleLabels: Record<string, { ar: string; en: string }> = {
    ADMIN: { ar: 'مدير عام', en: 'Admin' },
    ACCOUNTANT: { ar: 'محاسب', en: 'Accountant' },
    SALES: { ar: 'مبيعات', en: 'Sales' },
    HR: { ar: 'موارد بشرية', en: 'HR' },
  }

  return (
    <div className="space-y-6 animate-in-fade">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary"><User className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'المستخدمون' : 'Users'}</p><p className="text-xl font-bold">{users.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><Shield className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الأدوار' : 'Roles'}</p><p className="text-xl font-bold">{roles.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600"><KeyRound className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">2FA</p><p className="text-xl font-bold">{lang === 'ar' ? 'مفعّل' : 'Enabled'}</p></div></div></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">{lang === 'ar' ? 'المستخدمون' : 'Users'}</h3>
            <Button><Plus className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'مستخدم جديد' : 'Add User'}</Button>
          </div>
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.email} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-white font-bold">
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{u.name}</p>
                    <Badge variant="outline">{roleLabels[u.role]?.[lang] || u.role}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="text-end">
                  <p className="text-xs text-muted-foreground">{u.lastLogin}</p>
                  <div className="flex items-center justify-end gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {lang === 'ar' ? 'نشط' : 'Active'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Roles */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">{lang === 'ar' ? 'الأدوار' : 'Roles'}</h3>
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {roles.map(r => (
              <div key={r.name} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ background: r.color }} />
                    <span className="font-medium text-sm">{r.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{r.users} {lang === 'ar' ? 'مستخدم' : 'users'}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{r.permissions} {lang === 'ar' ? 'صلاحية' : 'permissions'}</div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${(r.permissions / 24) * 100}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 2FA Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold">{lang === 'ar' ? 'التحقق بخطوتين (2FA)' : 'Two-Factor Authentication'}</h3>
              <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'زيادة أمان الحساب بإضافة طبقة حماية إضافية' : 'Extra layer of security for accounts'}</p>
            </div>
          </div>
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="h-3 w-3 ml-1" /> {lang === 'ar' ? 'مفعّل' : 'Enabled'}
          </Badge>
        </div>
      </Card>

      {/* Audit Log */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2"><History className="h-5 w-5" /> {lang === 'ar' ? 'سجل العمليات' : 'Audit Log'}</h3>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'المستخدم' : 'User'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'العملية' : 'Action'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'الوحدة' : 'Module'}</th>
                <th className="px-4 py-3 text-start">IP</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'الوقت' : 'Time'}</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{log.user}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{log.module}</Badge></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.ip}</td>
                  <td className="px-4 py-3 text-muted-foreground">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
