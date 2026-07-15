import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const employees = await db.employee.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(employees)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const count = await db.employee.count()
  const emp = await db.employee.create({
    data: {
      code: body.code || `EMP-${String(count + 1).padStart(3, '0')}`,
      name: body.name,
      nameEn: body.nameEn,
      nationalId: body.nationalId,
      phone: body.phone,
      email: body.email,
      position: body.position,
      department: body.department,
      hireDate: body.hireDate ? new Date(body.hireDate) : new Date(),
      basicSalary: body.basicSalary || 0,
      allowances: body.allowances || 0,
      status: 'ACTIVE',
    },
  })
  return NextResponse.json(emp)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const emp = await db.employee.update({ where: { id }, data })
  return NextResponse.json(emp)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.employee.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
