import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

// POST /api/auth/forgot-password
// Body: { email }
// Returns: { success: true, message: "إذا كان البريد موجوداً، سيتم إرسال رابط إعادة التعيين" }
export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })

  // Always return success (don't reveal if email exists)
  if (!user || !user.isActive) {
    return NextResponse.json({ success: true, message: 'إذا كان البريد موجوداً، سيتم إرسال رابط إعادة التعيين' })
  }

  // Generate reset token (valid for 1 hour)
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 3600000) // 1 hour

  // Store token in Setting table (key: `reset_${token}`)
  await db.setting.upsert({
    where: { key: `reset_${token}` },
    update: { value: JSON.stringify({ userId: user.id, email: user.email, expires: expires.toISOString() }) },
    create: { key: `reset_${token}`, value: JSON.stringify({ userId: user.id, email: user.email, expires: expires.toISOString() }) },
  })

  // In production: send email with link `${process.env.NEXT_PUBLIC_APP_URL}/?reset=${token}`
  // For now: log it
  console.log(`Password reset link: /?reset=${token}`)

  return NextResponse.json({ success: true, message: 'تم إرسال رابط إعادة التعيين إلى بريدك' })
}
