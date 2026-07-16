import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requirePermission, logAudit } from '@/lib/auth'

// POST /api/employees/import — body: { employees: [{name, phone, email, position, department, basicSalary, ...}] }
export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'hr.create')
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { employees } = body

  if (!Array.isArray(employees) || employees.length === 0) {
    return NextResponse.json({ error: 'لا توجد بيانات للاستيراد' }, { status: 400 })
  }

  const results = { success: 0, failed: 0, errors: [] as string[] }
  const existingCodes = new Set((await db.employee.findMany({ select: { code: true } })).map(e => e.code))
  const existingEmails = new Set((await db.employee.findMany({ select: { email: true } })).map(e => e.email).filter(Boolean))
  const baseCount = await db.employee.count()

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i]
    try {
      // Validation
      if (!emp.name || typeof emp.name !== 'string' || emp.name.trim().length < 2) {
        results.failed++
        results.errors.push(`صف ${i + 2}: الاسم مطلوب`)
        continue
      }
      if (emp.email && existingEmails.has(emp.email.toLowerCase().trim())) {
        results.failed++
        results.errors.push(`صف ${i + 2}: البريد مستخدم`)
        continue
      }

      const code = emp.code && !existingCodes.has(emp.code) ? emp.code : `EMP-${String(baseCount + results.success + 1).padStart(3, '0')}`
      existingCodes.add(code)

      const created = await db.employee.create({
        data: {
          code,
          name: emp.name.trim(),
          nameEn: emp.nameEn || null,
          nationalId: emp.nationalId || null,
          phone: emp.phone || null,
          email: emp.email?.toLowerCase().trim() || null,
          position: emp.position || null,
          department: emp.department || null,
          hireDate: emp.hireDate ? new Date(emp.hireDate) : new Date(),
          basicSalary: parseFloat(emp.basicSalary) || 0,
          allowances: parseFloat(emp.allowances) || 0,
          incentives: parseFloat(emp.incentives) || 0,
          deductions: parseFloat(emp.deductions) || 0,
          bankAccount: emp.bankAccount || null,
          status: 'ACTIVE',
        }
      })

      await db.employeeHistory.create({
        data: {
          employeeId: created.id,
          type: 'HIRE',
          title: 'استيراد موظف',
          description: `تم استيراد الموظف ${created.name} من ملف`,
        }
      })

      if (emp.email) existingEmails.add(emp.email.toLowerCase().trim())
      results.success++
    } catch (e: any) {
      results.failed++
      results.errors.push(`صف ${i + 2}: ${e.message || 'خطأ غير معروف'}`)
    }
  }

  await logAudit(auth, 'استيراد موظفين', 'الموارد البشرية', `Success: ${results.success}, Failed: ${results.failed}`, req)
  return NextResponse.json(results)
}
