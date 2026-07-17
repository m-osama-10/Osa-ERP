'use client'

import * as XLSX from 'xlsx'

type CompanyInfo = {
  name: string
  nameEn?: string
  taxNo?: string
  phone?: string
  email?: string
  address?: string
  currency?: string
  logo?: string
}

const STORAGE_KEY = 'osa-company-info'

export async function getCompanyInfo(): Promise<CompanyInfo> {
  if (typeof window === 'undefined') return { name: 'Osa ERP' }
  try {
    const cached = sessionStorage.getItem(STORAGE_KEY)
    if (cached) return JSON.parse(cached)
    const res = await fetch('/api/settings/company')
    const data = await res.json()
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return data
  } catch {
    return { name: 'Osa ERP' }
  }
}

// Generate a print-ready HTML page and open it in a new window for printing/PDF
export async function exportPDF(opts: {
  title: string
  subtitle?: string
  columns: string[]
  rows: (string | number)[][]
  summary?: { label: string; value: string }[]
  filename: string
}) {
  const company = await getCompanyInfo()
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) {
    alert('الرجاء السماح بالنوافذ المنبثقة لتصدير PDF')
    return
  }

  const tableRows = opts.rows.map((row, i) =>
    `<tr style="${i % 2 === 0 ? '' : 'background: #f8f9fa;'}">
      ${row.map(cell => `<td style="padding: 8px 12px; border: 1px solid #e0e0e0; text-align: ${typeof cell === 'number' ? 'left' : 'right'};">${cell}</td>`).join('')}
    </tr>`
  ).join('')

  const summaryCards = opts.summary?.map(s => `
    <div style="flex: 1; padding: 12px; background: #f0fdfa; border-radius: 8px; margin: 0 4px;">
      <div style="font-size: 11px; color: #666;">${s.label}</div>
      <div style="font-size: 16px; font-weight: bold; color: #0d9488;">${s.value}</div>
    </div>
  `).join('') || ''

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>${opts.title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
  * { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; box-sizing: border-box; }
  body { margin: 0; padding: 20px; color: #1a1a1a; }
  .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 2px solid #0d9488; margin-bottom: 20px; }
  .company-name { font-size: 22px; font-weight: 700; color: #0d9488; }
  .company-info { font-size: 11px; color: #666; text-align: left; }
  .report-title { font-size: 18px; font-weight: 700; margin: 16px 0 4px; }
  .report-subtitle { font-size: 12px; color: #666; margin-bottom: 16px; }
  .summary { display: flex; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #0d9488; color: white; padding: 10px 12px; text-align: right; font-weight: 600; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 10px; color: #999; text-align: center; }
  @media print { body { padding: 10px; } .no-print { display: none; } }
  .print-btn { position: fixed; bottom: 20px; right: 20px; padding: 12px 24px; background: #0d9488; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
  .print-btn:hover { background: #0a7770; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">${company.name}</div>
      ${company.nameEn ? `<div style="font-size:12px;color:#666;">${company.nameEn}</div>` : ''}
    </div>
    <div class="company-info">
      ${company.taxNo ? `<div>الرقم الضريبي: ${company.taxNo}</div>` : ''}
      ${company.phone ? `<div>هاتف: ${company.phone}</div>` : ''}
      ${company.email ? `<div>بريد: ${company.email}</div>` : ''}
      ${company.address ? `<div>عنوان: ${company.address}</div>` : ''}
    </div>
  </div>
  <div class="report-title">${opts.title}</div>
  ${opts.subtitle ? `<div class="report-subtitle">${opts.subtitle}</div>` : ''}
  ${summaryCards ? `<div class="summary">${summaryCards}</div>` : ''}
  <table>
    <thead><tr>${opts.columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">
    ${company.name} | ${company.email || ''} | ${company.address || ''}<br>
    تم الإنشاء: ${new Date().toLocaleString('ar-EG')} | صفحة 1 من 1
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
</body>
</html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}

export async function exportInvoicePDF(invoice: any, customer: any, items: any[], company?: CompanyInfo) {
  const comp = company || await getCompanyInfo()
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) {
    alert('الرجاء السماح بالنوافذ المنبثقة')
    return
  }

  const itemRows = items.map((it, i) => `
    <tr style="${i % 2 === 0 ? '' : 'background: #f8f9fa;'}">
      <td style="text-align:center;padding:8px;border:1px solid #e0e0e0;">${i + 1}</td>
      <td style="padding:8px;border:1px solid #e0e0e0;">${it.item?.name || it.item?.nameEn || ''}</td>
      <td style="text-align:center;padding:8px;border:1px solid #e0e0e0;">${it.quantity}</td>
      <td style="text-align:left;padding:8px;border:1px solid #e0e0e0;">${it.price.toFixed(2)}</td>
      <td style="text-align:left;padding:8px;border:1px solid #e0e0e0;">${it.total.toFixed(2)}</td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>فاتورة ${invoice.invoiceNo}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
  * { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; box-sizing: border-box; }
  body { margin: 0; padding: 20px; color: #1a1a1a; }
  .header { display: flex; justify-content: space-between; padding-bottom: 16px; border-bottom: 2px solid #0d9488; margin-bottom: 20px; }
  .company-name { font-size: 22px; font-weight: 800; color: #0d9488; }
  .info-box { background: #f8f9fa; padding: 12px; border-radius: 8px; margin: 8px 0; font-size: 13px; }
  .info-box div { margin: 4px 0; }
  .totals { margin-top: 16px; margin-right: auto; width: 300px; }
  .totals div { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; font-size: 13px; }
  .totals .net { font-weight: 800; font-size: 16px; color: #0d9488; border-bottom: 2px solid #0d9488; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
  th { background: #0d9488; color: white; padding: 10px; text-align: right; }
  .footer { margin-top: 32px; text-align: center; font-size: 10px; color: #999; }
  .print-btn { position: fixed; bottom: 20px; right: 20px; padding: 12px 24px; background: #0d9488; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">${comp.name}</div>
      ${comp.nameEn ? `<div style="font-size:12px;color:#666;">${comp.nameEn}</div>` : ''}
      ${comp.taxNo ? `<div style="font-size:11px;color:#666;">رقم ضريبي: ${comp.taxNo}</div>` : ''}
    </div>
    <div style="text-align:left;">
      <div style="font-size:20px;font-weight:800;color:#0d9488;">فاتورة</div>
      <div style="font-size:14px;font-weight:600;">${invoice.invoiceNo}</div>
      <div style="font-size:11px;color:#666;">${new Date(invoice.date).toLocaleDateString('ar-EG')}</div>
      <div style="margin-top:8px;padding:4px 12px;border-radius:4px;background:${invoice.status === 'PAID' ? '#dcfce7' : '#fee2e2'};color:${invoice.status === 'PAID' ? '#16a34a' : '#dc2626'};font-size:11px;font-weight:600;display:inline-block;">${invoice.status}</div>
    </div>
  </div>
  <div style="display:flex;gap:16px;">
    <div class="info-box" style="flex:1;">
      <div style="font-weight:700;margin-bottom:4px;">العميل</div>
      <div>${customer.name}</div>
      ${customer.phone ? `<div style="color:#666;font-size:11px;">${customer.phone}</div>` : ''}
      ${customer.email ? `<div style="color:#666;font-size:11px;">${customer.email}</div>` : ''}
    </div>
    <div class="info-box" style="flex:1;">
      <div style="font-weight:700;margin-bottom:4px;">معلومات الفاتورة</div>
      <div>التاريخ: ${new Date(invoice.date).toLocaleDateString('ar-EG')}</div>
      ${invoice.dueDate ? `<div>الاستحقاق: ${new Date(invoice.dueDate).toLocaleDateString('ar-EG')}</div>` : ''}
    </div>
  </div>
  <table>
    <thead><tr><th style="text-align:center;width:40px;">#</th><th>الصنف</th><th style="text-align:center;width:60px;">الكمية</th><th style="text-align:left;width:100px;">السعر</th><th style="text-align:left;width:100px;">الإجمالي</th></tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="totals">
    <div><span>المجموع الفرعي</span><span>${invoice.subtotal.toFixed(2)} ${comp.currency || 'ج.م'}</span></div>
    ${invoice.discount > 0 ? `<div style="color:#dc2626;"><span>الخصم</span><span>- ${invoice.discount.toFixed(2)}</span></div>` : ''}
    <div><span>ضريبة (${invoice.taxRate}%)</span><span>${invoice.taxAmount.toFixed(2)}</span></div>
    <div class="net"><span>الإجمالي</span><span>${invoice.total.toFixed(2)} ${comp.currency || 'ج.م'}</span></div>
    ${invoice.paidAmount > 0 ? `<div><span>المدفوع</span><span>${invoice.paidAmount.toFixed(2)}</span></div>` : ''}
    ${invoice.total - invoice.paidAmount > 0 ? `<div style="color:#dc2626;"><span>المتبقي</span><span>${(invoice.total - invoice.paidAmount).toFixed(2)}</span></div>` : ''}
  </div>
  <div class="footer">
    ${comp.name} | ${comp.phone || ''} | ${comp.email || ''} | ${comp.address || ''}<br>
    شكراً لتعاملكم معنا
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
</body>
</html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}

export function exportExcel(opts: {
  filename: string
  sheets: { name: string; columns: string[]; rows: (string | number)[][] }[]
}) {
  const wb = XLSX.utils.book_new()
  for (const sheet of opts.sheets) {
    const ws = XLSX.utils.aoa_to_sheet([sheet.columns, ...sheet.rows])
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 30))
  }
  XLSX.writeFile(wb, opts.filename)
}
