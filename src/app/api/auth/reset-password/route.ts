import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST /api/auth/reset-password
// Body: { token, newPassword }
export async function POST(req: NextRequest) {
  const { token, newPassword } = await req.json()

  if (!token || !newPassword) {
    return NextResponse.json({ error: 'الرمز وكلمة المرور مطلوبان' }, { status: 400 })
  }

  // Validate password strength
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 })
  }
  if (!/[A-Z]/.test(newPassword)) {
    return NextResponse.json({ error: 'كلمة المرور يجب أن تحتوي على حرف كبير' }, { status: 400 })
  }
  if (!/[0-9]/.test(newPassword)) {
    return NextResponse.json({ error: 'كلمة المرور يجب أن تحتوي على رقم' }, { status: 400 })
  }

  // Look up token
  const setting = await db.setting.findUnique({ where: { key: `reset_${token}` } })
  if (!setting) {
    return NextResponse.json({ error: 'رمز غير صالح أو منتهي' }, { status: 400 })
  }

  const data = JSON.parse(setting.value)
  if (new Date(data.expires) < new Date()) {
    await db.setting.delete({ where: { key: `reset_${token}` } })
    return NextResponse.json({ error: 'انتهت صلاحية الرمز' }, { status: 400 })
  }

  // Update password
  const hashed = await bcrypt.hash(newPassword, 10)
  await db.user.update({ where: { id: data.userId }, data: { password: hashed } })

  // Delete token
  await db.setting.delete({ where: { key: `reset_${token}` } })

  return NextResponse.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' })
}
