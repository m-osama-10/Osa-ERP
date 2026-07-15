// Osa ERP - Seed Data
import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding Osa ERP...')

  // 1. Company & Branch
  const company = await db.company.create({
    data: {
      name: 'شركة أوسا التجارية',
      nameEn: 'Osa Trading Co.',
      taxNo: '300000000000003',
      phone: '+966 11 234 5678',
      email: 'info@osa-erp.com',
      address: 'الرياض، المملكة العربية السعودية',
      currency: 'SAR',
    },
  })

  const branch1 = await db.branch.create({ data: { companyId: company.id, name: 'الفرع الرئيسي', code: 'BR-01', address: 'الرياض - حي العليا', phone: '0112345678' } })
  const branch2 = await db.branch.create({ data: { companyId: company.id, name: 'فرع جدة', code: 'BR-02', address: 'جدة - حي الروضة', phone: '0126834590' } })

  // 2. Chart of Accounts
  const accounts = [
    { code: '1000', name: 'الأصول', nameEn: 'Assets', type: 'ASSET' },
    { code: '1100', name: 'الأصول المتداولة', nameEn: 'Current Assets', type: 'ASSET', parent: '1000' },
    { code: '1101', name: 'النقدية والبنوك', nameEn: 'Cash & Banks', type: 'ASSET', parent: '1100' },
    { code: '1102', name: 'الذمم المدينة', nameEn: 'Accounts Receivable', type: 'ASSET', parent: '1100' },
    { code: '1103', name: 'المخزون', nameEn: 'Inventory', type: 'ASSET', parent: '1100' },
    { code: '1200', name: 'الأصول الثابتة', nameEn: 'Fixed Assets', type: 'ASSET', parent: '1000' },
    { code: '1201', name: 'المباني', nameEn: 'Buildings', type: 'ASSET', parent: '1200' },
    { code: '1202', name: 'المعدات', nameEn: 'Equipment', type: 'ASSET', parent: '1200' },
    { code: '2000', name: 'الخصوم', nameEn: 'Liabilities', type: 'LIABILITY' },
    { code: '2100', name: 'الخصوم المتداولة', nameEn: 'Current Liabilities', type: 'LIABILITY', parent: '2000' },
    { code: '2101', name: 'الذمم الدائنة', nameEn: 'Accounts Payable', type: 'LIABILITY', parent: '2100' },
    { code: '2102', name: 'ضريبة القيمة المضافة', nameEn: 'VAT Payable', type: 'LIABILITY', parent: '2100' },
    { code: '2200', name: 'القروض طويلة الأجل', nameEn: 'Long-term Loans', type: 'LIABILITY', parent: '2000' },
    { code: '3000', name: 'حقوق الملكية', nameEn: 'Equity', type: 'EQUITY' },
    { code: '3100', name: 'رأس المال', nameEn: 'Capital', type: 'EQUITY', parent: '3000' },
    { code: '3200', name: 'الأرباح المحتجزة', nameEn: 'Retained Earnings', type: 'EQUITY', parent: '3000' },
    { code: '4000', name: 'الإيرادات', nameEn: 'Revenue', type: 'REVENUE' },
    { code: '4100', name: 'مبيعات', nameEn: 'Sales', type: 'REVENUE', parent: '4000' },
    { code: '4200', name: 'إيرادات أخرى', nameEn: 'Other Income', type: 'REVENUE', parent: '4000' },
    { code: '5000', name: 'المصروفات', nameEn: 'Expenses', type: 'EXPENSE' },
    { code: '5100', name: 'تكلفة البضاعة المباعة', nameEn: 'COGS', type: 'EXPENSE', parent: '5000' },
    { code: '5200', name: 'الرواتب والأجور', nameEn: 'Salaries', type: 'EXPENSE', parent: '5000' },
    { code: '5300', name: 'الإيجارات', nameEn: 'Rent', type: 'EXPENSE', parent: '5000' },
    { code: '5400', name: 'المرافق', nameEn: 'Utilities', type: 'EXPENSE', parent: '5000' },
    { code: '5500', name: 'التسويق', nameEn: 'Marketing', type: 'EXPENSE', parent: '5000' },
  ]

  const accountMap: Record<string, string> = {}
  for (const a of accounts) {
    const acc = await db.account.create({
      data: {
        code: a.code,
        name: a.name,
        nameEn: a.nameEn,
        type: a.type,
        parentId: a.parent ? accountMap[a.parent] : null,
        balance: ['1101', '1102', '1103', '1201', '1202', '2101', '2102', '3100', '4100', '5200', '5300', '5400'].includes(a.code) ? Math.floor(Math.random() * 500000) + 50000 : 0,
      },
    })
    accountMap[a.code] = acc.id
  }

  // 3. Categories
  const cat1 = await db.category.create({ data: { name: 'إلكترونيات', nameEn: 'Electronics' } })
  const cat2 = await db.category.create({ data: { name: 'ملابس', nameEn: 'Clothing' } })
  const cat3 = await db.category.create({ data: { name: 'مواد غذائية', nameEn: 'Food' } })
  const cat4 = await db.category.create({ data: { name: 'أثاث', nameEn: 'Furniture' } })

  // 4. Items
  const items = [
    { sku: 'ITM-001', barcode: '628100001', name: 'لابتوب ديل', nameEn: 'Dell Laptop', categoryId: cat1.id, unit: 'PCS', costPrice: 2800, salePrice: 3500, qtyOnHand: 45 },
    { sku: 'ITM-002', barcode: '628100002', name: 'هاتف سامسونج', nameEn: 'Samsung Phone', categoryId: cat1.id, unit: 'PCS', costPrice: 1800, salePrice: 2400, qtyOnHand: 80 },
    { sku: 'ITM-003', barcode: '628100003', name: 'سماعة بلوتوث', nameEn: 'Bluetooth Headset', categoryId: cat1.id, unit: 'PCS', costPrice: 150, salePrice: 280, qtyOnHand: 120 },
    { sku: 'ITM-004', barcode: '628100004', name: 'قميص رجالي', nameEn: 'Men Shirt', categoryId: cat2.id, unit: 'PCS', costPrice: 60, salePrice: 130, qtyOnHand: 200 },
    { sku: 'ITM-005', barcode: '628100005', name: 'فستان نسائي', nameEn: 'Women Dress', categoryId: cat2.id, unit: 'PCS', costPrice: 180, salePrice: 350, qtyOnHand: 75 },
    { sku: 'ITM-006', barcode: '628100006', name: 'أرز بسمتي 5كجم', nameEn: 'Basmati Rice 5kg', categoryId: cat3.id, unit: 'BAG', costPrice: 35, salePrice: 55, qtyOnHand: 300 },
    { sku: 'ITM-007', barcode: '628100007', name: 'زيت دوار الشمس 1.5ل', nameEn: 'Sunflower Oil', categoryId: cat3.id, unit: 'BTL', costPrice: 12, salePrice: 22, qtyOnHand: 250 },
    { sku: 'ITM-008', barcode: '628100008', name: 'كرسي مكتبي', nameEn: 'Office Chair', categoryId: cat4.id, unit: 'PCS', costPrice: 350, salePrice: 600, qtyOnHand: 30 },
    { sku: 'ITM-009', barcode: '628100009', name: 'مكتب خشبي', nameEn: 'Wooden Desk', categoryId: cat4.id, unit: 'PCS', costPrice: 800, salePrice: 1300, qtyOnHand: 18 },
    { sku: 'ITM-010', barcode: '628100010', name: 'شاشة LG 27 بوصة', nameEn: 'LG Monitor 27', categoryId: cat1.id, unit: 'PCS', costPrice: 900, salePrice: 1300, qtyOnHand: 8 },
  ]
  for (const it of items) {
    await db.item.create({ data: it })
  }

  // 5. Customers
  const customers = [
    { code: 'C-001', name: 'مؤسسة النور التجارية', nameEn: 'Al-Noor Trading', type: 'COMPANY', phone: '0551234567', email: 'info@alnoor.sa', creditLimit: 100000, balance: 45000, openingBalance: 0 },
    { code: 'C-002', name: 'شركة الأفق', nameEn: 'Al-Ufuq Co.', type: 'COMPANY', phone: '0552345678', email: 'info@ufuq.sa', creditLimit: 150000, balance: 72000, openingBalance: 0 },
    { code: 'C-003', name: 'محمد العتيبي', nameEn: 'Mohammed Al-Otaibi', type: 'INDIVIDUAL', phone: '0509876543', email: 'mohammed@email.com', creditLimit: 5000, balance: 1500, openingBalance: 0 },
    { code: 'C-004', name: 'فاطمة الزهراني', nameEn: 'Fatima Al-Zahrani', type: 'INDIVIDUAL', phone: '0512345678', email: 'fatima@email.com', creditLimit: 8000, balance: 3200, openingBalance: 0 },
    { code: 'C-005', name: 'مجموعة السلام', nameEn: 'Al-Salam Group', type: 'COMPANY', phone: '0563456789', email: 'info@salam.sa', creditLimit: 200000, balance: 88000, openingBalance: 0 },
    { code: 'C-006', name: 'أحمد القحطاني', nameEn: 'Ahmed Al-Qahtani', type: 'INDIVIDUAL', phone: '0534567890', email: 'ahmed@email.com', creditLimit: 6000, balance: 800, openingBalance: 0 },
  ]
  for (const c of customers) {
    await db.customer.create({ data: c })
  }

  // 6. Suppliers
  const suppliers = [
    { code: 'S-001', name: 'مورد الإلكترونيات', nameEn: 'Electronics Supplier', phone: '0114567890', email: 'sales@elec-sup.com', creditLimit: 200000, balance: 95000 },
    { code: 'S-002', name: 'مصنع الملابس الحديثة', nameEn: 'Modern Clothing Factory', phone: '0115678901', email: 'info@modern-clothing.com', creditLimit: 100000, balance: 42000 },
    { code: 'S-003', name: 'شركة الأغذية المتنوعة', nameEn: 'Al-Aghdhiya Co.', phone: '0116789012', email: 'sales@aghdhiya.sa', creditLimit: 150000, balance: 28000 },
    { code: 'S-004', name: 'مصنع الأثاث الوطني', nameEn: 'National Furniture', phone: '0117890123', email: 'info@nat-furniture.com', creditLimit: 120000, balance: 63000 },
  ]
  for (const s of suppliers) {
    await db.supplier.create({ data: s })
  }

  // 7. Cash & Banks
  await db.cash.create({ data: { code: 'CASH-01', name: 'الخزنة الرئيسية', branchId: branch1.id, balance: 25000 } })
  await db.cash.create({ data: { code: 'CASH-02', name: 'خزنة فرع جدة', branchId: branch2.id, balance: 12000 } })

  await db.bankAccount.create({ data: { code: 'BANK-01', bankName: 'البنك الأهلي', accountNo: '1234567890', iban: 'SA0380000000608010167519', branchId: branch1.id, balance: 480000 } })
  await db.bankAccount.create({ data: { code: 'BANK-02', bankName: 'بنك الراجحي', accountNo: '9876543210', iban: 'SA4420000001234567891234', branchId: branch1.id, balance: 320000 } })

  // 8. Employees
  const employees = [
    { code: 'EMP-001', name: 'خالد الحربي', nameEn: 'Khalid Al-Harbi', position: 'مدير عام', department: 'الإدارة', basicSalary: 18000, allowances: 3000, hireDate: new Date('2020-01-15') },
    { code: 'EMP-002', name: 'سارة المطيري', nameEn: 'Sara Al-Mutairi', position: 'محاسبة', department: 'المالية', basicSalary: 8500, allowances: 1500, hireDate: new Date('2021-03-10') },
    { code: 'EMP-003', name: 'عبدالله الدوسري', nameEn: 'Abdullah Al-Dosari', position: 'أخصائي مبيعات', department: 'المبيعات', basicSalary: 6500, allowances: 2000, hireDate: new Date('2022-06-01') },
    { code: 'EMP-004', name: 'نورة العنزي', nameEn: 'Noura Al-Anazi', position: 'مديرة موارد بشرية', department: 'الموارد البشرية', basicSalary: 11000, allowances: 2000, hireDate: new Date('2021-09-20') },
    { code: 'EMP-005', name: 'فهد الشمري', nameEn: 'Fahad Al-Shammari', position: 'أمين مخزن', department: 'المخازن', basicSalary: 5500, allowances: 1000, hireDate: new Date('2023-02-01') },
    { code: 'EMP-006', name: 'ريم القحطاني', nameEn: 'Reem Al-Qahtani', position: 'أخصائي تسويق', department: 'التسويق', basicSalary: 7000, allowances: 1500, hireDate: new Date('2022-11-15') },
    { code: 'EMP-007', name: 'ماجد العتيبي', nameEn: 'Majed Al-Otaibi', position: 'مندوب مبيعات', department: 'المبيعات', basicSalary: 5000, allowances: 2500, hireDate: new Date('2023-08-01') },
    { code: 'EMP-008', name: 'هند الزهراني', nameEn: 'Hind Al-Zahrani', position: 'محاسبة أولى', department: 'المالية', basicSalary: 9500, allowances: 1800, hireDate: new Date('2021-12-05') },
  ]
  for (const e of employees) {
    const emp = await db.employee.create({ data: e })
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 5 || dayOfWeek === 6) continue
      const rand = Math.random()
      const status = rand > 0.9 ? 'ABSENT' : rand > 0.75 ? 'LATE' : 'PRESENT'
      const checkIn = new Date(date)
      checkIn.setHours(8, status === 'LATE' ? 45 : 30, 0, 0)
      const checkOut = new Date(date)
      checkOut.setHours(17, 0, 0, 0)
      await db.attendance.create({
        data: { employeeId: emp.id, date, checkIn: status === 'ABSENT' ? null : checkIn, checkOut: status === 'ABSENT' ? null : checkOut, status }
      })
    }
  }

  // 9. Invoices
  const allCustomers = await db.customer.findMany()
  const allItems = await db.item.findMany()
  for (let i = 0; i < 40; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 60))
    const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)]
    const itemCount = Math.floor(Math.random() * 4) + 1
    let subtotal = 0
    const itemLines = []
    for (let j = 0; j < itemCount; j++) {
      const item = allItems[Math.floor(Math.random() * allItems.length)]
      const qty = Math.floor(Math.random() * 5) + 1
      const total = qty * item.salePrice
      subtotal += total
      itemLines.push({ itemId: item.id, quantity: qty, price: item.salePrice, discount: 0, total })
    }
    const taxAmount = subtotal * 0.15
    const total = subtotal + taxAmount
    const paidAmount = Math.random() > 0.3 ? total : Math.random() > 0.5 ? total * 0.5 : 0
    const status = paidAmount === total ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID'
    await db.invoice.create({
      data: {
        invoiceNo: `INV-${String(1000 + i).padStart(5, '0')}`,
        customerId: customer.id,
        date,
        dueDate: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal,
        discount: 0,
        taxRate: 15,
        taxAmount,
        total,
        paidAmount,
        status,
        type: 'SALES',
        items: { create: itemLines },
      },
    })
  }

  // 10. Purchases
  const allSuppliers = await db.supplier.findMany()
  for (let i = 0; i < 15; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 60))
    const supplier = allSuppliers[Math.floor(Math.random() * allSuppliers.length)]
    const itemCount = Math.floor(Math.random() * 3) + 1
    let subtotal = 0
    const itemLines = []
    for (let j = 0; j < itemCount; j++) {
      const item = allItems[Math.floor(Math.random() * allItems.length)]
      const qty = Math.floor(Math.random() * 50) + 10
      const total = qty * item.costPrice
      subtotal += total
      itemLines.push({ itemId: item.id, quantity: qty, price: item.costPrice, total })
    }
    const taxAmount = subtotal * 0.15
    const total = subtotal + taxAmount
    await db.purchase.create({
      data: {
        purchaseNo: `PUR-${String(2000 + i).padStart(5, '0')}`,
        supplierId: supplier.id,
        date,
        subtotal,
        taxAmount,
        total,
        paidAmount: total,
        status: 'PAID',
        items: { create: itemLines },
      },
    })
  }

  // 11. Journal Entries
  const accByCode: Record<string, string> = {}
  const allAccs = await db.account.findMany()
  for (const a of allAccs) accByCode[a.code] = a.id

  const journalEntries = [
    { desc: 'رأس المال المدفوع', dr: '1101', cr: '3100', amount: 500000 },
    { desc: 'مبيعات نقدية', dr: '1101', cr: '4100', amount: 75000 },
    { desc: 'تحصيل من عميل', dr: '1101', cr: '1102', amount: 35000 },
    { desc: 'سداد مورد', dr: '2101', cr: '1101', amount: 28000 },
    { desc: 'صرف رواتب', dr: '5200', cr: '1101', amount: 95000 },
    { desc: 'دفع إيجار', dr: '5300', cr: '1101', amount: 30000 },
    { desc: 'فاتورة كهرباء', dr: '5400', cr: '1101', amount: 8500 },
    { desc: 'إعلان تسويقي', dr: '5500', cr: '1101', amount: 18000 },
    { desc: 'شراء معدات', dr: '1202', cr: '1101', amount: 65000 },
    { desc: 'مبيعات آجلة', dr: '1102', cr: '4100', amount: 120000 },
    { desc: 'إثبات ضريبة المبيعات', dr: '1102', cr: '2102', amount: 18000 },
    { desc: 'تكلفة بضاعة مباعة', dr: '5100', cr: '1103', amount: 220000 },
  ]
  for (let i = 0; i < journalEntries.length; i++) {
    const je = journalEntries[i]
    await db.journalEntry.create({
      data: {
        entryNo: `JE-${String(i + 1).padStart(4, '0')}`,
        date: new Date(Date.now() - (i + 1) * 86400000 * 3),
        description: je.desc,
        totalDebit: je.amount,
        totalCredit: je.amount,
        status: 'POSTED',
        lines: {
          create: [
            { accountId: accByCode[je.dr], debit: je.amount, credit: 0 },
            { accountId: accByCode[je.cr], debit: 0, credit: je.amount },
          ],
        },
      },
    })
  }

  // 12. Users
  await db.user.create({ data: { email: 'admin@osa-erp.com', name: 'المدير العام', role: 'ADMIN', branchId: branch1.id } })
  await db.user.create({ data: { email: 'accountant@osa-erp.com', name: 'المحاسب', role: 'ACCOUNTANT', branchId: branch1.id } })
  await db.user.create({ data: { email: 'sales@osa-erp.com', name: 'مسؤول المبيعات', role: 'SALES', branchId: branch1.id } })

  // 13. Cost Centers
  await db.costCenter.create({ data: { code: 'CC-01', name: 'الإدارة العامة' } })
  await db.costCenter.create({ data: { code: 'CC-02', name: 'المبيعات' } })
  await db.costCenter.create({ data: { code: 'CC-03', name: 'المشتريات' } })
  await db.costCenter.create({ data: { code: 'CC-04', name: 'الموارد البشرية' } })

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
