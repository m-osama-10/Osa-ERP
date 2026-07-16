import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { requireAuth, requirePermission, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, 'permissions.view')
  if (auth instanceof NextResponse) return auth
  const users = await db.user.findMany({
    select: { id: true, email: true, name: true, role: true, branchId: true, permissions: true, twoFA: true, isActive: true, lastLogin: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(users.map(u => ({ ...u, permissions: JSON.parse(u.permissions || '[]') })))
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, 'users.manage')
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  if (!body.email || !body.name || !body.password) {
    return NextResponse.json({ error: 'الاسم والبريد وكلمة المرور مطلوبة' }, { status: 400 })
  }

  // Password strength validation
  if (body.password.length < 8) {
    return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 })
  }
  if (!/[A-Z]/.test(body.password)) {
    return NextResponse.json({ error: 'كلمة المرور يجب أن تحتوي على حرف كبير' }, { status: 400 })
  }
  if (!/[0-9]/.test(body.password)) {
    return NextResponse.json({ error: 'كلمة المرور يجب أن تحتوي على رقم' }, { status: 400 })
  }

  const email = body.email.toLowerCase().trim()
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'البريد مستخدم بالفعل' }, { status: 400 })

  const hashed = await bcrypt.hash(body.password, 10)
  const user = await db.user.create({
    data: {
      email,
      name: body.name,
      password: hashed,
      role: body.role || 'USER',
      branchId: body.branchId || null,
      permissions: JSON.stringify(body.permissions || []),
      twoFA: body.twoFA || false,
      isActive: body.isActive ?? true,
    }
  })
  await logAudit(auth, 'إنشاء مستخدم', 'الصلاحيات', `${user.email} - ${user.role}`, req)
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role })
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'users.manage')
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { id, password, ...data } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  // Prevent self-deactivation / self-role-downgrade
  if (id === auth.userId && (data.isActive === false || (data.role && data.role !== 'ADMIN'))) {
    return NextResponse.json({ error: 'لا يمكنك تعديل دورك أو إيقاف حسابك' }, { status: 400 })
  }

  const updateData: any = {
    name: data.name,
    role: data.role,
    branchId: data.branchId || null,
    permissions: JSON.stringify(data.permissions || []),
    twoFA: data.twoFA ?? false,
    isActive: data.isActive ?? true,
  }

  if (password && password.length > 0) {
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: 'كلمة المرور ضعيفة (8 أحرف + حرف كبير + رقم)' }, { status: 400 })
    }
    updateData.password = await bcrypt.hash(password, 10)
  }

  const user = await db.user.update({ where: { id }, data: updateData })
  await logAudit(auth, 'تعديل مستخدم', 'الصلاحيات', `${user.email} - ${user.role}`, req)
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role })
}

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission(req, 'users.manage')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  if (id === auth.userId) {
    return NextResponse.json({ error: 'لا يمكنك حذف حسابك' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { id } })
  if (user?.role === 'ADMIN') {
    const adminCount = await db.user.count({ where: { role: 'ADMIN', isActive: true } })
    if (adminCount <= 1) {
      return NextResponse.json({ error: 'لا يمكن حذف آخر مدير نشط' }, { status: 400 })
    }
  }

  await db.user.delete({ where: { id } })
  await logAudit(auth, 'حذف مستخدم', 'الصلاحيات', `${user?.email}`, req)
  return NextResponse.json({ success: true })
}
