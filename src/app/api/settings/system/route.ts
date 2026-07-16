import { NextRequest, NextResponse } from 'next/server'

// System settings stored in env-like config (in production: DB or env vars)
const defaults = {
  taxRate: 14,
  taxNumber: '',
  currency: 'EGP',
  email: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Osa ERP',
    secure: false,
  },
  printer: {
    paperSize: 'A4',
    orientation: 'portrait',
    copies: 1,
    showLogo: true,
    showSignature: false,
  },
  invoice: {
    prefix: 'INV-',
    startNumber: 1000,
    footerText: 'شكراً لتعاملكم معنا',
    termsConditions: 'البضاعة المباعة لا ترد ولا تستبدل بعد 7 أيام',
    showQR: true,
  },
  notifications: {
    lowStockThreshold: 10,
    invoiceDueDays: 30,
    enableEmailAlerts: false,
    enableInAppAlerts: true,
  },
}

let current = { ...defaults }

export async function GET() {
  return NextResponse.json(current)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  current = { ...current, ...body }
  // Deep merge nested objects
  if (body.email) current.email = { ...current.email, ...body.email }
  if (body.printer) current.printer = { ...current.printer, ...body.printer }
  if (body.invoice) current.invoice = { ...current.invoice, ...body.invoice }
  if (body.notifications) current.notifications = { ...current.notifications, ...body.notifications }
  return NextResponse.json(current)
}
