'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserCog, Plus, Trash2, Edit, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

type Employee = {
  id: string
  code: string
  name: string
  nameEn: string | null
  phone: string | null
  email: string | null
  position: string | null
  department: string | null
  hireDate: string
  basicSalary: number
  allowances: number
  status: string
}

type Attendance = {
  id: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
  employee: { id: string; name: string; code: string }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(n)
}
function formatDate(s: string) { return new Date(s).toLocaleDateString('ar-SA') }
function formatTime(s: string | null) { return s ? new Date(s).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '-' }

export function HR() {
  const { lang } = useApp()
  const [tab, setTab] = React.useState('employees')

  return (
    <div className="space-y-6 animate-in-fade">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">{t(lang, 'employees')}</TabsTrigger>
          <TabsTrigger value="attendance">{t(lang, 'attendance')}</TabsTrigger>
          <TabsTrigger value="payroll">{t(lang, 'payroll')}</TabsTrigger>
        </TabsList>
        <TabsContent value="employees"><Employees /></TabsContent>
        <TabsContent value="attendance"><AttendanceView /></TabsContent>
        <TabsContent value="payroll"><PayrollView /></TabsContent>
      </Tabs>
    </div>
  )
}

function Employees() {
  const { lang } = useApp()
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<Employee | null>(null)

  const load = () => {
    fetch('/api/employees').then(r => r.json()).then(d => { setEmployees(d); setLoading(false) })
  }
  React.useEffect(load, [])

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'ar' ? 'تأكيد الحذف؟' : 'Confirm?')) return
    await fetch(`/api/employees?id=${id}`, { method: 'DELETE' })
    toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted')
    load()
  }

  if (loading) return <Skeleton className="h-96" />

  const totalPayroll = employees.reduce((s, e) => s + e.basicSalary + e.allowances, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary"><UserCog className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الموظفين' : 'Total'}</p><p className="text-xl font-bold">{employees.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><CheckCircle className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'نشط' : 'Active'}</p><p className="text-xl font-bold">{employees.filter(e => e.status === 'ACTIVE').length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-600"><Calendar className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي الرواتب' : 'Total Payroll'}</p><p className="text-xl font-bold">{formatCurrency(totalPayroll)}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-purple-100 text-purple-600"><UserCog className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الأقسام' : 'Departments'}</p><p className="text-xl font-bold">{new Set(employees.map(e => e.department)).size}</p></div></div></Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{t(lang, 'employees')}</h3>
          <Button onClick={() => { setEditItem(null); setDialogOpen(true) }}><Plus className="h-4 w-4 ml-1" />{t(lang, 'newEmployee')}</Button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start">{t(lang, 'code')}</th>
                <th className="px-4 py-3 text-start">{t(lang, 'name')}</th>
                <th className="px-4 py-3 text-start">{t(lang, 'position')}</th>
                <th className="px-4 py-3 text-start">{t(lang, 'department')}</th>
                <th className="px-4 py-3 text-end">{t(lang, 'salary')}</th>
                <th className="px-4 py-3 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-semibold">{e.code}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-white text-xs font-bold">
                        {e.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{e.name}</p>
                        <p className="text-xs text-muted-foreground">{e.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{e.position}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{e.department}</Badge></td>
                  <td className="px-4 py-3 text-end">
                    <p className="font-semibold">{formatCurrency(e.basicSalary + e.allowances)}</p>
                    <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'أساسي' : 'Basic'}: {formatCurrency(e.basicSalary)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditItem(e); setDialogOpen(true) }}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(e.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <EmployeeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} editItem={editItem} />
    </div>
  )
}

function EmployeeDialog({ open, onClose, onSaved, editItem }: {
  open: boolean; onClose: () => void; onSaved: () => void; editItem: Employee | null
}) {
  const { lang } = useApp()
  const [form, setForm] = React.useState({
    name: '', nameEn: '', phone: '', email: '', position: '', department: '',
    hireDate: new Date().toISOString().split('T')[0], basicSalary: 0, allowances: 0,
  })

  React.useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name, nameEn: editItem.nameEn || '', phone: editItem.phone || '', email: editItem.email || '',
        position: editItem.position || '', department: editItem.department || '',
        hireDate: new Date(editItem.hireDate).toISOString().split('T')[0],
        basicSalary: editItem.basicSalary, allowances: editItem.allowances,
      })
    } else {
      setForm({ name: '', nameEn: '', phone: '', email: '', position: '', department: '', hireDate: new Date().toISOString().split('T')[0], basicSalary: 0, allowances: 0 })
    }
  }, [editItem])

  const submit = async () => {
    const method = editItem ? 'PUT' : 'POST'
    const body = editItem ? { id: editItem.id, ...form } : form
    const res = await fetch('/api/employees', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success(editItem ? (lang === 'ar' ? 'تم التحديث' : 'Updated') : (lang === 'ar' ? 'تمت الإضافة' : 'Added'))
      onSaved(); onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{editItem ? t(lang, 'edit') : t(lang, 'newEmployee')}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div><Label>{t(lang, 'name')} *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>{t(lang, 'nameEn')}</Label><Input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} dir="ltr" /></div>
          <div><Label>{t(lang, 'phone')}</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" /></div>
          <div><Label>{t(lang, 'email')}</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} dir="ltr" /></div>
          <div><Label>{t(lang, 'position')}</Label><Input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} /></div>
          <div><Label>{t(lang, 'department')}</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
          <div><Label>{lang === 'ar' ? 'تاريخ التعيين' : 'Hire Date'}</Label><Input type="date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} /></div>
          <div><Label>{lang === 'ar' ? 'الراتب الأساسي' : 'Basic Salary'}</Label><Input type="number" value={form.basicSalary} onChange={e => setForm({ ...form, basicSalary: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label>{lang === 'ar' ? 'البدلات' : 'Allowances'}</Label><Input type="number" value={form.allowances} onChange={e => setForm({ ...form, allowances: parseFloat(e.target.value) || 0 })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t(lang, 'cancel')}</Button>
          <Button onClick={submit} disabled={!form.name}>{t(lang, 'save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AttendanceView() {
  const { lang } = useApp()
  const [records, setRecords] = React.useState<Attendance[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/attendance?days=7').then(r => r.json()).then(d => { setRecords(d); setLoading(false) })
  }, [])

  if (loading) return <Skeleton className="h-96" />

  const presentCount = records.filter(r => r.status === 'PRESENT').length
  const lateCount = records.filter(r => r.status === 'LATE').length
  const absentCount = records.filter(r => r.status === 'ABSENT').length

  const statusIcons: Record<string, React.ReactNode> = {
    PRESENT: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    LATE: <AlertCircle className="h-4 w-4 text-amber-500" />,
    ABSENT: <XCircle className="h-4 w-4 text-red-500" />,
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'حاضر' : 'Present'}</p><p className="text-2xl font-bold text-emerald-600">{presentCount}</p></div>
          </div>
        </Card>
        <Card className="p-4 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-amber-500" />
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'متأخر' : 'Late'}</p><p className="text-2xl font-bold text-amber-600">{lateCount}</p></div>
          </div>
        </Card>
        <Card className="p-4 bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'غائب' : 'Absent'}</p><p className="text-2xl font-bold text-red-600">{absentCount}</p></div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">{lang === 'ar' ? 'سجل الحضور (آخر 7 أيام)' : 'Attendance (Last 7 days)'}</h3>
        <div className="overflow-x-auto rounded-xl border border-border max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-start">{t(lang, 'code')}</th>
                <th className="px-4 py-3 text-start">{t(lang, 'name')}</th>
                <th className="px-4 py-3 text-start">{t(lang, 'date')}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'الحضور' : 'Check In'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'الانصراف' : 'Check Out'}</th>
                <th className="px-4 py-3 text-center">{t(lang, 'status')}</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono">{r.employee.code}</td>
                  <td className="px-4 py-3 font-medium">{r.employee.name}</td>
                  <td className="px-4 py-3">{formatDate(r.date)}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1"><Clock className="h-3 w-3 text-muted-foreground" />{formatTime(r.checkIn)}</span></td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1"><Clock className="h-3 w-3 text-muted-foreground" />{formatTime(r.checkOut)}</span></td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-medium">
                      {statusIcons[r.status]}
                      {r.status === 'PRESENT' ? (lang === 'ar' ? 'حاضر' : 'Present') : r.status === 'LATE' ? (lang === 'ar' ? 'متأخر' : 'Late') : (lang === 'ar' ? 'غائب' : 'Absent')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function PayrollView() {
  const { lang } = useApp()
  const [employees, setEmployees] = React.useState<Employee[]>([])

  React.useEffect(() => { fetch('/api/employees').then(r => r.json()).then(setEmployees) }, [])

  const totalPayroll = employees.reduce((s, e) => s + e.basicSalary + e.allowances, 0)
  const currentMonth = new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{t(lang, 'payroll')} - {currentMonth}</h3>
          <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'إجمالي الرواتب لهذا الشهر' : 'Total payroll this month'}</p>
        </div>
        <div className="text-end">
          <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الإجمالي' : 'Total'}</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalPayroll)}</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-start">{t(lang, 'name')}</th>
              <th className="px-4 py-3 text-end">{lang === 'ar' ? 'أساسي' : 'Basic'}</th>
              <th className="px-4 py-3 text-end">{lang === 'ar' ? 'بدلات' : 'Allowances'}</th>
              <th className="px-4 py-3 text-end">{lang === 'ar' ? 'خصومات' : 'Deductions'}</th>
              <th className="px-4 py-3 text-end">{lang === 'ar' ? 'صافي' : 'Net'}</th>
              <th className="px-4 py-3 text-center">{t(lang, 'status')}</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(e => {
              const deductions = (e.basicSalary + e.allowances) * 0.05 // 5% approx for GOSI/tax
              const net = e.basicSalary + e.allowances - deductions
              return (
                <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{e.name}</td>
                  <td className="px-4 py-3 text-end">{formatCurrency(e.basicSalary)}</td>
                  <td className="px-4 py-3 text-end">{formatCurrency(e.allowances)}</td>
                  <td className="px-4 py-3 text-end text-red-600">-{formatCurrency(deductions)}</td>
                  <td className="px-4 py-3 text-end font-bold">{formatCurrency(net)}</td>
                  <td className="px-4 py-3 text-center"><Badge variant="secondary">{lang === 'ar' ? 'معلق' : 'Pending'}</Badge></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
