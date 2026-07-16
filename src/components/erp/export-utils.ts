'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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

function getDoc(doc: jsPDF, company: CompanyInfo, title: string, subtitle?: string) {
  const pageWidth = doc.internal.pageSize.getWidth()
  // Header band
  doc.setFillColor(13, 148, 136) // primary teal
  doc.rect(0, 0, pageWidth, 28, 'F')

  // Logo box (left)
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, 6, 16, 16, 2, 2, 'F')
  doc.setTextColor(13, 148, 136)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('O', 18, 17, { align: 'center' })

  // Company info (left side after logo)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.text(company.name, 30, 13)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  if (company.taxNo) doc.text(`Tax: ${company.taxNo}`, 30, 19)
  if (company.phone) doc.text(`Tel: ${company.phone}`, 30, 23)

  // Title (right)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(title, pageWidth - 10, 13, { align: 'right' })
  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(subtitle, pageWidth - 10, 20, { align: 'right' })
  }
  doc.text(new Date().toLocaleString('en-GB'), pageWidth - 10, 25, { align: 'right' })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setDrawColor(220, 220, 220)
    doc.line(10, pageHeight - 12, pageWidth - 10, pageHeight - 12)
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(
      `${company.name} | ${company.email || ''} | ${company.address || ''}`,
      pageWidth / 2,
      pageHeight - 7,
      { align: 'center' }
    )
    doc.text(`Page ${i} / ${pageCount}`, pageWidth - 10, pageHeight - 7, { align: 'right' })
  }
  return doc
}

export async function exportPDF(opts: {
  title: string
  subtitle?: string
  columns: string[]
  rows: (string | number)[][]
  summary?: { label: string; value: string }[]
  filename: string
}) {
  const company = await getCompanyInfo()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  getDoc(doc, company, opts.title, opts.subtitle)

  let startY = 38
  if (opts.summary && opts.summary.length > 0) {
    // Summary cards
    const pageWidth = doc.internal.pageSize.getWidth()
    const cardW = (pageWidth - 20 - (opts.summary.length - 1) * 3) / opts.summary.length
    opts.summary.forEach((s, i) => {
      const x = 10 + i * (cardW + 3)
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(x, startY, cardW, 16, 1.5, 1.5, 'F')
      doc.setTextColor(120, 120, 120)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(s.label, x + 3, startY + 5)
      doc.setTextColor(13, 148, 136)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(s.value, x + 3, startY + 13)
    })
    startY += 22
  }

  autoTable(doc, {
    head: [opts.columns],
    body: opts.rows.map(r => r.map(c => String(c))),
    startY,
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 250] },
    margin: { left: 10, right: 10 },
  })

  doc.save(opts.filename)
}

export async function exportInvoicePDF(invoice: any, customer: any, items: any[], company?: CompanyInfo) {
  const comp = company || await getCompanyInfo()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  getDoc(doc, comp, 'INVOICE', invoice.invoiceNo)

  const pageWidth = doc.internal.pageSize.getWidth()
  // Customer box
  doc.setFillColor(248, 250, 250)
  doc.roundedRect(10, 38, pageWidth - 20, 22, 1.5, 1.5, 'F')
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO:', 13, 44)
  doc.setTextColor(20, 20, 20)
  doc.setFontSize(11)
  doc.text(customer.name, 13, 50)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  if (customer.email) doc.text(customer.email, 13, 55)
  if (customer.phone) doc.text(customer.phone, 13, 58)

  // Invoice meta box
  doc.setFillColor(13, 148, 136)
  doc.roundedRect(pageWidth - 70, 38, 60, 22, 1.5, 1.5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text('Invoice No:', pageWidth - 67, 44)
  doc.text('Date:', pageWidth - 67, 49)
  doc.text('Status:', pageWidth - 67, 54)
  doc.setFont('helvetica', 'bold')
  doc.text(invoice.invoiceNo, pageWidth - 30, 44, { align: 'right' })
  doc.text(new Date(invoice.date).toLocaleDateString('en-GB'), pageWidth - 30, 49, { align: 'right' })
  doc.text(invoice.status, pageWidth - 30, 54, { align: 'right' })

  // Items table
  autoTable(doc, {
    head: [['#', 'Item', 'Qty', 'Price', 'Total']],
    body: items.map((it, i) => [i + 1, it.item.name, it.quantity, it.price.toFixed(2), it.total.toFixed(2)]),
    startY: 65,
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [13, 148, 136], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 250] },
    margin: { left: 10, right: 10 },
    columnStyles: { 0: { cellWidth: 12 }, 2: { halign: 'right', cellWidth: 20 }, 3: { halign: 'right', cellWidth: 30 }, 4: { halign: 'right', cellWidth: 30 } },
  })

  // Totals
  // @ts-ignore
  let endY = (doc as any).lastAutoTable.finalY + 8
  const totalX = pageWidth - 70
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', totalX, endY, { align: 'left' })
  doc.text(`${invoice.subtotal.toFixed(2)} ${comp.currency || 'EGP'}`, pageWidth - 13, endY, { align: 'right' })
  endY += 6
  doc.text('VAT (14%):', totalX, endY, { align: 'left' })
  doc.text(`${invoice.taxAmount.toFixed(2)} ${comp.currency || 'EGP'}`, pageWidth - 13, endY, { align: 'right' })
  endY += 6
  doc.setDrawColor(13, 148, 136)
  doc.setLineWidth(0.5)
  doc.line(totalX, endY, pageWidth - 10, endY)
  endY += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(13, 148, 136)
  doc.text('TOTAL:', totalX, endY, { align: 'left' })
  doc.text(`${invoice.total.toFixed(2)} ${comp.currency || 'EGP'}`, pageWidth - 13, endY, { align: 'right' })

  doc.save(`invoice-${invoice.invoiceNo}.pdf`)
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
