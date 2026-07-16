import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const accounts = await db.account.findMany({ include: { parent: true, children: true }, orderBy: { code: 'asc' } })
  return NextResponse.json(accounts)
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'accounting.create')
  if (auth instanceof NextResponse) return auth
  const body = await req.json()

  // Whitelist allowed fields
  const account = await db.account.create({
    data: {
      code: body.code,
      name: body.name,
      nameEn: body.nameEn,
      type: body.type,
      subtype: body.subtype,
      parentId: body.parentId || null,
      balance: body.balance || 0,
      isActive: body.isActive ?? true,
    },
  })
  await logAudit(auth, 'إنشاء حساب', 'المحاسبة', `Account ${body.code} - ${body.name}`, req)
  return NextResponse.json(account)
}
