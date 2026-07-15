import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const accounts = await db.account.findMany({ include: { parent: true, children: true }, orderBy: { code: 'asc' } })
  return NextResponse.json(accounts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
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
  return NextResponse.json(account)
}
