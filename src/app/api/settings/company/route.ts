import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const company = await db.company.findFirst({ include: { branches: true } })
  if (!company) {
    return NextResponse.json({ name: 'Osa ERP', currency: 'EGP' })
  }
  return NextResponse.json({
    id: company.id,
    name: company.name,
    nameEn: company.nameEn,
    taxNo: company.taxNo,
    phone: company.phone,
    email: company.email,
    address: company.address,
    currency: company.currency,
    logo: company.logo,
    branches: company.branches,
  })
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'settings.manage')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()
  const existing = await db.company.findFirst()
  let company
  if (existing) {
    company = await db.company.update({ where: { id: existing.id }, data: {
      name: body.name, nameEn: body.nameEn, taxNo: body.taxNo, phone: body.phone,
      email: body.email, address: body.address, currency: body.currency, logo: body.logo,
    }})
  } else {
    company = await db.company.create({ data: {
      name: body.name, nameEn: body.nameEn, taxNo: body.taxNo, phone: body.phone,
      email: body.email, address: body.address, currency: body.currency, logo: body.logo,
    }})
  }
  return NextResponse.json(company)
}
