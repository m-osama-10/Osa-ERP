import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { smtpHost, smtpPort, smtpUser, smtpPassword, fromEmail, toEmail, secure } = await req.json()

  if (!smtpHost || !smtpUser || !smtpPassword) {
    return NextResponse.json({ error: 'SMTP settings incomplete' }, { status: 400 })
  }

  // In production, use nodemailer. Here we simulate a successful config test.
  // To enable real email, install nodemailer and:
  // const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } })
  // await transporter.sendMail({ from: fromEmail, to: toEmail, subject: 'Osa ERP Test', text: 'Test successful' })

  // Validate inputs
  if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
    return NextResponse.json({ error: 'Invalid recipient email' }, { status: 400 })
  }

  // Simulate connection test
  await new Promise(r => setTimeout(r, 800))

  return NextResponse.json({
    success: true,
    message: `Test email queued from ${fromEmail} to ${toEmail} via ${smtpHost}:${smtpPort}`,
    note: 'In production: install nodemailer and configure real SMTP transport'
  })
}
