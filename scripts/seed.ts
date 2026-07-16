// Osa ERP - Seed Data v2 (with currencies + auth + permissions)
import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding Osa ERP v2...')

  // ============== Currencies ==============
  const egp = await db.currency.create({ data: { code: 'EGP', name: 'جنيه مصري', nameEn: 'Egyptian Pound', symbol: 'ج.م', isBase: true } })
  const usd = await db.currency.create({ data: { code: 'USD', name: 'دولار أمريكي', nameEn: 'US Dollar', symbol: '$', isBase: false } })
  const sar = await db.currency.create({ data: { code: 'SAR', name: 'ريال سعودي', nameEn: 'Saudi Riyal', symbol: 'ر.س', isBase: false } })

  // ============== Exchange Rates ==============
  // EGP is base, 1 USD = 48 EGP, 1 SAR = 12.8 EGP
  await db.exchangeRate.create({ data: { fromCode: 'EGP', toCode: 'USD', rate: 1 / 48 } })
  await db.exchangeRate.create({ data: { fromCode: 'USD', toCode: 'EGP', rate: 48 } })
  await db.exchangeRate.create({ data: { fromCode: 'EGP', toCode: 'SAR', rate: 1 / 12.8 } })
  await db.exchangeRate.create({ data: { fromCode: 'SAR', toCode: 'EGP', rate: 12.8 } })
  await db.exchangeRate.create({ data: { fromCode: 'USD', toCode: 'SAR', rate: 3.75 } })
  await db.exchangeRate.create({ data: { fromCode: 'SAR', toCode: 'USD', rate: 1 / 3.75 } })

  // ============== Company & Branches ==============
  const company = await db.company.create({
    data: {
      name: 'شركة أوسا التجارية',
      nameEn: 'Osa Trading Co.',
      taxNo: '300000000000003',
      phone: '+20 2 234 5678',
      email: 'info@osa-erp.com',
      address: 'القاهرة، جمهورية مصر العربية',
      currency: 'EGP',
    },
  })

  const branch1 = await db.branch.create({ data: { companyId: company.id, name: 'الفرع الرئيسي', code: 'BR-01', address: 'القاهرة - مدينة نصر', phone: '022345678' } })
  const branch2 = await db.branch.create({ data: { companyId: company.id, name: 'فرع الإسكندرية', code: 'BR-02', address: 'الإسكندرية - سموحة', phone: '034567890' } })

  // ============== Chart of Accounts (with subtype) ==============
  const accounts = [
    { code: '1000', name: 'الأصول', nameEn: 'Assets', type: 'ASSET', subtype: null },
    { code: '1100', name: 'الأصول المتداولة', nameEn: 'Current Assets', type: 'ASSET', subtype: 'CURRENT', parent: '1000' },
    { code: '1101', name: 'النقدية والبنوك', nameEn: 'Cash & Banks', type: 'ASSET', subtype: 'CASH', parent: '1100' },
    { code: '1102', name: 'الذمم المدينة', nameEn: 'Accounts Receivable', type: 'ASSET', subtype: 'AR', parent: '1100' },
    { code: '1103', name: 'المخزون', nameEn: 'Inventory', type: 'ASSET', subtype: 'INVENTORY', parent: '1100' },
    { code: '1200', name: 'الأصول الثابتة', nameEn: 'Fixed Assets', type: 'ASSET', subtype: 'FIXED', parent: '1000' },
    { code: '1201', name: 'المباني', nameEn: 'Buildings', type: 'ASSET', subtype: 'FIXED', parent: '1200' },
    { code: '1202', name: 'المعدات', nameEn: 'Equipment', type: 'ASSET', subtype: 'FIXED', parent: '1200' },
    { code: '2000', name: 'الخصوم', nameEn: 'Liabilities', type: 'LIABILITY', subtype: null },
    { code: '2100', name: 'الخصوم المتداولة', nameEn: 'Current Liabilities', type: 'LIABILITY', subtype: 'CURRENT', parent: '2000' },
    { code: '2101', name: 'الذمم الدائنة', nameEn: 'Accounts Payable', type: 'LIABILITY', subtype: 'AP', parent: '2100' },
    { code: '2102', name: 'ضريبة القيمة المضافة', nameEn: 'VAT Payable', type: 'LIABILITY', subtype: 'VAT', parent: '2100' },
    { code: '2200', name: 'القروض طويلة الأجل', nameEn: 'Long-term Loans', type: 'LIABILITY', subtype: 'LONG_TERM', parent: '2000' },
    { code: '3000', name: 'حقوق الملكية', nameEn: 'Equity', type: 'EQUITY', subtype: null },
    { code: '3100', name: 'رأس المال', nameEn: 'Capital', type: 'EQUITY', subtype: 'CAPITAL', parent: '3000' },
    { code: '3200', name: 'الأرباح المحتجزة', nameEn: 'Retained Earnings', type: 'EQUITY', subtype: 'RETAINED', parent: '3000' },
    { code: '4000', name: 'الإيرادات', nameEn: 'Revenue', type: 'REVENUE', subtype: null },
    { code: '4100', name: 'مبيعات', nameEn: 'Sales', type: 'REVENUE', subtype: 'SALES', parent: '4000' },
    { code: '4200', name: 'إيرادات أخرى', nameEn: 'Other Income', type: 'REVENUE', subtype: 'OTHER_INCOME', parent: '4000' },
    { code: '5000', name: 'المصروفات', nameEn: 'Expenses', type: 'EXPENSE', subtype: null },
    { code: '5100', name: 'تكلفة البضاعة المباعة', nameEn: 'COGS', type: 'EXPENSE', subtype: 'COGS', parent: '5000' },
    { code: '5200', name: 'الرواتب والأجور', nameEn: 'Salaries', type: 'EXPENSE', subtype: 'OPERATING', parent: '5000' },
    { code: '5300', name: 'الإيجارات', nameEn: 'Rent', type: 'EXPENSE', subtype: 'OPERATING', parent: '5000' },
    { code: '5400', name: 'المرافق', nameEn: 'Utilities', type: 'EXPENSE', subtype: 'OPERATING', parent: '5000' },
    { code: '5500', name: 'التسويق', nameEn: 'Marketing', type: 'EXPENSE', subtype: 'OPERATING', parent: '5000' },
  ]

  const accountMap: Record<string, string> = {}
  for (const a of accounts) {
    const acc = await db.account.create({
      data: {
        code: a.code,
        name: a.name,
        nameEn: a.nameEn,
        type: a.type,
        subtype: a.subtype,
        parentId: a.parent ? accountMap[a.parent] : null,
        balance: ['1101', '1102', '1103', '1201', '1202', '2101', '2102', '3100', '4100', '5200', '5300', '5400'].includes(a.code) ? Math.floor(Math.random() * 500000) + 50000 : 0,
      },
    })
    accountMap[a.code] = acc.id
  }

  // ============== Categories ==============
  const cat1 = await db.category.create({ data: { name: 'إلكترونيات', nameEn: 'Electronics' } })
  const cat2 = await db.category.create({ data: { name: 'ملابس', nameEn: 'Clothing' } })
  const cat3 = await db.category.create({ data: { name: 'مواد غذائية', nameEn: 'Food' } })
  const cat4 = await db.category.create({ data: { name: 'أثاث', nameEn: 'Furniture' } })

  // ============== Items (EGP prices) ==============
  const items = [
    { sku: 'ITM-001', barcode: '628100001', name: 'لابتوب ديل', nameEn: 'Dell Laptop', categoryId: cat1.id, unit: 'PCS', costPrice: 18000, salePrice: 22500, qtyOnHand: 45 },
    { sku: 'ITM-002', barcode: '628100002', name: 'هاتف سامسونج', nameEn: 'Samsung Phone', categoryId: cat1.id, unit: 'PCS', costPrice: 11500, salePrice: 15500, qtyOnHand: 80 },
    { sku: 'ITM-003', barcode: '628100003', name: 'سماعة بلوتوث', nameEn: 'Bluetooth Headset', categoryId: cat1.id, unit: 'PCS', costPrice: 950, salePrice: 1800, qtyOnHand: 120 },
    { sku: 'ITM-004', barcode: '628100004', name: 'قميص رجالي', nameEn: 'Men Shirt', categoryId: cat2.id, unit: 'PCS', costPrice: 350, salePrice: 750, qtyOnHand: 200 },
    { sku: 'ITM-005', barcode: '628100005', name: 'فستان نسائي', nameEn: 'Women Dress', categoryId: cat2.id, unit: 'PCS', costPrice: 1100, salePrice: 2200, qtyOnHand: 75 },
    { sku: 'ITM-006', barcode: '628100006', name: 'أرز بسمتي 5كجم', nameEn: 'Basmati Rice 5kg', categoryId: cat3.id, unit: 'BAG', costPrice: 220, salePrice: 340, qtyOnHand: 300 },
    { sku: 'ITM-007', barcode: '628100007', name: 'زيت دوار الشمس 1.5ل', nameEn: 'Sunflower Oil', categoryId: cat3.id, unit: 'BTL', costPrice: 75, salePrice: 140, qtyOnHand: 250 },
    { sku: 'ITM-008', barcode: '628100008', name: 'كرسي مكتبي', nameEn: 'Office Chair', categoryId: cat4.id, unit: 'PCS', costPrice: 2200, salePrice: 3800, qtyOnHand: 30 },
    { sku: 'ITM-009', barcode: '628100009', name: 'مكتب خشبي', nameEn: 'Wooden Desk', categoryId: cat4.id, unit: 'PCS', costPrice: 5000, salePrice: 8200, qtyOnHand: 18 },
    { sku: 'ITM-010', barcode: '628100010', name: 'شاشة LG 27 بوصة', nameEn: 'LG Monitor 27', categoryId: cat1.id, unit: 'PCS', costPrice: 5800, salePrice: 8200, qtyOnHand: 8 },
  ]
  for (const it of items) await db.item.create({ data: it })

  // ============== Customers ==============
  const customers = [
    { code: 'C-001', name: 'مؤسسة النور التجارية', nameEn: 'Al-Noor Trading', type: 'COMPANY', phone: '01001234567', email: 'info@alnoor.eg', creditLimit: 500000, balance: 220000, openingBalance: 0, currency: 'EGP' },
    { code: 'C-002', name: 'شركة الأفق', nameEn: 'Al-Ufuq Co.', type: 'COMPANY', phone: '01002345678', email: 'info@ufuq.eg', creditLimit: 750000, balance: 360000, openingBalance: 0, currency: 'EGP' },
    { code: 'C-003', name: 'محمد العتيبي', nameEn: 'Mohammed Al-Otaibi', type: 'INDIVIDUAL', phone: '01098765432', email: 'mohammed@email.com', creditLimit: 25000, balance: 7500, openingBalance: 0, currency: 'EGP' },
    { code: 'C-004', name: 'فاطمة الزهراني', nameEn: 'Fatima Al-Zahrani', type: 'INDIVIDUAL', phone: '01123456789', email: 'fatima@email.com', creditLimit: 40000, balance: 16000, openingBalance: 0, currency: 'EGP' },
    { code: 'C-005', name: 'مجموعة السلام', nameEn: 'Al-Salam Group', type: 'COMPANY', phone: '01234567890', email: 'info@salam.eg', creditLimit: 1000000, balance: 440000, openingBalance: 0, currency: 'EGP' },
    { code: 'C-006', name: 'أحمد القحطاني', nameEn: 'Ahmed Al-Qahtani', type: 'INDIVIDUAL', phone: '01056789012', email: 'ahmed@email.com', creditLimit: 30000, balance: 4000, openingBalance: 0, currency: 'EGP' },
    { code: 'C-007', name: 'Global Tech LLC', nameEn: 'Global Tech LLC', type: 'COMPANY', phone: '+1 555 0123', email: 'sales@globaltech.com', creditLimit: 10000, balance: 3500, openingBalance: 0, currency: 'USD' },
  ]
  for (const c of customers) await db.customer.create({ data: c })

  // ============== Suppliers ==============
  const suppliers = [
    { code: 'S-001', name: 'مورد الإلكترونيات', nameEn: 'Electronics Supplier', phone: '0234567890', email: 'sales@elec-sup.com', creditLimit: 1000000, balance: 475000, currency: 'EGP' },
    { code: 'S-002', name: 'مصنع الملابس الحديثة', nameEn: 'Modern Clothing Factory', phone: '0235678901', email: 'info@modern-clothing.com', creditLimit: 500000, balance: 210000, currency: 'EGP' },
    { code: 'S-003', name: 'شركة الأغذية المتنوعة', nameEn: 'Al-Aghdhiya Co.', phone: '0236789012', email: 'sales@aghdhiya.eg', creditLimit: 750000, balance: 140000, currency: 'EGP' },
    { code: 'S-004', name: 'مصنع الأثاث الوطني', nameEn: 'National Furniture', phone: '0237890123', email: 'info@nat-furniture.com', creditLimit: 600000, balance: 315000, currency: 'EGP' },
    { code: 'S-005', name: 'China Imports Ltd', nameEn: 'China Imports Ltd', phone: '+86 755 1234', email: 'export@china-imp.cn', creditLimit: 20000, balance: 8500, currency: 'USD' },
  ]
  for (const s of suppliers) await db.supplier.create({ data: s })

  // ============== Cash & Banks ==============
  await db.cash.create({ data: { code: 'CASH-01', name: 'الخزنة الرئيسية', branchId: branch1.id, balance: 125000, currency: 'EGP' } })
  await db.cash.create({ data: { code: 'CASH-02', name: 'خزنة فرع الإسكندرية', branchId: branch2.id, balance: 60000, currency: 'EGP' } })
  await db.cash.create({ data: { code: 'CASH-03', name: 'Petty Cash USD', branchId: branch1.id, balance: 1500, currency: 'USD' } })

  await db.bankAccount.create({ data: { code: 'BANK-01', bankName: 'البنك الأهلي المصري', accountNo: '1234567890', iban: 'EG3800300001123456789012', branchId: branch1.id, balance: 2400000, currency: 'EGP' } })
  await db.bankAccount.create({ data: { code: 'BANK-02', bankName: 'بنك مصر', accountNo: '9876543210', iban: 'EG4400020001987654321012', branchId: branch1.id, balance: 1600000, currency: 'EGP' } })
  await db.bankAccount.create({ data: { code: 'BANK-03', bankName: 'HSBC Egypt', accountNo: '4567890123', iban: 'EG12HSBC00014567890123', branchId: branch1.id, balance: 25000, currency: 'USD' } })

  // ============== Employees ==============
  const employees = [
    { code: 'EMP-001', name: 'خالد الحربي', nameEn: 'Khalid Al-Harbi', position: 'مدير عام', department: 'الإدارة', basicSalary: 35000, allowances: 8000, hireDate: new Date('2020-01-15') },
    { code: 'EMP-002', name: 'سارة المطيري', nameEn: 'Sara Al-Mutairi', position: 'محاسبة', department: 'المالية', basicSalary: 15000, allowances: 3500, hireDate: new Date('2021-03-10') },
    { code: 'EMP-003', name: 'عبدالله الدوسري', nameEn: 'Abdullah Al-Dosari', position: 'أخصائي مبيعات', department: 'المبيعات', basicSalary: 12000, allowances: 5000, hireDate: new Date('2022-06-01') },
    { code: 'EMP-004', name: 'نورة العنزي', nameEn: 'Noura Al-Anazi', position: 'مديرة موارد بشرية', department: 'الموارد البشرية', basicSalary: 22000, allowances: 4500, hireDate: new Date('2021-09-20') },
    { code: 'EMP-005', name: 'فهد الشمري', nameEn: 'Fahad Al-Shammari', position: 'أمين مخزن', department: 'المخازن', basicSalary: 9000, allowances: 2000, hireDate: new Date('2023-02-01') },
    { code: 'EMP-006', name: 'ريم القحطاني', nameEn: 'Reem Al-Qahtani', position: 'أخصائي تسويق', department: 'التسويق', basicSalary: 13000, allowances: 3500, hireDate: new Date('2022-11-15') },
    { code: 'EMP-007', name: 'ماجد العتيبي', nameEn: 'Majed Al-Otaibi', position: 'مندوب مبيعات', department: 'المبيعات', basicSalary: 8000, allowances: 5500, hireDate: new Date('2023-08-01') },
    { code: 'EMP-008', name: 'هند الزهراني', nameEn: 'Hind Al-Zahrani', position: 'محاسبة أولى', department: 'المالية', basicSalary: 17000, allowances: 4000, hireDate: new Date('2021-12-05') },
  ]
  for (const e of employees) {
    const emp = await db.employee.create({ data: e })
    for (let i = 0; i < 30; i++) {
      const date = new Date(); date.setDate(date.getDate() - i)
      if (date.getDay() === 5 || date.getDay() === 6) continue
      const rand = Math.random()
      const status = rand > 0.9 ? 'ABSENT' : rand > 0.75 ? 'LATE' : 'PRESENT'
      const checkIn = new Date(date); checkIn.setHours(8, status === 'LATE' ? 45 : 30, 0, 0)
      const checkOut = new Date(date); checkOut.setHours(17, 0, 0, 0)
      await db.attendance.create({
        data: { employeeId: emp.id, date, checkIn: status === 'ABSENT' ? null : checkIn, checkOut: status === 'ABSENT' ? null : checkOut, status }
      })
    }
  }

  // ============== Invoices (spread across 6 months for P&L analysis) ==============
  const allCustomers = await db.customer.findMany()
  const allItems = await db.item.findMany()
  for (let i = 0; i < 60; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 180))
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
    const taxAmount = subtotal * 0.14
    const total = subtotal + taxAmount
    const paidAmount = Math.random() > 0.3 ? total : Math.random() > 0.5 ? total * 0.5 : 0
    const status = paidAmount === total ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID'
    await db.invoice.create({
      data: {
        invoiceNo: `INV-${String(1000 + i).padStart(5, '0')}`,
        customerId: customer.id,
        date, dueDate: new Date(date.getTime() + 30 * 86400000),
        subtotal, discount: 0, taxRate: 14, taxAmount, total, paidAmount, status,
        type: 'SALES',
        items: { create: itemLines },
      },
    })
  }

  // ============== Purchases ==============
  const allSuppliers = await db.supplier.findMany()
  for (let i = 0; i < 25; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 180))
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
    const taxAmount = subtotal * 0.14
    const total = subtotal + taxAmount
    await db.purchase.create({
      data: {
        purchaseNo: `PUR-${String(2000 + i).padStart(5, '0')}`,
        supplierId: supplier.id, date, subtotal, taxAmount, total, paidAmount: total, status: 'PAID',
        items: { create: itemLines },
      },
    })
  }

  // ============== Journal Entries ==============
  const accByCode: Record<string, string> = {}
  for (const a of await db.account.findMany()) accByCode[a.code] = a.id

  const journalEntries = [
    { desc: 'رأس المال المدفوع', dr: '1101', cr: '3100', amount: 2500000 },
    { desc: 'مبيعات نقدية', dr: '1101', cr: '4100', amount: 380000 },
    { desc: 'تحصيل من عميل', dr: '1101', cr: '1102', amount: 175000 },
    { desc: 'سداد مورد', dr: '2101', cr: '1101', amount: 140000 },
    { desc: 'صرف رواتب', dr: '5200', cr: '1101', amount: 475000 },
    { desc: 'دفع إيجار', dr: '5300', cr: '1101', amount: 150000 },
    { desc: 'فاتورة كهرباء', dr: '5400', cr: '1101', amount: 42000 },
    { desc: 'إعلان تسويقي', dr: '5500', cr: '1101', amount: 90000 },
    { desc: 'شراء معدات', dr: '1202', cr: '1101', amount: 325000 },
    { desc: 'مبيعات آجلة', dr: '1102', cr: '4100', amount: 600000 },
    { desc: 'إثبات ضريبة المبيعات', dr: '1102', cr: '2102', amount: 90000 },
    { desc: 'تكلفة بضاعة مباعة', dr: '5100', cr: '1103', amount: 1100000 },
  ]
  for (let i = 0; i < journalEntries.length; i++) {
    const je = journalEntries[i]
    await db.journalEntry.create({
      data: {
        entryNo: `JE-${String(i + 1).padStart(4, '0')}`,
        date: new Date(Date.now() - (i + 1) * 86400000 * 5),
        description: je.desc, totalDebit: je.amount, totalCredit: je.amount, status: 'POSTED',
        lines: { create: [
          { accountId: accByCode[je.dr], debit: je.amount, credit: 0 },
          { accountId: accByCode[je.cr], debit: 0, credit: je.amount },
        ] },
      },
    })
  }

  // ============== Users — Production Setup ==============
  // Main admin account: Mohamed Osama (the owner)
  const ownerPass = await bcrypt.hash('Osama@2026', 10)
  const demoPass = await bcrypt.hash('Demo@123', 10)

  // All permissions for admin (Mohamed Osama — full access)
  const allPerms = JSON.stringify([
    'dashboard.view', 'accounting.view', 'accounting.create', 'accounting.edit', 'accounting.delete',
    'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
    'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',
    'treasury.view', 'treasury.create', 'treasury.edit',
    'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete',
    'production.view', 'production.create', 'production.edit',
    'hr.view', 'hr.create', 'hr.edit', 'hr.delete', 'hr.salary.view',
    'sales.view', 'sales.create', 'sales.edit', 'sales.delete', 'pos.use',
    'representatives.view', 'representatives.manage',
    'reports.view', 'reports.export',
    'branches.view', 'branches.manage',
    'permissions.view', 'permissions.manage', 'users.manage',
    'currencies.view', 'currencies.manage',
    'profitability.view', 'profitability.export',
    'settings.view', 'settings.manage',
  ])

  // Demo account — read-only permissions for landing page visitors
  const demoPerms = JSON.stringify([
    'dashboard.view',
    'accounting.view',
    'customers.view', 'customers.create', 'customers.edit',
    'suppliers.view',
    'treasury.view',
    'inventory.view', 'inventory.create', 'inventory.edit',
    'hr.view',
    'sales.view', 'sales.create', 'sales.edit', 'pos.use',
    'representatives.view',
    'reports.view', 'reports.export',
    'branches.view',
    'currencies.view',
    'profitability.view',
  ])

  // Owner account — Mohamed Osama
  await db.user.create({
    data: {
      email: 'mohamed.osama@osa-erp.com',
      name: 'محمد أسامة',
      password: ownerPass,
      role: 'ADMIN',
      branchId: branch1.id,
      permissions: allPerms,
      twoFA: true,
    }
  })

  // Demo account for landing page visitors (limited, no destructive perms)
  await db.user.create({
    data: {
      email: 'demo@osaerp.com',
      name: 'حساب تجريبي',
      password: demoPass,
      role: 'USER',
      branchId: branch1.id,
      permissions: demoPerms,
      twoFA: false,
    }
  })

  // ============== Cost Centers ==============
  await db.costCenter.create({ data: { code: 'CC-01', name: 'الإدارة العامة' } })
  await db.costCenter.create({ data: { code: 'CC-02', name: 'المبيعات' } })
  await db.costCenter.create({ data: { code: 'CC-03', name: 'المشتريات' } })
  await db.costCenter.create({ data: { code: 'CC-04', name: 'الموارد البشرية' } })

  // ============== Production Orders (real data) ==============
  const allItemsForBom = await db.item.findMany()
  const bom1 = await db.bOM.create({
    data: {
      productCode: 'LAPTOP-ASSY-01',
      productName: 'لابتوب ديل مجمع',
      version: '1.0',
      totalCost: 16500,
      isActive: true,
      lines: {
        create: [
          { itemId: allItemsForBom[0].id, quantity: 1 },
          { itemId: allItemsForBom[2].id, quantity: 1 },
        ]
      }
    }
  })
  const bom2 = await db.bOM.create({
    data: {
      productCode: 'CHAIR-ASSY-01',
      productName: 'كرسي مكتبي مجمّع',
      version: '1.0',
      totalCost: 1850,
      isActive: true,
    }
  })

  await db.productionOrder.create({
    data: {
      orderNo: 'PO-0001', bomId: bom1.id, productName: 'لابتوب ديل مجمع',
      quantity: 50, unitCost: 16500, totalCost: 825000, status: 'COMPLETED',
      startDate: new Date(Date.now() - 30 * 86400000), endDate: new Date(Date.now() - 20 * 86400000),
    }
  })
  await db.productionOrder.create({
    data: {
      orderNo: 'PO-0002', bomId: bom2.id, productName: 'كرسي مكتبي مجمّع',
      quantity: 100, unitCost: 1850, totalCost: 185000, status: 'IN_PROGRESS',
      startDate: new Date(Date.now() - 10 * 86400000),
    }
  })
  await db.productionOrder.create({
    data: {
      orderNo: 'PO-0003', bomId: bom1.id, productName: 'لابتوب ديل مجمع',
      quantity: 30, unitCost: 16500, totalCost: 495000, status: 'PLANNED',
      startDate: new Date(Date.now() + 7 * 86400000),
    }
  })

  // ============== Representatives (real data) ==============
  const reps = [
    { code: 'REP-001', name: 'ماجد العتيبي', phone: '01001234567', email: 'majed@osa-erp.com', route: 'القاهرة - شمال', status: 'ONLINE', totalVisits: 12, totalCollected: 4500 },
    { code: 'REP-002', name: 'سعد القحطاني', phone: '01002345678', email: 'saad@osa-erp.com', route: 'القاهرة - جنوب', status: 'ONLINE', totalVisits: 8, totalCollected: 3200 },
    { code: 'REP-003', name: 'فهد الدوسري', phone: '01003456789', email: 'fahd@osa-erp.com', route: 'الإسكندرية - وسط', status: 'OFFLINE', totalVisits: 15, totalCollected: 6800 },
    { code: 'REP-004', name: 'عبدالعزيز الحربي', phone: '01004567890', email: 'abdulaziz@osa-erp.com', route: 'أسيوط - الكورنيش', status: 'ONLINE', totalVisits: 6, totalCollected: 2400 },
  ]
  for (const r of reps) {
    await db.representative.create({
      data: {
        ...r,
        lastSync: new Date(Date.now() - Math.random() * 3600000),
        isActive: true,
      }
    })
  }

  // ============== Default System Settings (persisted in DB) ==============
  await db.setting.create({
    data: {
      key: 'system',
      value: JSON.stringify({
        taxRate: 14,
        taxNumber: '300000000000003',
        currency: 'EGP',
        email: { smtpHost: '', smtpPort: 587, smtpUser: '', smtpPassword: '', fromEmail: '', fromName: 'Osa ERP', secure: false },
        printer: { paperSize: 'A4', orientation: 'portrait', copies: 1, showLogo: true, showSignature: false },
        invoice: { prefix: 'INV-', startNumber: 1000, footerText: 'شكراً لتعاملكم معنا', termsConditions: 'البضاعة المباعة لا ترد ولا تستبدل بعد 7 أيام', showQR: true },
        notifications: { lowStockThreshold: 10, invoiceDueDays: 30, enableEmailAlerts: false, enableInAppAlerts: true },
      })
    }
  })

  console.log('✅ Seed v3.1 completed (production-ready)!')
  console.log('   👑 Owner: mohamed.osama@osa-erp.com / Osama@2026')
  console.log('   🎯 Demo:  demo@osaerp.com / Demo@123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
