'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  UserCog, Plus, Trash2, Edit, Calendar, Clock, CheckCircle2, XCircle, AlertCircle,
  Upload, Download, FileSpreadsheet, Archive, RotateCcw, History, DollarSign,
  TrendingUp, Users, Plane, Briefcase, Award, AlertTriangle, Search,
  LogIn, LogOut, FileText, Banknote,
} from 'lucide-react'
import { toast } from 'sonner'
import { exportPDF, exportExcel } from '@/components/erp/export-utils'
import * as XLSX from 'xlsx'

type Employee = {
  id: string; code: string; name: string; nameEn: string | null
  nationalId: string | null
  phone: string | null; email: string | null
  position: string | null; department: string | null
  hireDate: string; basicSalary: number; allowances: number
  incentives: number; deductions: number; bankAccount: string | null
  photo: string | null; files: string; archived: boolean; status: string
  createdAt: string; _count?: { attendances: number; leaves: number; advances: number }
}

type Attendance = {
  id: string; date: string; checkIn: string | null; checkOut: string | null
  workHours: number; overtime: number; lateMinutes: number; status: string; notes: string | null
  employee: { id: string; name: string; code: string }
}

type Leave = {
  id: string; startDate: string; endDate: string; days: number; type: string
  reason: string | null; status: string; requestedAt: string
  employee: { id: string; name: string; code: string }
}

type Advance = {
  id: string; amount: number; type: string; installments: number
  paidInstallments: number; date: string; status: string; notes: string | null
  employee: { id: string; name: string; code: string }
}

type Deputation = {
  id: string; destination: string; purpose: string; startDate: string; endDate: string
  allowance: number; status: string; notes: string | null
  employee: { id: string; name: string; code: string }
}

type HistoryItem = {
  id: string; type: string; title: string; description: string | null
  date: string; amount: number | null
  employee: { id: string; name: string; code: string }
}

type Payroll = {
  id: string; month: number; year: number; basicSalary: number; allowances: number
  incentives: number; deductions: number; advancesPaid: number; overtimePay: number
  netSalary: number; status: string; paidAt: string | null
  employee: { id: string; name: string; code: string }
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(n) + ' ج.م'
}
function formatDate(s: string) { return new Date(s).toLocaleDateString('ar-EG') }
function formatTime(s: string | null) { return s ? new Date(s).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-' }

const statusVariants: Record<string, any> = {
  ACTIVE: 'default', ARCHIVED: 'secondary', ON_LEAVE: 'outline', RESIGNED: 'destructive',
  PRESENT: 'default', LATE: 'secondary', ABSENT: 'destructive', LEAVE: 'outline',
  PENDING: 'secondary', APPROVED: 'default', REJECTED: 'destructive', PAID: 'default',
  COMPLETED: 'default',
}

export function HR() {
  const { lang, hasPermission } = useApp()
  const [tab, setTab] = React.useState('employees')

  // Field-level permission: hide salary fields if no hr.salary.view permission
  const canViewSalary = hasPermission('hr.salary.view')

  return (
    <div className="space-y-4 animate-fade-in">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto gap-1">
          <TabsTrigger value="employees" className="flex flex-col items-center gap-1 py-2 text-xs">
            <UserCog className="h-4 w-4" /> {t(lang, 'employees')}
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Clock className="h-4 w-4" /> {t(lang, 'attendance')}
          </TabsTrigger>
          <TabsTrigger value="leaves" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Plane className="h-4 w-4" /> {lang === 'ar' ? 'الإجازات' : 'Leaves'}
          </TabsTrigger>
          <TabsTrigger value="advances" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Banknote className="h-4 w-4" /> {lang === 'ar' ? 'السلف' : 'Advances'}
          </TabsTrigger>
          <TabsTrigger value="deputations" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Briefcase className="h-4 w-4" /> {lang === 'ar' ? 'المأموريات' : 'Deputations'}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-2 text-xs">
            <History className="h-4 w-4" /> {lang === 'ar' ? 'السجل' : 'History'}
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex flex-col items-center gap-1 py-2 text-xs">
            <DollarSign className="h-4 w-4" /> {t(lang, 'payroll')}
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex flex-col items-center gap-1 py-2 text-xs">
            <TrendingUp className="h-4 w-4" /> {lang === 'ar' ? 'التقارير' : 'Reports'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees"><EmployeesTab canViewSalary={canViewSalary} /></TabsContent>
        <TabsContent value="attendance"><AttendanceTab /></TabsContent>
        <TabsContent value="leaves"><LeavesTab /></TabsContent>
        <TabsContent value="advances"><AdvancesTab /></TabsContent>
        <TabsContent value="deputations"><DeputationsTab /></TabsContent>
        <TabsContent value="history"><HistoryTab /></TabsContent>
        <TabsContent value="payroll"><PayrollTab canViewSalary={canViewSalary} /></TabsContent>
        <TabsContent value="reports"><ReportsTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ============ Employees Tab ============
function EmployeesTab({ canViewSalary }: { canViewSalary: boolean }) {
  const { lang, hasPermission } = useApp()
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<Employee | null>(null)
  const [showArchived, setShowArchived] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [deptFilter, setDeptFilter] = React.useState('')

  const load = () => {
    fetch(`/api/employees${showArchived ? '?archived=1' : ''}`).then(r => r.json()).then(d => { setEmployees(d); setLoading(false) })
  }
  React.useEffect(load, [showArchived])

  const filtered = employees.filter(e => {
    const matchSearch = !search || e.name.includes(search) || e.code.toLowerCase().includes(search.toLowerCase()) || (e.phone || '').includes(search)
    const matchDept = !deptFilter || e.department === deptFilter
    return matchSearch && matchDept
  })
  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)))

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'ar' ? 'تأكيد الحذف؟' : 'Confirm delete?')) return
    await fetch(`/api/employees?id=${id}`, { method: 'DELETE' })
    toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted')
    load()
  }

  const handleArchive = async (id: string, archive: boolean) => {
    await fetch('/api/employees', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: archive ? 'archive' : 'unarchive' })
    })
    toast.success(archive ? (lang === 'ar' ? 'تمت الأرشفة' : 'Archived') : (lang === 'ar' ? 'تمت الاستعادة' : 'Restored'))
    load()
  }

  const handleExport = () => {
    exportExcel({
      filename: 'employees.xlsx',
      sheets: [{
        name: 'Employees',
        columns: ['Code', 'Name', 'Phone', 'Email', 'Position', 'Department', 'Hire Date', ...(canViewSalary ? ['Basic Salary', 'Allowances', 'Incentives'] : []), 'Status'],
        rows: filtered.map(e => [
          e.code, e.name, e.phone || '', e.email || '', e.position || '', e.department || '',
          formatDate(e.hireDate),
          ...(canViewSalary ? [e.basicSalary, e.allowances, e.incentives] : []),
          e.status,
        ])
      }]
    })
    toast.success(lang === 'ar' ? 'تم التصدير' : 'Exported')
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-3">
      {/* Top actions */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" style={{ right: 12 }} />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t(lang, 'search')} className="h-10 pr-9" />
        </div>
        <Select value={deptFilter || '_all'} onValueChange={v => setDeptFilter(v === '_all' ? '' : v)}>
          <SelectTrigger className="w-40 h-10"><SelectValue placeholder={lang === 'ar' ? 'كل الأقسام' : 'All depts'} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{lang === 'ar' ? 'الكل' : 'All'}</SelectItem>
            {departments.map(d => <SelectItem key={d as string} value={d as string}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          <Upload className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'استيراد' : 'Import'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'تصدير' : 'Export'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowArchived(s => !s)}>
          <Archive className="h-4 w-4 ml-1" /> {showArchived ? (lang === 'ar' ? 'النشطين' : 'Active') : (lang === 'ar' ? 'المؤرشفين' : 'Archived')}
        </Button>
        {hasPermission('hr.create') && (
          <Button size="sm" onClick={() => { setEditItem(null); setDialogOpen(true) }}>
            <Plus className="h-4 w-4 ml-1" /> {t(lang, 'newEmployee')}
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-start">{t(lang, 'code')}</th>
                <th className="px-3 py-2 text-start">{t(lang, 'name')}</th>
                <th className="px-3 py-2 text-start">{t(lang, 'position')}</th>
                <th className="px-3 py-2 text-start">{t(lang, 'department')}</th>
                {canViewSalary && <th className="px-3 py-2 text-end">{lang === 'ar' ? 'الراتب' : 'Salary'}</th>}
                <th className="px-3 py-2 text-center">{t(lang, 'status')}</th>
                <th className="px-3 py-2 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={canViewSalary ? 7 : 6} className="px-4 py-12 text-center text-muted-foreground">
                  <UserCog className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  {lang === 'ar' ? 'لا يوجد موظفون' : 'No employees'}
                </td></tr>
              ) : filtered.map(e => (
                <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono font-semibold text-primary">{e.code}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-full gradient-primary text-white text-xs font-bold shrink-0 overflow-hidden">
                        {e.photo ? <img src={e.photo} alt={e.name} className="h-full w-full object-cover" /> : e.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{e.name}</p>
                        <p className="text-xs text-muted-foreground">{e.email || e.phone || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">{e.position || '—'}</td>
                  <td className="px-3 py-2">{e.department ? <Badge variant="outline">{e.department}</Badge> : '—'}</td>
                  {canViewSalary && <td className="px-3 py-2 text-end font-semibold">{formatMoney(e.basicSalary + e.allowances + e.incentives)}</td>}
                  <td className="px-3 py-2 text-center">
                    <Badge variant={e.archived ? 'secondary' : statusVariants[e.status] || 'default'}>
                      {e.archived ? (lang === 'ar' ? 'مؤرشف' : 'Archived') : e.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1">
                      {hasPermission('hr.edit') && (
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditItem(e); setDialogOpen(true) }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission('hr.edit') && !e.archived && (
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleArchive(e.id, true)} title={lang === 'ar' ? 'أرشفة' : 'Archive'}>
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission('hr.edit') && e.archived && (
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleArchive(e.id, false)} title={lang === 'ar' ? 'استعادة' : 'Restore'}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission('hr.delete') && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(e.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <EmployeeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} editItem={editItem} canViewSalary={canViewSalary} />
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} onSaved={load} />
    </div>
  )
}

function EmployeeDialog({ open, onClose, onSaved, editItem, canViewSalary }: {
  open: boolean; onClose: () => void; onSaved: () => void; editItem: Employee | null; canViewSalary: boolean
}) {
  const { lang } = useApp()
  const [form, setForm] = React.useState<any>({})
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name, nameEn: editItem.nameEn || '', nationalId: editItem.nationalId || '',
        phone: editItem.phone || '', email: editItem.email || '', position: editItem.position || '',
        department: editItem.department || '', hireDate: new Date(editItem.hireDate).toISOString().split('T')[0],
        basicSalary: editItem.basicSalary, allowances: editItem.allowances, incentives: editItem.incentives,
        deductions: editItem.deductions, bankAccount: editItem.bankAccount || '', photo: editItem.photo || '',
      })
    } else {
      setForm({
        name: '', nameEn: '', nationalId: '', phone: '', email: '', position: '', department: '',
        hireDate: new Date().toISOString().split('T')[0], basicSalary: 0, allowances: 0, incentives: 0,
        deductions: 0, bankAccount: '', photo: '',
      })
    }
  }, [editItem])

  const submit = async () => {
    if (submitting) return
    if (!form.name) { toast.error(lang === 'ar' ? 'الاسم مطلوب' : 'Name required'); return }
    setSubmitting(true)
    try {
      const method = editItem ? 'PUT' : 'POST'
      const body = editItem ? { id: editItem.id, ...form } : form
      const res = await fetch('/api/employees', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        toast.success(editItem ? (lang === 'ar' ? 'تم التحديث' : 'Updated') : (lang === 'ar' ? 'تمت الإضافة' : 'Added'))
        onSaved(); onClose()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error')
      }
    } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editItem ? t(lang, 'edit') : t(lang, 'newEmployee')}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div><Label>{t(lang, 'name')} *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>{t(lang, 'nameEn')}</Label><Input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} dir="ltr" /></div>
          <div><Label>{lang === 'ar' ? 'الرقم القومي' : 'National ID'}</Label><Input value={form.nationalId} onChange={e => setForm({ ...form, nationalId: e.target.value })} dir="ltr" /></div>
          <div><Label>{t(lang, 'phone')}</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" /></div>
          <div><Label>{t(lang, 'email')}</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} dir="ltr" /></div>
          <div><Label>{t(lang, 'position')}</Label><Input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} /></div>
          <div><Label>{t(lang, 'department')}</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
          <div><Label>{lang === 'ar' ? 'تاريخ التعيين' : 'Hire Date'}</Label><Input type="date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} /></div>
          {canViewSalary && (
            <>
              <div><Label>{lang === 'ar' ? 'الراتب الأساسي' : 'Basic Salary'}</Label><Input type="number" value={form.basicSalary} onChange={e => setForm({ ...form, basicSalary: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>{lang === 'ar' ? 'البدلات' : 'Allowances'}</Label><Input type="number" value={form.allowances} onChange={e => setForm({ ...form, allowances: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>{lang === 'ar' ? 'الحوافز' : 'Incentives'}</Label><Input type="number" value={form.incentives} onChange={e => setForm({ ...form, incentives: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>{lang === 'ar' ? 'الخصومات' : 'Deductions'}</Label><Input type="number" value={form.deductions} onChange={e => setForm({ ...form, deductions: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>{lang === 'ar' ? 'الحساب البنكي' : 'Bank Account'}</Label><Input value={form.bankAccount} onChange={e => setForm({ ...form, bankAccount: e.target.value })} dir="ltr" /></div>
            </>
          )}
          <div><Label>{lang === 'ar' ? 'رابط الصورة الشخصية' : 'Photo URL'}</Label><Input value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} dir="ltr" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t(lang, 'cancel')}</Button>
          <Button onClick={submit} disabled={submitting}>{submitting ? '...' : t(lang, 'save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ImportDialog({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const { lang } = useApp()
  const [data, setData] = React.useState<any[]>([])
  const [fileName, setFileName] = React.useState('')
  const [importing, setImporting] = React.useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(ws)
    setData(json as any[])
    toast.success(lang === 'ar' ? `تم قراءة ${json.length} صف` : `Read ${json.length} rows`)
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { name: 'أحمد محمد', nameEn: 'Ahmed Mohamed', phone: '01012345678', email: 'ahmed@test.com', position: 'محاسب', department: 'المالية', basicSalary: 8000, allowances: 1500 }
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, 'employees-template.xlsx')
  }

  const doImport = async () => {
    if (data.length === 0) { toast.error(lang === 'ar' ? 'لا توجد بيانات' : 'No data'); return }
    setImporting(true)
    try {
      const res = await fetch('/api/employees/import', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: data })
      })
      const result = await res.json()
      toast.success(lang === 'ar' ? `نجح: ${result.success}، فشل: ${result.failed}` : `Success: ${result.success}, Failed: ${result.failed}`)
      if (result.errors.length > 0) {
        result.errors.slice(0, 5).forEach((e: string) => toast.error(e))
      }
      onSaved(); onClose(); setData([])
    } finally { setImporting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{lang === 'ar' ? 'استيراد موظفين من Excel/CSV' : 'Import Employees'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
            <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-2">{lang === 'ar' ? 'اختر ملف Excel أو CSV' : 'Choose Excel or CSV file'}</p>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" id="emp-import" />
            <Button variant="outline" size="sm" asChild><label htmlFor="emp-import" className="cursor-pointer">{lang === 'ar' ? 'اختر ملف' : 'Choose file'}</label></Button>
            {fileName && <p className="text-xs text-primary mt-2">{fileName} — {data.length} {lang === 'ar' ? 'صف' : 'rows'}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={downloadTemplate} className="w-full">
            <FileSpreadsheet className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'تحميل قالب Excel' : 'Download template'}
          </Button>
          {data.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 sticky top-0"><tr>{Object.keys(data[0]).map(k => <th key={k} className="px-2 py-1 text-start">{k}</th>)}</tr></thead>
                <tbody>{data.slice(0, 5).map((r, i) => <tr key={i} className="border-t">{Object.values(r).map((v, j) => <td key={j} className="px-2 py-1">{String(v)}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t(lang, 'cancel')}</Button>
          <Button onClick={doImport} disabled={importing || data.length === 0}>
            {importing ? '...' : `${lang === 'ar' ? 'استيراد' : 'Import'} (${data.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ Attendance Tab ============
function AttendanceTab() {
  const { lang, hasPermission } = useApp()
  const [records, setRecords] = React.useState<Attendance[]>([])
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [days, setDays] = React.useState(7)
  const [checkInOpen, setCheckInOpen] = React.useState(false)
  const [selectedEmp, setSelectedEmp] = React.useState('')

  const load = () => {
    Promise.all([
      fetch(`/api/attendance?days=${days}`).then(r => r.json()),
      fetch('/api/employees').then(r => r.json()),
    ]).then(([a, e]) => { setRecords(a); setEmployees(e); setLoading(false) })
  }
  React.useEffect(load, [days])

  const filtered = records.filter(r => {
    const matchSearch = !search || r.employee.name.includes(search) || r.employee.code.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const doCheckIn = async (type: 'check-in' | 'check-out') => {
    if (!selectedEmp) { toast.error(lang === 'ar' ? 'اختر موظف' : 'Select employee'); return }
    const res = await fetch('/api/attendance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: selectedEmp, type })
    })
    if (res.ok) {
      toast.success(type === 'check-in' ? (lang === 'ar' ? 'تم تسجيل الحضور' : 'Checked in') : (lang === 'ar' ? 'تم تسجيل الانصراف' : 'Checked out'))
      setCheckInOpen(false); setSelectedEmp(''); load()
    } else {
      const err = await res.json()
      toast.error(err.error || 'Error')
    }
  }

  const handleExport = () => {
    exportExcel({
      filename: 'attendance.xlsx',
      sheets: [{
        name: 'Attendance',
        columns: ['Date', 'Code', 'Name', 'Check In', 'Check Out', 'Work Hours', 'Overtime', 'Late (min)', 'Status'],
        rows: filtered.map(r => [formatDate(r.date), r.employee.code, r.employee.name, formatTime(r.checkIn), formatTime(r.checkOut), r.workHours, r.overtime, r.lateMinutes, r.status])
      }]
    })
    toast.success(lang === 'ar' ? 'تم التصدير' : 'Exported')
  }

  if (loading) return <Skeleton className="h-96" />

  const presentToday = records.filter(r => r.status === 'PRESENT' && new Date(r.date).toDateString() === new Date().toDateString()).length
  const lateToday = records.filter(r => r.status === 'LATE' && new Date(r.date).toDateString() === new Date().toDateString()).length
  const absentToday = records.filter(r => r.status === 'ABSENT' && new Date(r.date).toDateString() === new Date().toDateString()).length

  return (
    <div className="space-y-3">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" /><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'حاضر اليوم' : 'Present Today'}</p><p className="text-xl font-bold">{presentToday}</p></div></div></Card>
        <Card className="p-3"><div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-amber-500" /><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'متأخر اليوم' : 'Late Today'}</p><p className="text-xl font-bold">{lateToday}</p></div></div></Card>
        <Card className="p-3"><div className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" /><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'غائب اليوم' : 'Absent Today'}</p><p className="text-xl font-bold">{absentToday}</p></div></div></Card>
        <Card className="p-3"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي السجلات' : 'Total Records'}</p><p className="text-xl font-bold">{records.length}</p></div></div></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" style={{ right: 12 }} />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t(lang, 'search')} className="h-10 pr-9" />
        </div>
        <Select value={statusFilter || "_all"} onValueChange={v => setStatusFilter(v === "_all" ? "" : v)}>
          <SelectTrigger className="w-32 h-10"><SelectValue placeholder={lang === 'ar' ? 'الحالة' : 'Status'} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{lang === "ar" ? "الكل" : "All"}</SelectItem>
            <SelectItem value="PRESENT">{lang === 'ar' ? 'حاضر' : 'Present'}</SelectItem>
            <SelectItem value="LATE">{lang === 'ar' ? 'متأخر' : 'Late'}</SelectItem>
            <SelectItem value="ABSENT">{lang === 'ar' ? 'غائب' : 'Absent'}</SelectItem>
            <SelectItem value="LEAVE">{lang === 'ar' ? 'إجازة' : 'Leave'}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={String(days)} onValueChange={v => setDays(parseInt(v))}>
          <SelectTrigger className="w-32 h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{lang === 'ar' ? 'اليوم' : 'Today'}</SelectItem>
            <SelectItem value="7">{lang === 'ar' ? '7 أيام' : '7 days'}</SelectItem>
            <SelectItem value="30">{lang === 'ar' ? '30 يوم' : '30 days'}</SelectItem>
            <SelectItem value="90">{lang === 'ar' ? '90 يوم' : '90 days'}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 ml-1" /> Excel</Button>
        {hasPermission('hr.create') && (
          <Button size="sm" onClick={() => setCheckInOpen(true)}>
            <LogIn className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'تسجيل حضور' : 'Check In/Out'}
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-start">{t(lang, 'date')}</th>
                <th className="px-3 py-2 text-start">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                <th className="px-3 py-2 text-start">{lang === 'ar' ? 'حضور' : 'In'}</th>
                <th className="px-3 py-2 text-start">{lang === 'ar' ? 'انصراف' : 'Out'}</th>
                <th className="px-3 py-2 text-end">{lang === 'ar' ? 'ساعات' : 'Hours'}</th>
                <th className="px-3 py-2 text-end">{lang === 'ar' ? 'إضافي' : 'OT'}</th>
                <th className="px-3 py-2 text-end">{lang === 'ar' ? 'تأخير(د)' : 'Late(m)'}</th>
                <th className="px-3 py-2 text-center">{t(lang, 'status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  {lang === 'ar' ? 'لا توجد سجلات' : 'No records'}
                </td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2 text-xs">{formatDate(r.date)}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium">{r.employee.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{r.employee.code}</p>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{formatTime(r.checkIn)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{formatTime(r.checkOut)}</td>
                  <td className="px-3 py-2 text-end font-medium">{r.workHours || '-'}</td>
                  <td className="px-3 py-2 text-end text-emerald-600 font-medium">{r.overtime || '-'}</td>
                  <td className="px-3 py-2 text-end text-amber-600 font-medium">{r.lateMinutes || '-'}</td>
                  <td className="px-3 py-2 text-center"><Badge variant={statusVariants[r.status] || 'default'}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Check In/Out Dialog */}
      <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lang === 'ar' ? 'تسجيل حضور/انصراف' : 'Check In / Out'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{lang === 'ar' ? 'اختر الموظف' : 'Select Employee'}</Label>
              <Select value={selectedEmp} onValueChange={setSelectedEmp}>
                <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'اختر' : 'Select'} /></SelectTrigger>
                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.code} - {e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => doCheckIn('check-in')} className="h-14 btn-primary-gradient">
                <LogIn className="h-5 w-5 ml-2" /> {lang === 'ar' ? 'تسجيل حضور' : 'Check In'}
              </Button>
              <Button onClick={() => doCheckIn('check-out')} variant="outline" className="h-14">
                <LogOut className="h-5 w-5 ml-2" /> {lang === 'ar' ? 'تسجيل انصراف' : 'Check Out'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ Leaves Tab ============
function LeavesTab() {
  const { lang, hasPermission } = useApp()
  const [leaves, setLeaves] = React.useState<Leave[]>([])
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [statusFilter, setStatusFilter] = React.useState('')
  const [form, setForm] = React.useState({ employeeId: '', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], type: 'ANNUAL', reason: '' })

  const load = () => {
    Promise.all([
      fetch('/api/leaves').then(r => r.json()),
      fetch('/api/employees').then(r => r.json()),
    ]).then(([l, e]) => { setLeaves(l); setEmployees(e); setLoading(false) })
  }
  React.useEffect(load, [])

  const filtered = leaves.filter(l => !statusFilter || l.status === statusFilter)

  const submit = async () => {
    const res = await fetch('/api/leaves', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      toast.success(lang === 'ar' ? 'تم طلب الإجازة' : 'Leave requested')
      setDialogOpen(false)
      setForm({ employeeId: '', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], type: 'ANNUAL', reason: '' })
      load()
    }
  }

  const approve = async (id: string, action: 'approve' | 'reject') => {
    await fetch('/api/leaves', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) })
    toast.success(action === 'approve' ? (lang === 'ar' ? 'تمت الموافقة' : 'Approved') : (lang === 'ar' ? 'تم الرفض' : 'Rejected'))
    load()
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select value={statusFilter || "_all"} onValueChange={v => setStatusFilter(v === "_all" ? "" : v)}>
          <SelectTrigger className="w-32 h-10"><SelectValue placeholder={lang === 'ar' ? 'الحالة' : 'Status'} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{lang === "ar" ? "الكل" : "All"}</SelectItem>
            <SelectItem value="PENDING">{lang === 'ar' ? 'معلق' : 'Pending'}</SelectItem>
            <SelectItem value="APPROVED">{lang === 'ar' ? 'موافق' : 'Approved'}</SelectItem>
            <SelectItem value="REJECTED">{lang === 'ar' ? 'مرفوض' : 'Rejected'}</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        {hasPermission('hr.create') && (
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'طلب إجازة' : 'Request Leave'}</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Plane className="h-12 w-12 mx-auto mb-2 opacity-30" />
            {lang === 'ar' ? 'لا توجد إجازات' : 'No leaves'}
          </div>
        ) : filtered.map(l => (
          <Card key={l.id} className="p-4 card-lift">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold">{l.employee.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{l.employee.code}</p>
              </div>
              <Badge variant={statusVariants[l.status] || 'default'}>{l.status}</Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'النوع' : 'Type'}</span><Badge variant="outline">{l.type}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'من' : 'From'}</span><span>{formatDate(l.startDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'إلى' : 'To'}</span><span>{formatDate(l.endDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'الأيام' : 'Days'}</span><span className="font-bold">{l.days}</span></div>
              {l.reason && <p className="text-xs text-muted-foreground pt-2 border-t">{l.reason}</p>}
            </div>
            {l.status === 'PENDING' && hasPermission('hr.edit') && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <Button size="sm" className="flex-1 btn-primary-gradient" onClick={() => approve(l.id, 'approve')}>
                  <CheckCircle2 className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'موافقة' : 'Approve'}
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-destructive" onClick={() => approve(l.id, 'reject')}>
                  <XCircle className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'رفض' : 'Reject'}
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lang === 'ar' ? 'طلب إجازة' : 'Request Leave'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label>{lang === 'ar' ? 'الموظف' : 'Employee'}</Label>
              <Select value={form.employeeId} onValueChange={v => setForm({ ...form, employeeId: v })}>
                <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'اختر' : 'Select'} /></SelectTrigger>
                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.code} - {e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{lang === 'ar' ? 'نوع الإجازة' : 'Leave Type'}</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANNUAL">{lang === 'ar' ? 'سنوية' : 'Annual'}</SelectItem>
                  <SelectItem value="SICK">{lang === 'ar' ? 'مرضية' : 'Sick'}</SelectItem>
                  <SelectItem value="CASUAL">{lang === 'ar' ? 'عارضة' : 'Casual'}</SelectItem>
                  <SelectItem value="UNPAID">{lang === 'ar' ? 'بدون أجر' : 'Unpaid'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{lang === 'ar' ? 'من' : 'From'}</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><Label>{lang === 'ar' ? 'إلى' : 'To'}</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div><Label>{lang === 'ar' ? 'السبب' : 'Reason'}</Label><Textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t(lang, 'cancel')}</Button>
            <Button onClick={submit}>{t(lang, 'save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ Advances Tab ============
function AdvancesTab() {
  const { lang, hasPermission } = useApp()
  const [items, setItems] = React.useState<Advance[]>([])
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState({ employeeId: '', amount: 0, type: 'ADVANCE', installments: 1, notes: '' })

  const load = () => {
    Promise.all([fetch('/api/advances').then(r => r.json()), fetch('/api/employees').then(r => r.json())])
      .then(([a, e]) => { setItems(a); setEmployees(e); setLoading(false) })
  }
  React.useEffect(load, [])

  const submit = async () => {
    const res = await fetch('/api/advances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast.success(lang === 'ar' ? 'تمت الإضافة' : 'Added'); setDialogOpen(false); setForm({ employeeId: '', amount: 0, type: 'ADVANCE', installments: 1, notes: '' }); load() }
  }

  const approve = async (id: string, action: 'approve' | 'reject') => {
    await fetch('/api/advances', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) })
    toast.success(action === 'approve' ? (lang === 'ar' ? 'موافقة' : 'Approved') : (lang === 'ar' ? 'رفض' : 'Rejected'))
    load()
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {hasPermission('hr.create') && <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'سلفة جديدة' : 'New Advance'}</Button>}
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-start">{t(lang, 'date')}</th>
                <th className="px-3 py-2 text-start">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                <th className="px-3 py-2 text-end">{t(lang, 'amount')}</th>
                <th className="px-3 py-2 text-center">{lang === 'ar' ? 'النوع' : 'Type'}</th>
                <th className="px-3 py-2 text-center">{lang === 'ar' ? 'أقساط' : 'Installments'}</th>
                <th className="px-3 py-2 text-center">{t(lang, 'status')}</th>
                {hasPermission('hr.edit') && <th className="px-3 py-2 text-center">{lang === 'ar' ? 'إجراء' : 'Action'}</th>}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground"><Banknote className="h-12 w-12 mx-auto mb-2 opacity-30" />{lang === 'ar' ? 'لا توجد سلف' : 'No advances'}</td></tr>
              ) : items.map(a => (
                <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2 text-xs">{formatDate(a.date)}</td>
                  <td className="px-3 py-2 font-medium">{a.employee.name}</td>
                  <td className="px-3 py-2 text-end font-bold">{formatMoney(a.amount)}</td>
                  <td className="px-3 py-2 text-center"><Badge variant="outline">{a.type}</Badge></td>
                  <td className="px-3 py-2 text-center">{a.paidInstallments}/{a.installments}</td>
                  <td className="px-3 py-2 text-center"><Badge variant={statusVariants[a.status] || 'default'}>{a.status}</Badge></td>
                  {hasPermission('hr.edit') && (
                    <td className="px-3 py-2 text-center">
                      {a.status === 'PENDING' && (
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" variant="ghost" className="h-7 text-emerald-600" onClick={() => approve(a.id, 'approve')}><CheckCircle2 className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={() => approve(a.id, 'reject')}><XCircle className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lang === 'ar' ? 'سلفة/قرض جديد' : 'New Advance/Loan'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <div><Label>{lang === 'ar' ? 'الموظف' : 'Employee'}</Label>
              <Select value={form.employeeId} onValueChange={v => setForm({ ...form, employeeId: v })}>
                <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'اختر' : 'Select'} /></SelectTrigger>
                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.code} - {e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t(lang, 'amount')}</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>{lang === 'ar' ? 'النوع' : 'Type'}</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADVANCE">{lang === 'ar' ? 'سلفة' : 'Advance'}</SelectItem>
                    <SelectItem value="LOAN">{lang === 'ar' ? 'قرض' : 'Loan'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>{lang === 'ar' ? 'عدد الأقساط' : 'Installments'}</Label><Input type="number" min={1} value={form.installments} onChange={e => setForm({ ...form, installments: parseInt(e.target.value) || 1 })} /></div>
            <div><Label>{lang === 'ar' ? 'ملاحظات' : 'Notes'}</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>{t(lang, 'cancel')}</Button><Button onClick={submit}>{t(lang, 'save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ Deputations Tab ============
function DeputationsTab() {
  const { lang, hasPermission } = useApp()
  const [items, setItems] = React.useState<Deputation[]>([])
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState({ employeeId: '', destination: '', purpose: '', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], allowance: 0, notes: '' })

  const load = () => {
    Promise.all([fetch('/api/deputations').then(r => r.json()), fetch('/api/employees').then(r => r.json())])
      .then(([d, e]) => { setItems(d); setEmployees(e); setLoading(false) })
  }
  React.useEffect(load, [])

  const submit = async () => {
    const res = await fetch('/api/deputations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast.success(lang === 'ar' ? 'تمت الإضافة' : 'Added'); setDialogOpen(false); setForm({ employeeId: '', destination: '', purpose: '', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], allowance: 0, notes: '' }); load() }
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {hasPermission('hr.create') && <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'مأمورية جديدة' : 'New Deputation'}</Button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground"><Briefcase className="h-12 w-12 mx-auto mb-2 opacity-30" />{lang === 'ar' ? 'لا توجد مأموريات' : 'No deputations'}</div>
        ) : items.map(d => (
          <Card key={d.id} className="p-4 card-lift">
            <div className="flex items-start justify-between mb-2">
              <div><p className="font-bold">{d.employee.name}</p><p className="text-xs text-muted-foreground font-mono">{d.employee.code}</p></div>
              <Badge variant={statusVariants[d.status] || 'default'}>{d.status}</Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'الوجهة' : 'Destination'}</span><span className="font-medium">{d.destination}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'من' : 'From'}</span><span>{formatDate(d.startDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'إلى' : 'To'}</span><span>{formatDate(d.endDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'البدل' : 'Allowance'}</span><span className="font-bold text-primary">{formatMoney(d.allowance)}</span></div>
              {d.purpose && <p className="text-xs text-muted-foreground pt-2 border-t">{d.purpose}</p>}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lang === 'ar' ? 'مأمورية جديدة' : 'New Deputation'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <div><Label>{lang === 'ar' ? 'الموظف' : 'Employee'}</Label>
              <Select value={form.employeeId} onValueChange={v => setForm({ ...form, employeeId: v })}>
                <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'اختر' : 'Select'} /></SelectTrigger>
                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.code} - {e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{lang === 'ar' ? 'الوجهة' : 'Destination'}</Label><Input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} /></div>
            <div><Label>{lang === 'ar' ? 'الغرض' : 'Purpose'}</Label><Textarea value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{lang === 'ar' ? 'من' : 'From'}</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><Label>{lang === 'ar' ? 'إلى' : 'To'}</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div><Label>{lang === 'ar' ? 'البدل' : 'Allowance'}</Label><Input type="number" value={form.allowance} onChange={e => setForm({ ...form, allowance: parseFloat(e.target.value) || 0 })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>{t(lang, 'cancel')}</Button><Button onClick={submit}>{t(lang, 'save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ History Tab ============
function HistoryTab() {
  const { lang } = useApp()
  const [items, setItems] = React.useState<HistoryItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [typeFilter, setTypeFilter] = React.useState('')

  React.useEffect(() => {
    fetch('/api/employee-history').then(r => r.json()).then(d => { setItems(d); setLoading(false) })
  }, [])

  const filtered = items.filter(i => !typeFilter || i.type === typeFilter)

  const typeIcons: Record<string, any> = {
    HIRE: CheckCircle2, PROMOTION: TrendingUp, PENALTY: AlertTriangle, REWARD: Award,
    SALARY_CHANGE: DollarSign, RESIGN: Archive,
  }
  const typeColors: Record<string, string> = {
    HIRE: 'text-emerald-600 bg-emerald-100', PROMOTION: 'text-blue-600 bg-blue-100',
    PENALTY: 'text-red-600 bg-red-100', REWARD: 'text-amber-600 bg-amber-100',
    SALARY_CHANGE: 'text-purple-600 bg-purple-100', RESIGN: 'text-gray-600 bg-gray-100',
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select value={typeFilter || "_all"} onValueChange={v => setTypeFilter(v === "_all" ? "" : v)}>
          <SelectTrigger className="w-40 h-10"><SelectValue placeholder={lang === 'ar' ? 'كل الأنواع' : 'All types'} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{lang === "ar" ? "الكل" : "All"}</SelectItem>
            <SelectItem value="HIRE">{lang === 'ar' ? 'تعيين' : 'Hire'}</SelectItem>
            <SelectItem value="PROMOTION">{lang === 'ar' ? 'ترقية' : 'Promotion'}</SelectItem>
            <SelectItem value="PENALTY">{lang === 'ar' ? 'جزاء' : 'Penalty'}</SelectItem>
            <SelectItem value="REWARD">{lang === 'ar' ? 'مكافأة' : 'Reward'}</SelectItem>
            <SelectItem value="SALARY_CHANGE">{lang === 'ar' ? 'تغيير راتب' : 'Salary Change'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground"><History className="h-12 w-12 mx-auto mb-2 opacity-30" />{lang === 'ar' ? 'لا يوجد سجل' : 'No history'}</Card>
        ) : filtered.map(h => {
          const Icon = typeIcons[h.type] || History
          return (
            <Card key={h.id} className="p-3 flex items-center gap-3 card-lift">
              <div className={`grid h-10 w-10 place-items-center rounded-xl shrink-0 ${typeColors[h.type] || 'text-muted bg-muted'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{h.title}</p>
                  <Badge variant="outline" className="text-xs">{h.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{h.employee.name} • {formatDate(h.date)}</p>
                {h.description && <p className="text-xs text-muted-foreground mt-0.5">{h.description}</p>}
              </div>
              {h.amount !== null && <span className="font-bold text-primary">{formatMoney(h.amount)}</span>}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ============ Payroll Tab ============
function PayrollTab({ canViewSalary }: { canViewSalary: boolean }) {
  const { lang, hasPermission } = useApp()
  const [items, setItems] = React.useState<Payroll[]>([])
  const [loading, setLoading] = React.useState(true)
  const [month, setMonth] = React.useState(new Date().getMonth() + 1)
  const [year, setYear] = React.useState(new Date().getFullYear())
  const [genOpen, setGenOpen] = React.useState(false)
  const [slipItem, setSlipItem] = React.useState<Payroll | null>(null)

  const load = () => {
    fetch(`/api/payroll?month=${month}&year=${year}`).then(r => r.json()).then(d => { setItems(d); setLoading(false) })
  }
  React.useEffect(load, [month, year])

  const generate = async () => {
    const res = await fetch('/api/payroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month, year }) })
    if (res.ok) {
      const data = await res.json()
      toast.success(lang === 'ar' ? `تم إنشاء ${data.length} راتب` : `Generated ${data.length} payrolls`)
      setGenOpen(false); load()
    }
  }

  const pay = async (id: string) => {
    await fetch('/api/payroll', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'pay' }) })
    toast.success(lang === 'ar' ? 'تم الصرف' : 'Paid')
    load()
  }

  const exportSlip = async (p: Payroll) => {
    if (!canViewSalary) return
    await exportPDF({
      title: 'Salary Slip',
      subtitle: `${p.employee.name} - ${month}/${year}`,
      columns: ['Item', 'Amount'],
      rows: [
        ['Basic Salary', formatMoney(p.basicSalary)],
        ['Allowances', formatMoney(p.allowances)],
        ['Incentives', formatMoney(p.incentives)],
        ['Overtime Pay', formatMoney(p.overtimePay)],
        ['Deductions', `- ${formatMoney(p.deductions)}`],
        ['Advances Paid', `- ${formatMoney(p.advancesPaid)}`],
        ['NET SALARY', formatMoney(p.netSalary)],
      ],
      summary: [{ label: 'Net Salary', value: formatMoney(p.netSalary) }],
      filename: `salary-slip-${p.employee.code}-${month}-${year}.pdf`,
    })
    toast.success(lang === 'ar' ? 'تم تصدير كشف الراتب' : 'Slip exported')
  }

  const exportAll = () => {
    exportExcel({
      filename: `payroll-${month}-${year}.xlsx`,
      sheets: [{
        name: 'Payroll',
        columns: ['Code', 'Name', 'Basic', 'Allowances', 'Incentives', 'Overtime', 'Deductions', 'Advances', 'Net', 'Status'],
        rows: items.map(p => [p.employee.code, p.employee.name, p.basicSalary, p.allowances, p.incentives, p.overtimePay, p.deductions, p.advancesPaid, p.netSalary, p.status])
      }]
    })
    toast.success(lang === 'ar' ? 'تم التصدير' : 'Exported')
  }

  if (loading) return <Skeleton className="h-96" />

  const totalNet = items.reduce((s, p) => s + p.netSalary, 0)

  return (
    <div className="space-y-3">
      {!canViewSalary && (
        <Card className="p-3 bg-amber-50 dark:bg-amber-950/20 border-amber-300">
          <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {lang === 'ar' ? 'ليس لديك صلاحية لعرض الرواتب' : 'No permission to view salaries'}
          </p>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Select value={String(month)} onValueChange={v => setMonth(parseInt(v))}>
          <SelectTrigger className="w-32 h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => <SelectItem key={i + 1} value={String(i + 1)}>{new Date(2000, i, 1).toLocaleDateString('ar-EG', { month: 'long' })}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={v => setYear(parseInt(v))}>
          <SelectTrigger className="w-28 h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        {canViewSalary && <Button variant="outline" size="sm" onClick={exportAll}><Download className="h-4 w-4 ml-1" /> Excel</Button>}
        <div className="flex-1" />
        {hasPermission('hr.create') && <Button size="sm" onClick={() => setGenOpen(true)}><Plus className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'إنشاء رواتب' : 'Generate'}</Button>}

      </div>

      {canViewSalary && (
        <Card className="p-4 gradient-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">{lang === 'ar' ? 'إجمالي صافي الرواتب' : 'Total Net Payroll'}</p>
              <p className="text-2xl font-extrabold">{formatMoney(totalNet)}</p>
            </div>
            <DollarSign className="h-10 w-10 opacity-60" />
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-start">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                {canViewSalary && <th className="px-3 py-2 text-end">{lang === 'ar' ? 'أساسي' : 'Basic'}</th>}
                {canViewSalary && <th className="px-3 py-2 text-end">{lang === 'ar' ? 'بدلات' : 'Allow.'}</th>}
                {canViewSalary && <th className="px-3 py-2 text-end">{lang === 'ar' ? 'إضافي' : 'OT'}</th>}
                {canViewSalary && <th className="px-3 py-2 text-end">{lang === 'ar' ? 'خصومات' : 'Deduct.'}</th>}
                {canViewSalary && <th className="px-3 py-2 text-end">{lang === 'ar' ? 'صافي' : 'Net'}</th>}
                <th className="px-3 py-2 text-center">{t(lang, 'status')}</th>
                {hasPermission('hr.edit') && <th className="px-3 py-2 text-center">{lang === 'ar' ? 'إجراء' : 'Action'}</th>}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground"><DollarSign className="h-12 w-12 mx-auto mb-2 opacity-30" />{lang === 'ar' ? 'لا توجد رواتب لهذا الشهر' : 'No payroll this month'}</td></tr>
              ) : items.map(p => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-medium">{p.employee.name}</p><p className="text-xs text-muted-foreground font-mono">{p.employee.code}</p></td>
                  {canViewSalary && <td className="px-3 py-2 text-end">{formatMoney(p.basicSalary)}</td>}
                  {canViewSalary && <td className="px-3 py-2 text-end">{formatMoney(p.allowances)}</td>}
                  {canViewSalary && <td className="px-3 py-2 text-end text-emerald-600">{formatMoney(p.overtimePay)}</td>}
                  {canViewSalary && <td className="px-3 py-2 text-end text-red-600">{formatMoney(p.deductions + p.advancesPaid)}</td>}
                  {canViewSalary && <td className="px-3 py-2 text-end font-bold text-primary">{formatMoney(p.netSalary)}</td>}
                  <td className="px-3 py-2 text-center"><Badge variant={statusVariants[p.status] || 'default'}>{p.status}</Badge></td>
                  {hasPermission('hr.edit') && (
                    <td className="px-3 py-2">
                      <div className="flex gap-1 justify-center">
                        {canViewSalary && <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => exportSlip(p)} title={lang === 'ar' ? 'كشف راتب' : 'Slip'}><FileText className="h-4 w-4" /></Button>}
                        {p.status === 'PENDING' && <Button size="sm" className="h-7" onClick={() => pay(p.id)}>{lang === 'ar' ? 'صرف' : 'Pay'}</Button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lang === 'ar' ? `إنشاء رواتب ${month}/${year}` : `Generate Payroll ${month}/${year}`}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            {lang === 'ar' ? 'سيتم إنشاء رواتب لجميع الموظفين النشطين مع احتساب الساعات الإضافية والسلف المعتمدة.' : 'Will generate payroll for all active employees with overtime and approved advances.'}
          </p>
          <DialogFooter><Button variant="outline" onClick={() => setGenOpen(false)}>{t(lang, 'cancel')}</Button><Button onClick={generate}>{lang === 'ar' ? 'إنشاء' : 'Generate'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============ Reports Tab ============
function ReportsTab() {
  const { lang } = useApp()
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [from, setFrom] = React.useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [to, setTo] = React.useState(new Date().toISOString().split('T')[0])

  const load = () => {
    setLoading(true)
    fetch(`/api/hr-reports?from=${from}&to=${to}`).then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }
  React.useEffect(load, [from, to])

  const exportReport = () => {
    if (!data) return
    exportExcel({
      filename: 'hr-report.xlsx',
      sheets: [
        { name: 'KPIs', columns: ['Metric', 'Value'], rows: Object.entries(data.kpis).map(([k, v]) => [k, String(v)]) },
        { name: 'Daily', columns: ['Date', 'Present', 'Late', 'Absent', 'Leave', 'Overtime'], rows: data.dailyBreakdown.map((d: any) => [d.date, d.present, d.late, d.absent, d.leave, d.overtime]) },
        { name: 'Employees', columns: ['Code', 'Name', 'Department', 'Present', 'Late', 'Absent', 'Leave', 'Overtime', 'Late Min'], rows: data.employeeSummary.map((e: any) => [e.code, e.name, e.department, e.present, e.late, e.absent, e.leave, e.overtimeHours, e.lateMinutes]) },
      ]
    })
    toast.success(lang === 'ar' ? 'تم التصدير' : 'Exported')
  }

  if (loading || !data) return <Skeleton className="h-96" />

  const k = data.kpis
  const kpis = [
    { title: lang === 'ar' ? 'إجمالي الموظفين' : 'Total Employees', value: k.totalEmployees, icon: Users, color: '#0d9488' },
    { title: lang === 'ar' ? 'حاضر' : 'Present', value: k.presentCount, icon: CheckCircle2, color: '#10b981' },
    { title: lang === 'ar' ? 'متأخر' : 'Late', value: k.lateCount, icon: AlertCircle, color: '#f59e0b' },
    { title: lang === 'ar' ? 'غائب' : 'Absent', value: k.absentCount, icon: XCircle, color: '#ef4444' },
    { title: lang === 'ar' ? 'إجازة' : 'Leave', value: k.leaveCount, icon: Plane, color: '#a855f7' },
    { title: lang === 'ar' ? 'ساعات إضافية' : 'Overtime Hours', value: k.totalOvertimeHours, icon: Clock, color: '#3b82f6' },
    { title: lang === 'ar' ? 'دقائق تأخير' : 'Late Minutes', value: k.totalLateMinutes, icon: AlertTriangle, color: '#f97316' },
    { title: lang === 'ar' ? 'إجازات معلقة' : 'Pending Leaves', value: k.pendingLeaves, icon: FileText, color: '#06b6d4' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-10 w-auto" />
        <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-10 w-auto" />
        <Button variant="outline" size="sm" onClick={exportReport}><Download className="h-4 w-4 ml-1" /> {lang === 'ar' ? 'تصدير' : 'Export'}</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <Card key={i} className="relative overflow-hidden p-4 card-lift animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="absolute -top-3 -left-3 h-16 w-16 rounded-full opacity-10" style={{ background: kpi.color }} />
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground truncate">{kpi.title}</p>
                  <p className="text-xl md:text-2xl font-extrabold mt-1 truncate">{kpi.value}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl shrink-0" style={{ background: `${kpi.color}20`, color: kpi.color }}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Daily breakdown table */}
      <Card className="p-4">
        <h3 className="font-bold mb-3">{lang === 'ar' ? 'السجل اليومي' : 'Daily Breakdown'}</h3>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-start">{t(lang, 'date')}</th>
                <th className="px-3 py-2 text-end">{lang === 'ar' ? 'حاضر' : 'Present'}</th>
                <th className="px-3 py-2 text-end">{lang === 'ar' ? 'متأخر' : 'Late'}</th>
                <th className="px-3 py-2 text-end">{lang === 'ar' ? 'غائب' : 'Absent'}</th>
                <th className="px-3 py-2 text-end">{lang === 'ar' ? 'إجازة' : 'Leave'}</th>
                <th className="px-3 py-2 text-end">{lang === 'ar' ? 'إضافي' : 'OT'}</th>
              </tr>
            </thead>
            <tbody>
              {data.dailyBreakdown.map((d: any, i: number) => (
                <tr key={i} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2 text-xs">{formatDate(d.date)}</td>
                  <td className="px-3 py-2 text-end font-medium text-emerald-600">{d.present}</td>
                  <td className="px-3 py-2 text-end font-medium text-amber-600">{d.late}</td>
                  <td className="px-3 py-2 text-end font-medium text-red-600">{d.absent}</td>
                  <td className="px-3 py-2 text-end font-medium text-purple-600">{d.leave}</td>
                  <td className="px-3 py-2 text-end font-medium text-blue-600">{d.overtime.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Employee summary */}
      <Card className="p-4">
        <h3 className="font-bold mb-3">{lang === 'ar' ? 'ملخص الموظفين' : 'Employee Summary'}</h3>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-start">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                <th className="px-3 py-2 text-end">{lang === 'ar' ? 'حاضر' : 'Present'}</th>
                <th className="px-3 py-2 text-end">{lang === 'ar' ? 'متأخر' : 'Late'}</th>
                <th className="px-3 py-2 text-end">{lang === 'ar' ? 'غائب' : 'Absent'}</th>
                <th className="px-3 py-2 text-end">{lang === 'ar' ? 'ساعات عمل' : 'Work Hours'}</th>
                <th className="px-3 py-2 text-end">{lang === 'ar' ? 'إضافي' : 'OT'}</th>
              </tr>
            </thead>
            <tbody>
              {data.employeeSummary.map((e: any, i: number) => (
                <tr key={i} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-medium">{e.name}</p><p className="text-xs text-muted-foreground font-mono">{e.code}</p></td>
                  <td className="px-3 py-2 text-end font-medium text-emerald-600">{e.present}</td>
                  <td className="px-3 py-2 text-end font-medium text-amber-600">{e.late}</td>
                  <td className="px-3 py-2 text-end font-medium text-red-600">{e.absent}</td>
                  <td className="px-3 py-2 text-end">{e.workHours.toFixed(1)}</td>
                  <td className="px-3 py-2 text-end font-medium text-blue-600">{e.overtimeHours.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
