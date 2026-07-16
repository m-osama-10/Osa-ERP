import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requirePermission } from '@/lib/auth'

const SETTING_KEY = 'system'

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

async function loadSettings() {
  const row = await db.setting.findUnique({ where: { key: SETTING_KEY } })
  if (!row) return defaults
  try {
    const saved = JSON.parse(row.value)
    return {
      taxRate: saved.taxRate ?? defaults.taxRate,
      taxNumber: saved.taxNumber ?? defaults.taxNumber,
      currency: saved.currency ?? defaults.currency,
      email: { ...defaults.email, ...(saved.email || {}) },
      printer: { ...defaults.printer, ...(saved.printer || {}) },
      invoice: { ...defaults.invoice, ...(saved.invoice || {}) },
      notifications: { ...defaults.notifications, ...(saved.notifications || {}) },
    }
  } catch {
    return defaults
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const settings = await loadSettings()
  // Mask password for security
  const masked = {
    ...settings,
    email: { ...settings.email, smtpPassword: settings.email.smtpPassword ? '••••••••' : '' }
  }
  return NextResponse.json(masked)
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, 'settings.manage')
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const current = await loadSettings()

  // Don't overwrite password with the mask
  const newPassword = body.email?.smtpPassword && !body.email.smtpPassword.includes('•')
    ? body.email.smtpPassword
    : current.email.smtpPassword

  const updated = {
    taxRate: body.taxRate ?? current.taxRate,
    taxNumber: body.taxNumber ?? current.taxNumber,
    currency: body.currency ?? current.currency,
    email: body.email ? { ...current.email, ...body.email, smtpPassword: newPassword } : current.email,
    printer: body.printer ? { ...current.printer, ...body.printer } : current.printer,
    invoice: body.invoice ? { ...current.invoice, ...body.invoice } : current.invoice,
    notifications: body.notifications ? { ...current.notifications, ...body.notifications } : current.notifications,
  }

  // Upsert to DB (persists across restarts!)
  const existing = await db.setting.findUnique({ where: { key: SETTING_KEY } })
  if (existing) {
    await db.setting.update({ where: { key: SETTING_KEY }, data: { value: JSON.stringify(updated) } })
  } else {
    await db.setting.create({ data: { key: SETTING_KEY, value: JSON.stringify(updated) } })
  }

  return NextResponse.json({
    ...updated,
    email: { ...updated.email, smtpPassword: updated.email.smtpPassword ? '••••••••' : '' }
  })
}
