'use client'

import * as React from 'react'

type Lang = 'ar' | 'en'
type Theme = 'light' | 'dark'
type CurrencyCode = 'EGP' // Unified to Egyptian Pound only

type User = {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  twoFA: boolean
} | null

type ExchangeRates = Record<string, number> // `${from}_${to}` -> rate

type AppState = {
  // Auth
  user: User
  setUser: (u: User) => void
  hasPermission: (perm: string) => boolean
  loadingAuth: boolean
  // i18n
  lang: Lang
  setLang: (l: Lang) => void
  // Theme
  theme: Theme
  toggleTheme: () => void
  // Navigation
  activeModule: string
  setActiveModule: (m: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (o: boolean) => void
  // Login form visibility (for landing → login transition)
  showLogin: boolean
  setShowLogin: (v: boolean) => void
  // Currency
  displayCurrency: CurrencyCode
  setDisplayCurrency: (c: CurrencyCode) => void
  exchangeRates: ExchangeRates
  baseCurrency: CurrencyCode
  convertAmount: (amount: number, from: CurrencyCode, to?: CurrencyCode) => number
  formatMoney: (amount: number, from?: CurrencyCode) => string
}

const AppContext = React.createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>('ar')
  const [theme, setTheme] = React.useState<Theme>('light')
  const [activeModule, setActiveModule] = React.useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [showLogin, setShowLogin] = React.useState(false)
  const [displayCurrency, setDisplayCurrencyState] = React.useState<CurrencyCode>('EGP')
  const [exchangeRates, setExchangeRates] = React.useState<ExchangeRates>({})
  const [user, setUser] = React.useState<User>(null)
  const [loadingAuth, setLoadingAuth] = React.useState(true)

  // Load preferences
  React.useEffect(() => {
    const sLang = (typeof window !== 'undefined' && localStorage.getItem('osa-lang')) as Lang
    const sTheme = (typeof window !== 'undefined' && localStorage.getItem('osa-theme')) as Theme
    const sCur = (typeof window !== 'undefined' && localStorage.getItem('osa-currency')) as CurrencyCode
    if (sLang) setLangState(sLang)
    if (sTheme) setTheme(sTheme)
    if (sCur) setDisplayCurrencyState(sCur)
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

  // Load exchange rates
  React.useEffect(() => {
    fetch('/api/currencies').then(r => r.json()).then(d => {
      const rates: ExchangeRates = {}
      for (const r of d.rates || []) {
        rates[`${r.fromCode}_${r.toCode}`] = r.rate
      }
      setExchangeRates(rates)
    })
  }, [])

  // Check session
  React.useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setUser(d.user || null)
      setLoadingAuth(false)
    }).catch(() => setLoadingAuth(false))
  }, [])

  const setLang = (l: Lang) => setLangState(l)
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')
  const setDisplayCurrency = (c: CurrencyCode) => {
    setDisplayCurrencyState(c)
    if (typeof window !== 'undefined') localStorage.setItem('osa-currency', c)
  }

  const baseCurrency: CurrencyCode = 'EGP'

  const convertAmount = React.useCallback((amount: number, _from?: CurrencyCode, _to?: CurrencyCode) => {
    // EGP only — no conversion needed
    return amount
  }, [])

  const formatMoney = React.useCallback((amount: number, _from?: CurrencyCode) => {
    // Always EGP
    const num = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(amount)
    return `${num} ج.م`
  }, [])

  const hasPermission = React.useCallback((perm: string) => {
    if (!user) return false
    if (user.role === 'ADMIN') return true
    return user.permissions.includes(perm)
  }, [user])

  return (
    <AppContext.Provider value={{
      lang, setLang, theme, toggleTheme,
      activeModule, setActiveModule, sidebarOpen, setSidebarOpen,
      showLogin, setShowLogin,
      displayCurrency, setDisplayCurrency, exchangeRates, baseCurrency, convertAmount, formatMoney,
      user, setUser, hasPermission, loadingAuth,
    }}>
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
    currencies: { ar: 'العملات', en: 'Currencies' },
    profitability: { ar: 'الربحية', en: 'Profitability' },
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
    grossProfit: { ar: 'مجمل الربح', en: 'Gross Profit' },
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
    newUser: { ar: 'مستخدم جديد', en: 'New User' },
    overview: { ar: 'نظرة عامة', en: 'Overview' },
    financialReports: { ar: 'التقارير المالية', en: 'Financial Reports' },
    welcome: { ar: 'أهلاً بك في', en: 'Welcome to' },
    mainModules: { ar: 'الوحدات الرئيسية', en: 'Main Modules' },
    systemManagement: { ar: 'إدارة النظام', en: 'System Management' },
    login: { ar: 'تسجيل الدخول', en: 'Login' },
    logout: { ar: 'تسجيل الخروج', en: 'Logout' },
    password: { ar: 'كلمة المرور', en: 'Password' },
    role: { ar: 'الدور', en: 'Role' },
    permissions: { ar: 'الصلاحيات', en: 'Permissions' },
    export: { ar: 'تصدير', en: 'Export' },
    print: { ar: 'طباعة', en: 'Print' },
    from: { ar: 'من', en: 'From' },
    to: { ar: 'إلى', en: 'To' },
    period: { ar: 'الفترة', en: 'Period' },
    revenue: { ar: 'الإيرادات', en: 'Revenue' },
    expenses: { ar: 'المصروفات', en: 'Expenses' },
    profit: { ar: 'الربح', en: 'Profit' },
    loss: { ar: 'الخسارة', en: 'Loss' },
    grossMargin: { ar: 'هامش مجمل الربح', en: 'Gross Margin' },
    netMargin: { ar: 'هامش صافي الربح', en: 'Net Margin' },
    cogs: { ar: 'تكلفة البضاعة المباعة', en: 'COGS' },
    exchangeRate: { ar: 'سعر الصرف', en: 'Exchange Rate' },
    baseCurrency: { ar: 'العملة الأساسية', en: 'Base Currency' },
    displayCurrency: { ar: 'عملة العرض', en: 'Display Currency' },
    loginRequired: { ar: 'يجب تسجيل الدخول', en: 'Login required' },
    noPermission: { ar: 'لا تملك صلاحية الوصول', en: 'No permission' },
  }
  return dict[key]?.[lang] || key
}

// All permission keys for the admin UI
export const ALL_PERMISSIONS = [
  { group: 'dashboard', key: 'dashboard.view', ar: 'عرض لوحة التحكم', en: 'View Dashboard' },
  { group: 'accounting', key: 'accounting.view', ar: 'عرض المحاسبة', en: 'View Accounting' },
  { group: 'accounting', key: 'accounting.create', ar: 'إنشاء قيود', en: 'Create Entries' },
  { group: 'accounting', key: 'accounting.edit', ar: 'تعديل القيود', en: 'Edit Entries' },
  { group: 'accounting', key: 'accounting.delete', ar: 'حذف القيود', en: 'Delete Entries' },
  { group: 'customers', key: 'customers.view', ar: 'عرض العملاء', en: 'View Customers' },
  { group: 'customers', key: 'customers.create', ar: 'إضافة عملاء', en: 'Add Customers' },
  { group: 'customers', key: 'customers.edit', ar: 'تعديل العملاء', en: 'Edit Customers' },
  { group: 'customers', key: 'customers.delete', ar: 'حذف العملاء', en: 'Delete Customers' },
  { group: 'suppliers', key: 'suppliers.view', ar: 'عرض الموردين', en: 'View Suppliers' },
  { group: 'suppliers', key: 'suppliers.create', ar: 'إضافة موردين', en: 'Add Suppliers' },
  { group: 'suppliers', key: 'suppliers.edit', ar: 'تعديل الموردين', en: 'Edit Suppliers' },
  { group: 'suppliers', key: 'suppliers.delete', ar: 'حذف الموردين', en: 'Delete Suppliers' },
  { group: 'treasury', key: 'treasury.view', ar: 'عرض الخزائن', en: 'View Treasury' },
  { group: 'treasury', key: 'treasury.create', ar: 'إنشاء حركات', en: 'Create Transactions' },
  { group: 'treasury', key: 'treasury.edit', ar: 'تعديل الحركات', en: 'Edit Transactions' },
  { group: 'inventory', key: 'inventory.view', ar: 'عرض المخزون', en: 'View Inventory' },
  { group: 'inventory', key: 'inventory.create', ar: 'إضافة أصناف', en: 'Add Items' },
  { group: 'inventory', key: 'inventory.edit', ar: 'تعديل الأصناف', en: 'Edit Items' },
  { group: 'inventory', key: 'inventory.delete', ar: 'حذف الأصناف', en: 'Delete Items' },
  { group: 'production', key: 'production.view', ar: 'عرض الإنتاج', en: 'View Production' },
  { group: 'production', key: 'production.create', ar: 'إنشاء أوامر', en: 'Create Orders' },
  { group: 'production', key: 'production.edit', ar: 'تعديل الأوامر', en: 'Edit Orders' },
  { group: 'hr', key: 'hr.view', ar: 'عرض الموارد البشرية', en: 'View HR' },
  { group: 'hr', key: 'hr.create', ar: 'إضافة موظفين', en: 'Add Employees' },
  { group: 'hr', key: 'hr.edit', ar: 'تعديل الموظفين', en: 'Edit Employees' },
  { group: 'hr', key: 'hr.delete', ar: 'حذف الموظفين', en: 'Delete Employees' },
  { group: 'hr', key: 'hr.salary.view', ar: 'عرض الرواتب', en: 'View Salaries' },
  { group: 'sales', key: 'sales.view', ar: 'عرض المبيعات', en: 'View Sales' },
  { group: 'sales', key: 'sales.create', ar: 'إنشاء فواتير', en: 'Create Invoices' },
  { group: 'sales', key: 'sales.edit', ar: 'تعديل الفواتير', en: 'Edit Invoices' },
  { group: 'sales', key: 'sales.delete', ar: 'حذف الفواتير', en: 'Delete Invoices' },
  { group: 'sales', key: 'pos.use', ar: 'استخدام POS', en: 'Use POS' },
  { group: 'representatives', key: 'representatives.view', ar: 'عرض المندوبين', en: 'View Reps' },
  { group: 'representatives', key: 'representatives.manage', ar: 'إدارة المندوبين', en: 'Manage Reps' },
  { group: 'reports', key: 'reports.view', ar: 'عرض التقارير', en: 'View Reports' },
  { group: 'reports', key: 'reports.export', ar: 'تصدير التقارير', en: 'Export Reports' },
  { group: 'branches', key: 'branches.view', ar: 'عرض الفروع', en: 'View Branches' },
  { group: 'branches', key: 'branches.manage', ar: 'إدارة الفروع', en: 'Manage Branches' },
  { group: 'permissions', key: 'permissions.view', ar: 'عرض الصلاحيات', en: 'View Permissions' },
  { group: 'permissions', key: 'permissions.manage', ar: 'إدارة الصلاحيات', en: 'Manage Permissions' },
  { group: 'permissions', key: 'users.manage', ar: 'إدارة المستخدمين', en: 'Manage Users' },
  { group: 'currencies', key: 'currencies.view', ar: 'عرض العملات', en: 'View Currencies' },
  { group: 'currencies', key: 'currencies.manage', ar: 'إدارة العملات', en: 'Manage Currencies' },
  { group: 'profitability', key: 'profitability.view', ar: 'عرض الربحية', en: 'View Profitability' },
  { group: 'profitability', key: 'profitability.export', ar: 'تصدير الربحية', en: 'Export Profitability' },
  { group: 'settings', key: 'settings.view', ar: 'عرض الإعدادات', en: 'View Settings' },
  { group: 'settings', key: 'settings.manage', ar: 'تعديل الإعدادات', en: 'Manage Settings' },
]
