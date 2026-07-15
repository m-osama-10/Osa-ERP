'use client'

import * as React from 'react'

type Lang = 'ar' | 'en'
type Theme = 'light' | 'dark'

type AppState = {
  lang: Lang
  setLang: (l: Lang) => void
  theme: Theme
  toggleTheme: () => void
  activeModule: string
  setActiveModule: (m: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (o: boolean) => void
}

const AppContext = React.createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>('ar')
  const [theme, setTheme] = React.useState<Theme>('light')
  const [activeModule, setActiveModule] = React.useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  React.useEffect(() => {
    const savedLang = (typeof window !== 'undefined' && localStorage.getItem('osa-lang')) as Lang
    const savedTheme = (typeof window !== 'undefined' && localStorage.getItem('osa-theme')) as Theme
    if (savedLang) setLangState(savedLang)
    if (savedTheme) setTheme(savedTheme)
  }, [])

  React.useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    if (typeof window !== 'undefined') localStorage.setItem('osa-lang', lang)
  }, [lang])

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    if (typeof window !== 'undefined') localStorage.setItem('osa-theme', theme)
  }, [theme])

  const setLang = (l: Lang) => setLangState(l)
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <AppContext.Provider value={{ lang, setLang, theme, toggleTheme, activeModule, setActiveModule, sidebarOpen, setSidebarOpen }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// Translation dictionary
export const t = (lang: Lang, key: string): string => {
  const dict: Record<string, { ar: string; en: string }> = {
    dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
    accounting: { ar: 'المحاسبة', en: 'Accounting' },
    customers: { ar: 'العملاء', en: 'Customers' },
    suppliers: { ar: 'الموردون', en: 'Suppliers' },
    treasury: { ar: 'الخزائن والبنوك', en: 'Treasury & Banks' },
    inventory: { ar: 'المخازن', en: 'Inventory' },
    production: { ar: 'الإنتاج', en: 'Production' },
    hr: { ar: 'الموارد البشرية', en: 'Human Resources' },
    sales: { ar: 'المبيعات', en: 'Sales' },
    representatives: { ar: 'المندوبين', en: 'Sales Reps' },
    reports: { ar: 'التقارير', en: 'Reports' },
    branches: { ar: 'الفروع', en: 'Branches' },
    permissions: { ar: 'الصلاحيات', en: 'Permissions' },
    settings: { ar: 'الإعدادات', en: 'Settings' },
    chartOfAccounts: { ar: 'دليل الحسابات', en: 'Chart of Accounts' },
    journalEntries: { ar: 'القيود اليومية', en: 'Journal Entries' },
    generalLedger: { ar: 'الأستاذ العام', en: 'General Ledger' },
    trialBalance: { ar: 'ميزان المراجعة', en: 'Trial Balance' },
    incomeStatement: { ar: 'قائمة الدخل', en: 'Income Statement' },
    balanceSheet: { ar: 'الميزانية العمومية', en: 'Balance Sheet' },
    cashFlow: { ar: 'التدفقات النقدية', en: 'Cash Flow' },
    costCenters: { ar: 'مراكز التكلفة', en: 'Cost Centers' },
    vat: { ar: 'ضريبة القيمة المضافة', en: 'VAT' },
    invoices: { ar: 'الفواتير', en: 'Invoices' },
    purchases: { ar: 'المشتريات', en: 'Purchases' },
    items: { ar: 'الأصناف', en: 'Items' },
    employees: { ar: 'الموظفون', en: 'Employees' },
    attendance: { ar: 'الحضور والانصراف', en: 'Attendance' },
    payroll: { ar: 'الرواتب', en: 'Payroll' },
    pos: { ar: 'نقطة البيع', en: 'POS' },
    totalSales: { ar: 'إجمالي المبيعات', en: 'Total Sales' },
    totalPurchases: { ar: 'إجمالي المشتريات', en: 'Total Purchases' },
    totalCustomers: { ar: 'إجمالي العملاء', en: 'Total Customers' },
    totalEmployees: { ar: 'إجمالي الموظفين', en: 'Total Employees' },
    netProfit: { ar: 'صافي الربح', en: 'Net Profit' },
    totalAssets: { ar: 'إجمالي الأصول', en: 'Total Assets' },
    totalLiabilities: { ar: 'إجمالي الخصوم', en: 'Total Liabilities' },
    monthlySales: { ar: 'المبيعات الشهرية', en: 'Monthly Sales' },
    topCustomers: { ar: 'أفضل العملاء', en: 'Top Customers' },
    lowStock: { ar: 'مخزون منخفض', en: 'Low Stock' },
    recentInvoices: { ar: 'أحدث الفواتير', en: 'Recent Invoices' },
    search: { ar: 'بحث...', en: 'Search...' },
    add: { ar: 'إضافة', en: 'Add' },
    edit: { ar: 'تعديل', en: 'Edit' },
    delete: { ar: 'حذف', en: 'Delete' },
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    code: { ar: 'الرمز', en: 'Code' },
    name: { ar: 'الاسم', en: 'Name' },
    nameEn: { ar: 'الاسم بالإنجليزي', en: 'English Name' },
    phone: { ar: 'الهاتف', en: 'Phone' },
    email: { ar: 'البريد', en: 'Email' },
    address: { ar: 'العنوان', en: 'Address' },
    balance: { ar: 'الرصيد', en: 'Balance' },
    creditLimit: { ar: 'حد الائتمان', en: 'Credit Limit' },
    type: { ar: 'النوع', en: 'Type' },
    status: { ar: 'الحالة', en: 'Status' },
    date: { ar: 'التاريخ', en: 'Date' },
    amount: { ar: 'المبلغ', en: 'Amount' },
    account: { ar: 'الحساب', en: 'Account' },
    debit: { ar: 'مدين', en: 'Debit' },
    credit: { ar: 'دائن', en: 'Credit' },
    description: { ar: 'البيان', en: 'Description' },
    total: { ar: 'الإجمالي', en: 'Total' },
    quantity: { ar: 'الكمية', en: 'Quantity' },
    price: { ar: 'السعر', en: 'Price' },
    cost: { ar: 'التكلفة', en: 'Cost' },
    category: { ar: 'التصنيف', en: 'Category' },
    unit: { ar: 'الوحدة', en: 'Unit' },
    position: { ar: 'المنصب', en: 'Position' },
    department: { ar: 'القسم', en: 'Department' },
    salary: { ar: 'الراتب', en: 'Salary' },
    newEntry: { ar: 'قيد جديد', en: 'New Entry' },
    newCustomer: { ar: 'عميل جديد', en: 'New Customer' },
    newSupplier: { ar: 'مورد جديد', en: 'New Supplier' },
    newItem: { ar: 'صنف جديد', en: 'New Item' },
    newEmployee: { ar: 'موظف جديد', en: 'New Employee' },
    newInvoice: { ar: 'فاتورة جديدة', en: 'New Invoice' },
    overview: { ar: 'نظرة عامة', en: 'Overview' },
    financialReports: { ar: 'التقارير المالية', en: 'Financial Reports' },
    welcome: { ar: 'أهلاً بك في', en: 'Welcome to' },
    mainModules: { ar: 'الوحدات الرئيسية', en: 'Main Modules' },
    systemManagement: { ar: 'إدارة النظام', en: 'System Management' },
  }
  return dict[key]?.[lang] || key
}
