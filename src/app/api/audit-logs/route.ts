import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requirePermission } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, 'permissions.view')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '100'), 1), 500)
  const userId = searchParams.get('userId')
  const moduleFilter = searchParams.get('module')

  const where: any = {}
  if (userId) where.userId = userId
  if (moduleFilter) where.module = moduleFilter

  const logs = await db.auditLog.findMany({
    where,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json(logs)
}
