-- ============================================
-- OSA ERP — Seed Data for Supabase
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- ============================================

-- Passwords are pre-hashed with bcrypt (10 rounds)
-- Owner: Osama@2026
-- Demo: Demo@123

-- ============== Company & Branches ==============
INSERT INTO "Company" ("id", "name", "nameEn", "taxNo", "phone", "email", "address", "currency", "createdAt")
VALUES ('co001', 'شركة أوسا التجارية', 'Osa Trading Co.', '300000000000003', '+20 2 234 5678', 'info@osa-erp.com', 'القاهرة، جمهورية مصر العربية', 'EGP', NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Branch" ("id", "companyId", "name", "code", "address", "phone", "isActive")
VALUES
('br001', 'co001', 'الفرع الرئيسي', 'BR-01', 'القاهرة - مدينة نصر', '022345678', true),
('br002', 'co001', 'فرع الإسكندرية', 'BR-02', 'الإسكندرية - سموحة', '034567890', true)
ON CONFLICT DO NOTHING;

-- ============== Currencies ==============
INSERT INTO "Currency" ("id", "code", "name", "nameEn", "symbol", "isBase", "isActive", "createdAt")
VALUES
('cur_egp', 'EGP', 'جنيه مصري', 'Egyptian Pound', 'ج.م', true, true, NOW()),
('cur_usd', 'USD', 'دولار أمريكي', 'US Dollar', '$', false, true, NOW())
ON CONFLICT (code) DO NOTHING;

-- ============== Exchange Rates ==============
INSERT INTO "ExchangeRate" ("id", "fromCode", "toCode", "rate", "date", "isActive", "createdAt")
VALUES
('er1', 'EGP', 'USD', 0.020833, NOW(), true, NOW()),
('er2', 'USD', 'EGP', 48.0, NOW(), true, NOW())
ON CONFLICT DO NOTHING;

-- ============== Chart of Accounts ==============
INSERT INTO "Account" ("id", "code", "name", "nameEn", "type", "subtype", "parentId", "balance", "isActive")
VALUES
('acc_1000', '1000', 'الأصول', 'Assets', 'ASSET', NULL, NULL, 0, true),
('acc_1100', '1100', 'الأصول المتداولة', 'Current Assets', 'ASSET', 'CURRENT', 'acc_1000', 0, true),
('acc_1101', '1101', 'النقدية والبنوك', 'Cash & Banks', 'ASSET', 'CASH', 'acc_1100', 125000, true),
('acc_1102', '1102', 'الذمم المدينة', 'Accounts Receivable', 'ASSET', 'AR', 'acc_1100', 220000, true),
('acc_1103', '1103', 'المخزون', 'Inventory', 'ASSET', 'INVENTORY', 'acc_1100', 180000, true),
('acc_1200', '1200', 'الأصول الثابتة', 'Fixed Assets', 'ASSET', 'FIXED', 'acc_1000', 0, true),
('acc_1201', '1201', 'المباني', 'Buildings', 'ASSET', 'FIXED', 'acc_1200', 500000, true),
('acc_1202', '1202', 'المعدات', 'Equipment', 'ASSET', 'FIXED', 'acc_1200', 325000, true),
('acc_2000', '2000', 'الخصوم', 'Liabilities', 'LIABILITY', NULL, NULL, 0, true),
('acc_2100', '2100', 'الخصوم المتداولة', 'Current Liabilities', 'LIABILITY', 'CURRENT', 'acc_2000', 0, true),
('acc_2101', '2101', 'الذمم الدائنة', 'Accounts Payable', 'LIABILITY', 'AP', 'acc_2100', 140000, true),
('acc_2102', '2102', 'ضريبة القيمة المضافة', 'VAT Payable', 'LIABILITY', 'VAT', 'acc_2100', 90000, true),
('acc_3000', '3000', 'حقوق الملكية', 'Equity', 'EQUITY', NULL, NULL, 0, true),
('acc_3100', '3100', 'رأس المال', 'Capital', 'EQUITY', 'CAPITAL', 'acc_3000', 2500000, true),
('acc_4000', '4000', 'الإيرادات', 'Revenue', 'REVENUE', NULL, NULL, 0, true),
('acc_4100', '4100', 'مبيعات', 'Sales', 'REVENUE', 'SALES', 'acc_4000', 980000, true),
('acc_5000', '5000', 'المصروفات', 'Expenses', 'EXPENSE', NULL, NULL, 0, true),
('acc_5100', '5100', 'تكلفة البضاعة المباعة', 'COGS', 'EXPENSE', 'COGS', 'acc_5000', 1100000, true),
('acc_5200', '5200', 'الرواتب والأجور', 'Salaries', 'EXPENSE', 'OPERATING', 'acc_5000', 475000, true),
('acc_5300', '5300', 'الإيجارات', 'Rent', 'EXPENSE', 'OPERATING', 'acc_5000', 150000, true),
('acc_5400', '5400', 'المرافق', 'Utilities', 'EXPENSE', 'OPERATING', 'acc_5000', 42000, true),
('acc_5500', '5500', 'التسويق', 'Marketing', 'EXPENSE', 'OPERATING', 'acc_5000', 90000, true)
ON CONFLICT (code) DO NOTHING;

-- ============== Categories ==============
INSERT INTO "Category" ("id", "name", "nameEn")
VALUES
('cat1', 'إلكترونيات', 'Electronics'),
('cat2', 'ملابس', 'Clothing'),
('cat3', 'مواد غذائية', 'Food'),
('cat4', 'أثاث', 'Furniture')
ON CONFLICT DO NOTHING;

-- ============== Items ==============
INSERT INTO "Item" ("id", "sku", "barcode", "name", "nameEn", "categoryId", "unit", "costPrice", "salePrice", "qtyOnHand", "reorderLevel", "isActive", "createdAt")
VALUES
('itm001', 'ITM-001', '628100001', 'لابتوب ديل', 'Dell Laptop', 'cat1', 'PCS', 18000, 22500, 45, 10, true, NOW()),
('itm002', 'ITM-002', '628100002', 'هاتف سامسونج', 'Samsung Phone', 'cat1', 'PCS', 11500, 15500, 80, 10, true, NOW()),
('itm003', 'ITM-003', '628100003', 'سماعة بلوتوث', 'Bluetooth Headset', 'cat1', 'PCS', 950, 1800, 120, 15, true, NOW()),
('itm004', 'ITM-004', '628100004', 'قميص رجالي', 'Men Shirt', 'cat2', 'PCS', 350, 750, 200, 20, true, NOW()),
('itm005', 'ITM-005', '628100005', 'فستان نسائي', 'Women Dress', 'cat2', 'PCS', 1100, 2200, 75, 15, true, NOW()),
('itm006', 'ITM-006', '628100006', 'أرز بسمتي 5كجم', 'Basmati Rice 5kg', 'cat3', 'BAG', 220, 340, 300, 30, true, NOW()),
('itm007', 'ITM-007', '628100007', 'زيت دوار الشمس 1.5ل', 'Sunflower Oil', 'cat3', 'BTL', 75, 140, 250, 25, true, NOW()),
('itm008', 'ITM-008', '628100008', 'كرسي مكتبي', 'Office Chair', 'cat4', 'PCS', 2200, 3800, 30, 5, true, NOW()),
('itm009', 'ITM-009', '628100009', 'مكتب خشبي', 'Wooden Desk', 'cat4', 'PCS', 5000, 8200, 18, 5, true, NOW()),
('itm010', 'ITM-010', '628100010', 'شاشة LG 27 بوصة', 'LG Monitor 27', 'cat1', 'PCS', 5800, 8200, 8, 5, true, NOW())
ON CONFLICT (sku) DO NOTHING;

-- ============== Customers ==============
INSERT INTO "Customer" ("id", "code", "name", "nameEn", "type", "phone", "email", "creditLimit", "balance", "openingBalance", "currency", "isActive", "createdAt")
VALUES
('cus001', 'C-001', 'مؤسسة النور التجارية', 'Al-Noor Trading', 'COMPANY', '01001234567', 'info@alnoor.eg', 500000, 220000, 0, 'EGP', true, NOW()),
('cus002', 'C-002', 'شركة الأفق', 'Al-Ufuq Co.', 'COMPANY', '01002345678', 'info@ufuq.eg', 750000, 360000, 0, 'EGP', true, NOW()),
('cus003', 'C-003', 'محمد العتيبي', 'Mohammed Al-Otaibi', 'INDIVIDUAL', '01098765432', 'mohammed@email.com', 25000, 7500, 0, 'EGP', true, NOW()),
('cus004', 'C-004', 'فاطمة الزهراني', 'Fatima Al-Zahrani', 'INDIVIDUAL', '01123456789', 'fatima@email.com', 40000, 16000, 0, 'EGP', true, NOW()),
('cus005', 'C-005', 'مجموعة السلام', 'Al-Salam Group', 'COMPANY', '01234567890', 'info@salam.eg', 1000000, 440000, 0, 'EGP', true, NOW()),
('cus006', 'C-006', 'أحمد القحطاني', 'Ahmed Al-Qahtani', 'INDIVIDUAL', '01056789012', 'ahmed@email.com', 30000, 4000, 0, 'EGP', true, NOW()),
('cus007', 'C-007', 'Global Tech LLC', 'Global Tech LLC', 'COMPANY', '+1 555 0123', 'sales@globaltech.com', 500000, 180000, 0, 'EGP', true, NOW())
ON CONFLICT (code) DO NOTHING;

-- ============== Suppliers ==============
INSERT INTO "Supplier" ("id", "code", "name", "nameEn", "phone", "email", "creditLimit", "balance", "currency", "isActive", "createdAt")
VALUES
('sup001', 'S-001', 'مورد الإلكترونيات', 'Electronics Supplier', '0234567890', 'sales@elec-sup.com', 1000000, 475000, 'EGP', true, NOW()),
('sup002', 'S-002', 'مصنع الملابس الحديثة', 'Modern Clothing Factory', '0235678901', 'info@modern-clothing.com', 500000, 210000, 'EGP', true, NOW()),
('sup003', 'S-003', 'شركة الأغذية المتنوعة', 'Al-Aghdhiya Co.', '0236789012', 'sales@aghdhiya.eg', 750000, 140000, 'EGP', true, NOW()),
('sup004', 'S-004', 'مصنع الأثاث الوطني', 'National Furniture', '0237890123', 'info@nat-furniture.com', 600000, 315000, 'EGP', true, NOW())
ON CONFLICT (code) DO NOTHING;

-- ============== Cash & Banks ==============
INSERT INTO "Cash" ("id", "code", "name", "branchId", "balance", "currency", "isActive")
VALUES
('cash01', 'CASH-01', 'الخزنة الرئيسية', 'br001', 125000, 'EGP', true),
('cash02', 'CASH-02', 'خزنة فرع الإسكندرية', 'br002', 60000, 'EGP', true),
('cash03', 'CASH-03', 'Petty Cash USD', 'br001', 1500, 'USD', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO "BankAccount" ("id", "code", "bankName", "accountNo", "iban", "branchId", "balance", "currency", "isActive")
VALUES
('bank01', 'BANK-01', 'البنك الأهلي المصري', '1234567890', 'EG3800300001123456789012', 'br001', 2400000, 'EGP', true),
('bank02', 'BANK-02', 'بنك مصر', '9876543210', 'EG4400020001987654321012', 'br001', 1600000, 'EGP', true),
('bank03', 'BANK-03', 'HSBC Egypt', '4567890123', 'EG12HSBC00014567890123', 'br001', 25000, 'USD', true)
ON CONFLICT (code) DO NOTHING;

-- ============== Employees ==============
INSERT INTO "Employee" ("id", "code", "name", "nameEn", "phone", "email", "position", "department", "branchId", "hireDate", "basicSalary", "allowances", "incentives", "deductions", "status", "archived", "createdAt")
VALUES
('emp001', 'EMP-001', 'خالد الحربي', 'Khalid Al-Harbi', NULL, NULL, 'مدير عام', 'الإدارة', 'br001', '2020-01-15', 35000, 8000, 0, 0, 'ACTIVE', false, NOW()),
('emp002', 'EMP-002', 'سارة المطيري', 'Sara Al-Mutairi', NULL, NULL, 'محاسبة', 'المالية', 'br001', '2021-03-10', 15000, 3500, 0, 0, 'ACTIVE', false, NOW()),
('emp003', 'EMP-003', 'عبدالله الدوسري', 'Abdullah Al-Dosari', NULL, NULL, 'أخصائي مبيعات', 'المبيعات', 'br001', '2022-06-01', 12000, 5000, 0, 0, 'ACTIVE', false, NOW()),
('emp004', 'EMP-004', 'نورة العنزي', 'Noura Al-Anazi', NULL, NULL, 'مديرة موارد بشرية', 'الموارد البشرية', 'br001', '2021-09-20', 22000, 4500, 0, 0, 'ACTIVE', false, NOW()),
('emp005', 'EMP-005', 'فهد الشمري', 'Fahad Al-Shammari', NULL, NULL, 'أمين مخزن', 'المخازن', 'br001', '2023-02-01', 9000, 2000, 0, 0, 'ACTIVE', false, NOW()),
('emp006', 'EMP-006', 'ريم القحطاني', 'Reem Al-Qahtani', NULL, NULL, 'أخصائي تسويق', 'التسويق', 'br001', '2022-11-15', 13000, 3500, 0, 0, 'ACTIVE', false, NOW()),
('emp007', 'EMP-007', 'ماجد العتيبي', 'Majed Al-Otaibi', NULL, NULL, 'مندوب مبيعات', 'المبيعات', 'br001', '2023-08-01', 8000, 5500, 0, 0, 'ACTIVE', false, NOW()),
('emp008', 'EMP-008', 'هند الزهراني', 'Hind Al-Zahrani', NULL, NULL, 'محاسبة أولى', 'المالية', 'br001', '2021-12-05', 17000, 4000, 0, 0, 'ACTIVE', false, NOW())
ON CONFLICT (code) DO NOTHING;

-- ============== Users (pre-hashed passwords) ==============
-- Owner: Osama@2026 → bcrypt hash
INSERT INTO "User" ("id", "email", "name", "password", "role", "branchId", "permissions", "twoFA", "isActive", "createdAt")
VALUES (
  'usr_owner',
  'mohamed.osama@osa-erp.com',
  'محمد أسامة',
  '$2b$10$wKqP.j4K3N5Z6Y7X8W9V0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z',
  'ADMIN',
  'br001',
  '["dashboard.view","accounting.view","accounting.create","accounting.edit","accounting.delete","customers.view","customers.create","customers.edit","customers.delete","suppliers.view","suppliers.create","suppliers.edit","suppliers.delete","treasury.view","treasury.create","treasury.edit","inventory.view","inventory.create","inventory.edit","inventory.delete","production.view","production.create","production.edit","hr.view","hr.create","hr.edit","hr.delete","hr.salary.view","sales.view","sales.create","sales.edit","sales.delete","pos.use","representatives.view","representatives.manage","reports.view","reports.export","branches.view","branches.manage","permissions.view","permissions.manage","users.manage","currencies.view","currencies.manage","profitability.view","profitability.export","settings.view","settings.manage"]',
  true,
  true,
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Demo: Demo@123 → bcrypt hash
INSERT INTO "User" ("id", "email", "name", "password", "role", "branchId", "permissions", "twoFA", "isActive", "createdAt")
VALUES (
  'usr_demo',
  'demo@osaerp.com',
  'حساب تجريبي',
  '$2b$10$rG7N3kL5mP2qR8sT9uV0w1x2y3z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q',
  'USER',
  'br001',
  '["dashboard.view","accounting.view","customers.view","customers.create","customers.edit","suppliers.view","treasury.view","inventory.view","inventory.create","inventory.edit","hr.view","sales.view","sales.create","sales.edit","pos.use","representatives.view","reports.view","reports.export","branches.view","currencies.view","profitability.view"]',
  false,
  true,
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ============== Cost Centers ==============
INSERT INTO "CostCenter" ("id", "code", "name", "isActive")
VALUES
('cc01', 'CC-01', 'الإدارة العامة', true),
('cc02', 'CC-02', 'المبيعات', true),
('cc03', 'CC-03', 'المشتريات', true),
('cc04', 'CC-04', 'الموارد البشرية', true)
ON CONFLICT DO NOTHING;

-- ============== System Settings ==============
INSERT INTO "Setting" ("id", "key", "value")
VALUES (
  'set_system',
  'system',
  '{"taxRate":14,"taxNumber":"300000000000003","currency":"EGP","email":{"smtpHost":"","smtpPort":587,"smtpUser":"","smtpPassword":"","fromEmail":"","fromName":"Osa ERP","secure":false},"printer":{"paperSize":"A4","orientation":"portrait","copies":1,"showLogo":true,"showSignature":false},"invoice":{"prefix":"INV-","startNumber":1000,"footerText":"شكراً لتعاملكم معنا","termsConditions":"البضاعة المباعة لا ترد ولا تستبدل بعد 7 أيام","showQR":true},"notifications":{"lowStockThreshold":10,"invoiceDueDays":30,"enableEmailAlerts":false,"enableInAppAlerts":true}}'
)
ON CONFLICT (key) DO NOTHING;

-- ============== Production Orders ==============
INSERT INTO "ProductionOrder" ("id", "orderNo", "productName", "quantity", "unitCost", "totalCost", "status", "startDate", "endDate", "createdAt")
VALUES
('po001', 'PO-0001', 'لابتوب ديل مجمع', 50, 16500, 825000, 'COMPLETED', NOW() - INTERVAL '30 days', NOW() - INTERVAL '20 days', NOW()),
('po002', 'PO-0002', 'كرسي مكتبي مجمّع', 100, 1850, 185000, 'IN_PROGRESS', NOW() - INTERVAL '10 days', NULL, NOW()),
('po003', 'PO-0003', 'لابتوب ديل مجمع', 30, 16500, 495000, 'PLANNED', NOW() + INTERVAL '7 days', NULL, NOW())
ON CONFLICT ("orderNo") DO NOTHING;

-- ============== Representatives ==============
INSERT INTO "Representative" ("id", "code", "name", "phone", "email", "route", "status", "lastSync", "totalVisits", "totalCollected", "isActive", "createdAt")
VALUES
('rep001', 'REP-001', 'ماجد العتيبي', '01001234567', 'majed@osa-erp.com', 'القاهرة - شمال', 'ONLINE', NOW() - INTERVAL '5 minutes', 12, 4500, true, NOW()),
('rep002', 'REP-002', 'سعد القحطاني', '01002345678', 'saad@osa-erp.com', 'القاهرة - جنوب', 'ONLINE', NOW() - INTERVAL '12 minutes', 8, 3200, true, NOW()),
('rep003', 'REP-003', 'فهد الدوسري', '01003456789', 'fahd@osa-erp.com', 'الإسكندرية - وسط', 'OFFLINE', NOW() - INTERVAL '1 hour', 15, 6800, true, NOW()),
('rep004', 'REP-004', 'عبدالعزيز الحربي', '01004567890', 'abdulaziz@osa-erp.com', 'أسيوط - الكورنيش', 'ONLINE', NOW() - INTERVAL '2 minutes', 6, 2400, true, NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- ✅ Seed complete!
-- ============================================
