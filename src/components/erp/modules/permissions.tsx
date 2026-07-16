'use client'

import * as React from 'react'
import { useApp, t, ALL_PERMISSIONS } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { User, Plus, Trash2, Edit, Shield, KeyRound, History, CheckCircle2, XCircle, Lock } from 'lucide-react'
import { toast } from 'sonner'

type UserT = {
  id: string
  email: string
  name: string
  role: string
  branchId: string | null
  permissions: string[]
  twoFA: boolean
  isActive: boolean
  lastLogin: string | null
  createdAt: string
}

type AuditLog = {
  id: string
  action: string
  module: string
  details: string | null
  ipAddress: string | null
  createdAt: string
  user: { name: string; email: string } | null
}

const roleLabels: Record<string, { ar: string; en: string }> = {
  ADMIN: { ar: 'مدير عام', en: 'Admin' },
  ACCOUNTANT: { ar: 'محاسب', en: 'Accountant' },
  SALES: { ar: 'مبيعات', en: 'Sales' },
  HR: { ar: 'موارد بشرية', en: 'HR' },
  WAREHOUSE: { ar: 'أمين مخزن', en: 'Warehouse' },
  CASHIER: { ar: 'كاشير', en: 'Cashier' },
  REP: { ar: 'مندوب', en: 'Representative' },
  USER: { ar: 'مستخدم', en: 'User' },
}

// Role presets
const rolePresets: Record<string, string[]> = {
  ADMIN: ALL_PERMISSIONS.map(p => p.key),
  ACCOUNTANT: ['dashboard.view', 'accounting.view', 'accounting.create', 'accounting.edit', 'customers.view', 'suppliers.view', 'treasury.view', 'treasury.create', 'reports.view', 'reports.export', 'profitability.view', 'profitability.export'],
  SALES: ['dashboard.view', 'customers.view', 'customers.create', 'customers.edit', 'sales.view', 'sales.create', 'sales.edit', 'pos.use', 'inventory.view', 'representatives.view'],
  HR: ['dashboard.view', 'hr.view', 'hr.create', 'hr.edit', 'attendance.view'],
  WAREHOUSE: ['dashboard.view', 'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'production.view'],
  CASHIER: ['dashboard.view', 'pos.use', 'sales.view', 'sales.create', 'customers.view', 'customers.create'],
  REP: ['dashboard.view', 'customers.view', 'customers.edit', 'sales.view', 'sales.create', 'representatives.view'],
}

export function Permissions() {
  const { lang } = useApp()
  const [tab, setTab] = React.useState('users')

  return (
    <div className="space-y-6 animate-in-fade">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2"><User className="h-4 w-4" /> {t(lang, 'users.manage')}</TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2"><Shield className="h-4 w-4" /> {lang === 'ar' ? 'الأدوار' : 'Roles'}</TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2"><History className="h-4 w-4" /> {lang === 'ar' ? 'سجل العمليات' : 'Audit Log'}</TabsTrigger>
        </TabsList>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="roles"><RolesTab /></TabsContent>
        <TabsContent value="audit"><AuditTab /></TabsContent>
      </Tabs>
    </div>
  )
}

function UsersTab() {
  const { lang } = useApp()
  const [users, setUsers] = React.useState<UserT[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editUser, setEditUser] = React.useState<UserT | null>(null)

  const load = () => {
    fetch('/api/users').then(r => r.json()).then(d => { setUsers(d); setLoading(false) })
  }
  React.useEffect(load, [])

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'ar' ? 'تأكيد حذف المستخدم؟' : 'Confirm delete?')) return
    await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
    toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted')
    load()
  }

  const toggleActive = async (u: UserT) => {
    await fetch('/api/users', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, isActive: !u.isActive, name: u.name, role: u.role, permissions: u.permissions, twoFA: u.twoFA })
    })
    toast.success(lang === 'ar' ? 'تم التحديث' : 'Updated')
    load()
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{lang === 'ar' ? 'إدارة المستخدمين' : 'User Management'}</h3>
          <p className="text-sm text-muted-foreground">{users.length} {lang === 'ar' ? 'مستخدم' : 'users'}</p>
        </div>
        <Button onClick={() => { setEditUser(null); setDialogOpen(true) }}><Plus className="h-4 w-4 ml-1" />{t(lang, 'newUser')}</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-start">{t(lang, 'name')}</th>
              <th className="px-4 py-3 text-start">{t(lang, 'role')}</th>
              <th className="px-4 py-3 text-center">{lang === 'ar' ? 'الصلاحيات' : 'Permissions'}</th>
              <th className="px-4 py-3 text-center">2FA</th>
              <th className="px-4 py-3 text-start">{lang === 'ar' ? 'آخر دخول' : 'Last Login'}</th>
              <th className="px-4 py-3 text-center">{t(lang, 'status')}</th>
              <th className="px-4 py-3 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-white font-bold text-xs">{u.name.charAt(0)}</div>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant={u.role === 'ADMIN' ? 'default' : 'outline'}>{roleLabels[u.role]?.[lang] || u.role}</Badge></td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="secondary">{u.permissions.length} {lang === 'ar' ? 'صلاحية' : 'perms'}</Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  {u.twoFA ? <Lock className="h-4 w-4 text-emerald-500 inline" /> : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {u.lastLogin ? new Date(u.lastLogin).toLocaleString('ar-EG') : (lang === 'ar' ? 'لم يسجل بعد' : 'Never')}
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleActive(u)}>
                    <Badge variant={u.isActive ? 'default' : 'destructive'} className="cursor-pointer">
                      {u.isActive ? <CheckCircle2 className="h-3 w-3 ml-1" /> : <XCircle className="h-3 w-3 ml-1" />}
                      {u.isActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'موقوف' : 'Suspended')}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditUser(u); setDialogOpen(true) }}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(u.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} editUser={editUser} />
    </Card>
  )
}

function UserDialog({ open, onClose, onSaved, editUser }: {
  open: boolean; onClose: () => void; onSaved: () => void; editUser: UserT | null
}) {
  const { lang } = useApp()
  const [form, setForm] = React.useState({
    name: '', email: '', password: '', role: 'USER', twoFA: false, isActive: true,
  })
  const [permissions, setPermissions] = React.useState<string[]>([])

  React.useEffect(() => {
    if (editUser) {
      setForm({ name: editUser.name, email: editUser.email, password: '', role: editUser.role, twoFA: editUser.twoFA, isActive: editUser.isActive })
      setPermissions(editUser.permissions)
    } else {
      setForm({ name: '', email: '', password: '', role: 'USER', twoFA: false, isActive: true })
      setPermissions([])
    }
  }, [editUser])

  const applyRolePreset = (role: string) => {
    setForm({ ...form, role })
    const preset = rolePresets[role] || []
    setPermissions(preset)
    if (role !== 'ADMIN') toast.info(lang === 'ar' ? `تم تطبيق صلاحيات ${roleLabels[role]?.[lang]}` : `Applied ${role} preset`)
  }

  const togglePerm = (key: string) => {
    setPermissions(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])
  }

  const toggleGroup = (group: string) => {
    const groupPerms = ALL_PERMISSIONS.filter(p => p.group === group).map(p => p.key)
    const allSelected = groupPerms.every(k => permissions.includes(k))
    if (allSelected) {
      setPermissions(p => p.filter(k => !groupPerms.includes(k)))
    } else {
      setPermissions(p => Array.from(new Set([...p, ...groupPerms])))
    }
  }

  const submit = async () => {
    if (!form.name || !form.email) { toast.error(lang === 'ar' ? 'أدخل الاسم والبريد' : 'Enter name and email'); return }
    if (!editUser && !form.password) { toast.error(lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'); return }
    const method = editUser ? 'PUT' : 'POST'
    const body: any = { ...form, permissions }
    if (editUser) body.id = editUser.id
    if (!form.password) delete body.password

    const res = await fetch('/api/users', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success(editUser ? (lang === 'ar' ? 'تم التحديث' : 'Updated') : (lang === 'ar' ? 'تم إنشاء المستخدم' : 'User created'))
      onSaved(); onClose()
    } else {
      const err = await res.json()
      toast.error(err.error || 'Error')
    }
  }

  // Group permissions
  const grouped = ALL_PERMISSIONS.reduce((acc, p) => {
    if (!acc[p.group]) acc[p.group] = []
    acc[p.group].push(p)
    return acc
  }, {} as Record<string, typeof ALL_PERMISSIONS>)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editUser ? (lang === 'ar' ? 'تعديل مستخدم' : 'Edit User') : t(lang, 'newUser')}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>{t(lang, 'name')} *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>{t(lang, 'email')} *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} dir="ltr" /></div>
            <div>
              <Label>{t(lang, 'role')}</Label>
              <Select value={form.role} onValueChange={applyRolePreset}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v[lang]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>{t(lang, 'password')} {editUser && <span className="text-xs text-muted-foreground">({lang === 'ar' ? 'اترك فارغ للإبقاء' : 'leave blank to keep'})</span>}</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} dir="ltr" /></div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /><div><Label>2FA</Label><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'التحقق بخطوتين' : 'Two-factor authentication'}</p></div></div>
            <Switch checked={form.twoFA} onCheckedChange={v => setForm({ ...form, twoFA: v })} />
          </div>

          {/* Permissions */}
          <div className="rounded-xl border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="font-semibold flex items-center gap-2"><KeyRound className="h-4 w-4" /> {t(lang, 'permissions')}</h4>
                <p className="text-xs text-muted-foreground">{permissions.length} {lang === 'ar' ? 'صلاحية محددة' : 'permissions selected'}</p>
              </div>
              {form.role !== 'ADMIN' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPermissions(ALL_PERMISSIONS.map(p => p.key))}>{lang === 'ar' ? 'تحديد الكل' : 'All'}</Button>
                  <Button size="sm" variant="outline" onClick={() => setPermissions([])}>{lang === 'ar' ? 'مسح الكل' : 'None'}</Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
              {Object.entries(grouped).map(([group, perms]) => (
                <div key={group} className="rounded-lg border border-border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-sm capitalize">{group}</span>
                    <button onClick={() => toggleGroup(group)} className="text-xs text-primary hover:underline">
                      {perms.every(p => permissions.includes(p.key)) ? (lang === 'ar' ? 'إلغاء الكل' : 'Clear') : (lang === 'ar' ? 'تحديد الكل' : 'All')}
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {perms.map(p => (
                      <label key={p.key} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/40 rounded p-1">
                        <input
                          type="checkbox"
                          checked={permissions.includes(p.key)}
                          onChange={() => togglePerm(p.key)}
                          className="rounded h-3.5 w-3.5"
                          disabled={form.role === 'ADMIN'}
                        />
                        <span>{lang === 'ar' ? p.ar : p.en}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t(lang, 'cancel')}</Button>
          <Button onClick={submit}>{t(lang, 'save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RolesTab() {
  const { lang } = useApp()
  const roles = Object.entries(roleLabels).map(([key, label]) => ({
    key,
    label: label[lang],
    perms: rolePresets[key] || [],
    color: ['#0d9488', '#f59e0b', '#3b82f6', '#a855f7', '#ef4444', '#06b6d4', '#8b5cf6', '#64748b'][Object.keys(roleLabels).indexOf(key) % 8]
  }))

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{lang === 'ar' ? 'الأدوار الوظيفية' : 'Roles'}</h3>
          <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'أنماط جاهزة لكل وظيفة' : 'Predefined role templates'}</p>
        </div>
        <Button><Plus className="h-4 w-4 ml-1" />{lang === 'ar' ? 'دور جديد' : 'New Role'}</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map(r => (
          <div key={r.key} className="rounded-xl border-2 border-border p-5 hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl text-white font-bold" style={{ background: r.color }}>
                <Shield className="h-6 w-6" />
              </div>
              <Badge variant={r.key === 'ADMIN' ? 'default' : 'secondary'}>{r.perms.length} {lang === 'ar' ? 'صلاحية' : 'perms'}</Badge>
            </div>
            <h4 className="font-bold text-base">{r.label}</h4>
            <p className="text-xs text-muted-foreground mb-3 font-mono">{r.key}</p>
            <div className="space-y-1 max-h-[120px] overflow-y-auto">
              {r.perms.slice(0, 4).map(p => {
                const perm = ALL_PERMISSIONS.find(ap => ap.key === p)
                return <div key={p} className="text-xs text-muted-foreground truncate">• {perm ? (lang === 'ar' ? perm.ar : perm.en) : p}</div>
              })}
              {r.perms.length > 4 && <div className="text-xs text-primary">+{r.perms.length - 4} {lang === 'ar' ? 'أخرى' : 'more'}</div>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function AuditTab() {
  const { lang } = useApp()
  const [logs, setLogs] = React.useState<AuditLog[]>([])

  React.useEffect(() => {
    // Use existing audit logs from database via users endpoint (or fake data for now)
    fetch('/api/users').then(r => r.json()).then(() => {
      // Demo audit logs (in production, fetch from /api/audit-logs)
      setLogs([
        { id: '1', action: 'تسجيل دخول', module: 'النظام', details: 'تسجيل دخول ناجح', ipAddress: '197.45.21.8', createdAt: new Date(Date.now() - 3600000).toISOString(), user: { name: 'المدير العام', email: 'admin@osa-erp.com' } },
        { id: '2', action: 'إنشاء فاتورة', module: 'المبيعات', details: 'فاتورة INV-01042 بقيمة 4,560', ipAddress: '197.45.21.8', createdAt: new Date(Date.now() - 7200000).toISOString(), user: { name: 'مسؤول المبيعات', email: 'sales@osa-erp.com' } },
        { id: '3', action: 'تعديل حساب', module: 'المحاسبة', details: 'تعديل رصيد حساب 1101', ipAddress: '197.45.21.9', createdAt: new Date(Date.now() - 10800000).toISOString(), user: { name: 'المحاسب', email: 'accountant@osa-erp.com' } },
        { id: '4', action: 'حذف صنف', module: 'المخازن', details: 'حذف صنف ITM-099', ipAddress: '197.45.21.8', createdAt: new Date(Date.now() - 86400000).toISOString(), user: { name: 'المدير العام', email: 'admin@osa-erp.com' } },
        { id: '5', action: 'تسجيل خروج', module: 'النظام', details: null, ipAddress: '197.45.21.9', createdAt: new Date(Date.now() - 172800000).toISOString(), user: { name: 'المحاسب', email: 'accountant@osa-erp.com' } },
      ])
    })
  }, [])

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><History className="h-5 w-5 text-primary" />{lang === 'ar' ? 'سجل العمليات (Audit Log)' : 'Audit Log'}</h3>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-start">{t(lang, 'date')}</th>
              <th className="px-4 py-3 text-start">{lang === 'ar' ? 'المستخدم' : 'User'}</th>
              <th className="px-4 py-3 text-start">{lang === 'ar' ? 'العملية' : 'Action'}</th>
              <th className="px-4 py-3 text-start">{lang === 'ar' ? 'الوحدة' : 'Module'}</th>
              <th className="px-4 py-3 text-start">{lang === 'ar' ? 'التفاصيل' : 'Details'}</th>
              <th className="px-4 py-3 text-start">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleString('ar-EG')}</td>
                <td className="px-4 py-3 font-medium">{l.user?.name || '—'}</td>
                <td className="px-4 py-3">{l.action}</td>
                <td className="px-4 py-3"><Badge variant="outline">{l.module}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{l.details || '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
