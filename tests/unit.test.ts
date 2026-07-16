import { describe, it, expect } from 'vitest'
import {
  convert, formatMoney,
  calcGrossProfit, calcGrossMargin, calcNetProfit, calcNetMargin, calcDelta,
  calcInvoiceTotals, hasPermission,
  validateEmail, validatePassword,
  paginate, presetToRange, dateRange
} from '../src/lib/utils-finance'

describe('Currency conversion', () => {
  const rates = {
    'EGP_USD': 1 / 48, 'USD_EGP': 48,
    'EGP_SAR': 1 / 12.8, 'SAR_EGP': 12.8,
    'USD_SAR': 3.75, 'SAR_USD': 1 / 3.75,
  }

  it('returns same amount for same currency', () => {
    expect(convert(100, 'EGP', 'EGP', rates)).toBe(100)
  })

  it('converts EGP to USD correctly', () => {
    expect(convert(4800, 'EGP', 'USD', rates)).toBeCloseTo(100, 1)
  })

  it('converts USD to EGP correctly', () => {
    expect(convert(100, 'USD', 'EGP', rates)).toBe(4800)
  })

  it('uses fallback when rate missing', () => {
    expect(convert(100, 'USD', 'EGP', {})).toBe(4800)
  })

  it('formats money with correct symbol', () => {
    const formatted = formatMoney(100, 'EGP', 4800)
    expect(formatted).toContain('ج.م')
    // Arabic numerals may differ, just check length is reasonable
    expect(formatted.length).toBeGreaterThan(5)
  })

  it('formats USD with $ prefix', () => {
    expect(formatMoney(100, 'USD', 100)).toMatch(/^\$/)
  })
})

describe('P&L calculations', () => {
  it('calculates gross profit', () => {
    expect(calcGrossProfit(100000, 60000)).toBe(40000)
  })

  it('calculates gross margin', () => {
    expect(calcGrossMargin(40000, 100000)).toBe(40)
  })

  it('handles zero revenue for margin', () => {
    expect(calcGrossMargin(0, 0)).toBe(0)
  })

  it('calculates net profit', () => {
    expect(calcNetProfit(40000, 15000)).toBe(25000)
  })

  it('calculates net margin', () => {
    expect(calcNetMargin(25000, 100000)).toBe(25)
  })

  it('calculates delta percentage', () => {
    expect(calcDelta(120, 100)).toBe(20)
    expect(calcDelta(80, 100)).toBe(-20)
  })

  it('handles zero previous for delta', () => {
    expect(calcDelta(100, 0)).toBe(0)
  })
})

describe('Invoice calculations', () => {
  it('calculates totals with tax', () => {
    const items = [{ quantity: 2, price: 100 }, { quantity: 1, price: 50 }]
    const result = calcInvoiceTotals(items, 14)
    expect(result.subtotal).toBe(250)
    expect(result.taxAmount).toBeCloseTo(35, 1)
    expect(result.total).toBeCloseTo(285, 1)
  })

  it('applies global discount', () => {
    const items = [{ quantity: 1, price: 100 }]
    const result = calcInvoiceTotals(items, 14, 20)
    expect(result.taxableAmount).toBe(80)
    expect(result.taxAmount).toBeCloseTo(11.2, 1)
    expect(result.total).toBeCloseTo(91.2, 1)
  })

  it('handles item-level discount', () => {
    const items = [{ quantity: 2, price: 100, discount: 20 }]
    const result = calcInvoiceTotals(items, 14)
    expect(result.subtotal).toBe(180)
  })
})

describe('Permissions', () => {
  it('allows admin everything', () => {
    expect(hasPermission([], 'ADMIN', 'anything.here')).toBe(true)
  })

  it('checks user permissions', () => {
    expect(hasPermission(['dashboard.view'], 'USER', 'dashboard.view')).toBe(true)
    expect(hasPermission(['dashboard.view'], 'USER', 'accounting.view')).toBe(false)
  })
})

describe('Validation', () => {
  it('validates emails', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('user@.com')).toBe(false)
  })

  it('validates password strength', () => {
    expect(validatePassword('Short1').valid).toBe(false)
    expect(validatePassword('alllowercase1').valid).toBe(false)
    expect(validatePassword('NoNumbersHere!').valid).toBe(false)
    expect(validatePassword('StrongPass1').valid).toBe(true)
  })
})

describe('Pagination', () => {
  it('paginates arrays', () => {
    const items = Array.from({ length: 25 }, (_, i) => i)
    const result = paginate(items, 1, 10)
    expect(result.data).toHaveLength(10)
    expect(result.totalPages).toBe(3)
    expect(result.total).toBe(25)
  })

  it('handles empty array', () => {
    const result = paginate([], 1, 10)
    expect(result.data).toHaveLength(0)
    expect(result.totalPages).toBe(1)
  })

  it('handles last page partial', () => {
    const items = Array.from({ length: 25 }, (_, i) => i)
    const result = paginate(items, 3, 10)
    expect(result.data).toHaveLength(5)
  })
})

describe('Date utilities', () => {
  it('calculates date range in days', () => {
    const from = new Date('2024-01-01')
    const to = new Date('2024-01-31')
    expect(dateRange(from, to)).toBe(30)
  })

  it('converts preset to range', () => {
    const { from, to } = presetToRange('month')
    const days = dateRange(from, to)
    expect(days).toBeGreaterThanOrEqual(29)
    expect(days).toBeLessThanOrEqual(31)
  })

  it('today preset returns same day', () => {
    const { from, to } = presetToRange('today')
    expect(dateRange(from, to)).toBe(0)
  })
})
