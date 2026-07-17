import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { requireAuth, logAudit } from '@/lib/auth'

// POST /api/auth/change-password
// Body: { currentPassword, newPassword }
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'كلمة المرور الحالية والجديدة مطلوبتان' }, { status: 400 })
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 })
  }
  if (!/[A-Z]/.test(newPassword)) {
    return NextResponse.json({ error: 'كلمة المرور يجب أن تحتوي على حرف كبير' }, { status: 400 })
  }
  if (!/[0-9]/.test(newPassword)) {
    return NextResponse.json({ error: 'كلمة المرور يجب أن تحتوي على رقم' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { id: auth.userId } })
  if (!user) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })

  // Verify current password
  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) {
    return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 })
  }

  // Update password
  const hashed = await bcrypt.hash(newPassword, 10)
  await db.user.update({ where: { id: user.id }, data: { password: hashed } })

  await logAudit(auth, 'تغيير كلمة المرور', 'النظام', `User: ${user.email}`, req)

  return NextResponse.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' })
}
