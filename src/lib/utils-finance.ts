// Currency conversion utilities (pure functions - easy to test)
import type { CurrencyCode } from '@/components/erp/app-context'

type Rates = Record<string, number> // `${from}_${to}` -> rate

const FALLBACK_RATES: Record<string, number> = {
  'EGP_USD': 1 / 48,
  'USD_EGP': 48,
  'EGP_SAR': 1 / 12.8,
  'SAR_EGP': 12.8,
  'USD_SAR': 3.75,
  'SAR_USD': 1 / 3.75,
  'EGP_EGP': 1,
  'USD_USD': 1,
  'SAR_SAR': 1,
}

export function convert(amount: number, from: CurrencyCode, to: CurrencyCode, rates: Rates): number {
  if (from === to) return amount
  const direct = rates[`${from}_${to}`]
  if (direct !== undefined) return amount * direct
  // Via base (EGP)
  const toBase = rates[`${from}_EGP`] ?? FALLBACK_RATES[`${from}_EGP`]
  const fromBase = rates[`EGP_${to}`] ?? FALLBACK_RATES[`EGP_${to}`]
  if (toBase !== undefined && fromBase !== undefined) return amount * toBase * fromBase
  // Fallback to static
  const fallback = FALLBACK_RATES[`${from}_${to}`]
  return fallback ? amount * fallback : amount
}

export function formatMoney(amount: number, currency: CurrencyCode, converted: number): string {
  const symbols: Record<CurrencyCode, string> = { EGP: 'ج.م', USD: '$', SAR: 'ر.س' }
  const locales: Record<CurrencyCode, string> = { EGP: 'ar-EG', USD: 'en-US', SAR: 'ar-SA' }
  const num = new Intl.NumberFormat(locales[currency], { maximumFractionDigits: 2 }).format(converted)
  return currency === 'USD' ? `$${num}` : `${num} ${symbols[currency]}`
}

// P&L calculations (pure)
export function calcGrossProfit(revenue: number, cogs: number): number {
  return revenue - cogs
}

export function calcGrossMargin(grossProfit: number, revenue: number): number {
  if (revenue === 0) return 0
  return (grossProfit / revenue) * 100
}

export function calcNetProfit(grossProfit: number, operatingExpenses: number): number {
  return grossProfit - operatingExpenses
}

export function calcNetMargin(netProfit: number, revenue: number): number {
  if (revenue === 0) return 0
  return (netProfit / revenue) * 100
}

export function calcDelta(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// Invoice calculations
export function calcInvoiceTotals(items: { quantity: number; price: number; discount?: number }[], taxRate: number, globalDiscount: number = 0) {
  const subtotal = items.reduce((s, it) => s + (it.quantity * it.price - (it.discount || 0)), 0)
  const taxableAmount = subtotal - globalDiscount
  const taxAmount = taxableAmount * (taxRate / 100)
  const total = taxableAmount + taxAmount
  return { subtotal, taxableAmount, taxAmount, total }
}

// Permission helpers
export function hasPermission(userPerms: string[], role: string, required: string): boolean {
  if (role === 'ADMIN') return true
  return userPerms.includes(required)
}

// Validation
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (password.length < 8) errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  if (!/[A-Z]/.test(password)) errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل')
  if (!/[0-9]/.test(password)) errors.push('يجب أن تحتوي على رقم واحد على الأقل')
  return { valid: errors.length === 0, errors }
}

// Pagination
export function paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; totalPages: number; total: number } {
  const total = items.length
  const totalPages = Math.ceil(total / pageSize) || 1
  const start = (page - 1) * pageSize
  return { data: items.slice(start, start + pageSize), totalPages, total }
}

// Date helpers
export function formatDate(date: Date | string, locale: string = 'ar-EG'): string {
  return new Date(date).toLocaleDateString(locale)
}

export function dateRange(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / 86400000)
}

export function presetToRange(preset: 'today' | 'week' | 'month' | 'quarter' | 'year'): { from: Date; to: Date } {
  const to = new Date()
  const from = new Date()
  switch (preset) {
    case 'today': break
    case 'week': from.setDate(from.getDate() - 7); break
    case 'month': from.setDate(from.getDate() - 30); break
    case 'quarter': from.setDate(from.getDate() - 90); break
    case 'year': from.setDate(from.getDate() - 365); break
  }
  return { from, to }
}
