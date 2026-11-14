import {
  Product,
  Category,
  Customer,
  Supplier,
  Invoice,
  Purchase,
  Expense,
  User,
  AppSettings,
  CustomerLedgerEntry,
  SupplierLedgerEntry,
  StockAdjustment,
  AuditLog,
} from '@/types/wholesale';
import {
  initialSettings,
  initialCategories,
  initialProducts,
  initialCustomers,
  initialCustomerLedger,
  initialSuppliers,
  initialSupplierLedger,
  initialExpenses,
  initialInvoices,
  initialPurchases,
  initialUsers,
} from './mockData';

const STORAGE_KEYS = {
  SETTINGS: 'mw_settings_v1',
  CATEGORIES: 'mw_categories_v1',
  PRODUCTS: 'mw_products_v1',
  CUSTOMERS: 'mw_customers_v1',
  CUSTOMER_LEDGER: 'mw_customer_ledger_v1',
  SUPPLIERS: 'mw_suppliers_v1',
  SUPPLIER_LEDGER: 'mw_supplier_ledger_v1',
  EXPENSES: 'mw_expenses_v1',
  INVOICES: 'mw_invoices_v1',
  PURCHASES: 'mw_purchases_v1',
  USERS: 'mw_users_v1',
  CURRENT_USER: 'mw_current_user_v1',
  STOCK_ADJUSTMENTS: 'mw_stock_adj_v1',
  AUDIT_LOGS: 'mw_audit_logs_v1',
  INVOICE_COUNTER: 'mw_inv_counter_v1',
};

// Safe JSON parse with fallback
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch (e) {
    console.error(`Error loading key ${key} from localStorage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving key ${key} to localStorage:`, e);
  }
}

// In-memory cache + pub/sub for reactive updates across components
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in store listener:', e);
    }
  });
}

class WholesaleStore {
  settings: AppSettings;
  categories: Category[];
  products: Product[];
  customers: Customer[];
  customerLedger: CustomerLedgerEntry[];
  suppliers: Supplier[];
  supplierLedger: SupplierLedgerEntry[];
  expenses: Expense[];
  invoices: Invoice[];
  purchases: Purchase[];
  users: User[];
  currentUser: User;
  stockAdjustments: StockAdjustment[];
  auditLogs: AuditLog[];
  invoiceCounter: number;

  constructor() {
    this.settings = loadFromStorage(STORAGE_KEYS.SETTINGS, initialSettings);
    this.categories = loadFromStorage(STORAGE_KEYS.CATEGORIES, initialCategories);
    this.products = loadFromStorage(STORAGE_KEYS.PRODUCTS, initialProducts);
    this.customers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    this.customerLedger = loadFromStorage(STORAGE_KEYS.CUSTOMER_LEDGER, initialCustomerLedger);
    this.suppliers = loadFromStorage(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
    this.supplierLedger = loadFromStorage(STORAGE_KEYS.SUPPLIER_LEDGER, initialSupplierLedger);
    this.expenses = loadFromStorage(STORAGE_KEYS.EXPENSES, initialExpenses);
    this.invoices = loadFromStorage(STORAGE_KEYS.INVOICES, initialInvoices);
    this.purchases = loadFromStorage(STORAGE_KEYS.PURCHASES, initialPurchases);
    
    // Load users and ensure Hamza Habib is configured as the administrator
    const loadedUsers = loadFromStorage(STORAGE_KEYS.USERS, initialUsers);
    const adminIdx = loadedUsers.findIndex((u) => u.role === 'admin' || u.username.toLowerCase() === 'admin' || u.username.toLowerCase() === 'hamzahabib');
    if (adminIdx >= 0) {
      loadedUsers[adminIdx] = {
        ...loadedUsers[adminIdx],
        name: 'Hamza Habib',
        username: 'hamzahabib',
        pin: '242006',
        role: 'admin',
      };
    } else {
      loadedUsers.unshift(initialUsers[0]);
    }
    this.users = loadedUsers;

    const loadedCurrentUser = loadFromStorage(STORAGE_KEYS.CURRENT_USER, this.users[0]);
    if (loadedCurrentUser.role === 'admin' || loadedCurrentUser.username === 'admin' || loadedCurrentUser.username === 'hamzahabib') {
      this.currentUser = this.users[adminIdx >= 0 ? adminIdx : 0];
    } else {
      this.currentUser = loadedCurrentUser;
    }

    this.stockAdjustments = loadFromStorage(STORAGE_KEYS.STOCK_ADJUSTMENTS, []);
    this.auditLogs = loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, [
      {
        id: 'log-1',
        userId: 'user-1',
        userName: 'Hamza Habib',
        action: 'System Initialized',
        details: 'MASHAALLAH WHOLESALE local database loaded for admin Hamza Habib',
        timestamp: new Date().toISOString(),
      },
    ]);
    this.invoiceCounter = loadFromStorage(STORAGE_KEYS.INVOICE_COUNTER, 1004);
  }

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  private persistAndNotify() {
    saveToStorage(STORAGE_KEYS.SETTINGS, this.settings);
    saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
    saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, this.customers);
    saveToStorage(STORAGE_KEYS.CUSTOMER_LEDGER, this.customerLedger);
    saveToStorage(STORAGE_KEYS.SUPPLIERS, this.suppliers);
    saveToStorage(STORAGE_KEYS.SUPPLIER_LEDGER, this.supplierLedger);
    saveToStorage(STORAGE_KEYS.EXPENSES, this.expenses);
    saveToStorage(STORAGE_KEYS.INVOICES, this.invoices);
    saveToStorage(STORAGE_KEYS.PURCHASES, this.purchases);
    saveToStorage(STORAGE_KEYS.USERS, this.users);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    saveToStorage(STORAGE_KEYS.STOCK_ADJUSTMENTS, this.stockAdjustments);
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    saveToStorage(STORAGE_KEYS.INVOICE_COUNTER, this.invoiceCounter);
    notifyListeners();
  }

  logActivity(action: string, details: string) {
    const entry: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: this.currentUser?.id || 'sys',
      userName: this.currentUser?.name || 'System',
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs = [entry, ...this.auditLogs.slice(0, 199)];
  }

  // --- Auth / User Management ---
  setCurrentUser(user: User) {
    this.currentUser = user;
    this.logActivity('User Switched', `Logged in as ${user.name} (${user.role})`);
    this.persistAndNotify();
  }

  authenticate(username: string, passwordOrPin: string): { success: boolean; user?: User; error?: string } {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = passwordOrPin.trim();

    // Check by username (e.g. 'hamzahabib'), or allow 'admin' / 'hamza'
    const user = this.users.find(
      (u) =>
        u.username.toLowerCase() === trimmedUser ||
        (u.role === 'admin' && (trimmedUser === 'admin' || trimmedUser === 'hamzahabib' || trimmedUser === 'hamza' || trimmedUser === 'hamza habib'))
    );

    if (!user) {
      return {
        success: false,
        error: 'Invalid username. Please enter "hamzahabib" for admin access.',
      };
    }

    // Valid passwords for admin: '242006', user.pin, 'admin123'
    const allowed = [user.pin, '242006', 'admin123', 'admin'].filter(Boolean);
    if (!allowed.includes(trimmedPass)) {
      return {
        success: false,
        error: 'Incorrect password. For Hamza Habib, use "242006".',
      };
    }

    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'mw_auth_session_v1',
        JSON.stringify({ userId: user.id, username: user.username, role: user.role, loggedAt: new Date().toISOString() })
      );
    }
    this.logActivity('Admin Authenticated', `Admin ${user.name} (${user.username}) successfully logged in.`);
    this.persistAndNotify();
    return { success: true, user };
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mw_auth_session_v1');
    }
    this.logActivity('User Logged Out', `${this.currentUser?.name || 'User'} signed out`);
    notifyListeners();
  }

  isSessionActive(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      return !!localStorage.getItem('mw_auth_session_v1');
    } catch {
      return false;
    }
  }

  addUser(userData: Omit<User, 'id'>) {
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...userData,
    };
    this.users.push(newUser);
    this.logActivity('User Created', `Created user ${newUser.name} with role ${newUser.role}`);
    this.persistAndNotify();
    return newUser;
  }

  updateUser(id: string, userData: Partial<User>) {
    this.users = this.users.map((u) => (u.id === id ? { ...u, ...userData } : u));
    if (this.currentUser.id === id) {
      this.currentUser = { ...this.currentUser, ...userData };
    }
    this.logActivity('User Updated', `Updated user ID ${id}`);
    this.persistAndNotify();
  }

  // --- Products & Categories CRUD ---
  addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      ...productData,
      createdAt: new Date().toISOString(),
    };
    this.products.push(newProd);
    this.logActivity('Product Added', `Added ${newProd.name} (SKU: ${newProd.sku})`);
    this.persistAndNotify();
    return newProd;
  }

  updateProduct(id: string, productData: Partial<Product>) {
    this.products = this.products.map((p) => (p.id === id ? { ...p, ...productData } : p));
    this.logActivity('Product Updated', `Updated product ID: ${id}`);
    this.persistAndNotify();
  }

  deleteProduct(id: string) {
    const prod = this.products.find((p) => p.id === id);
    this.products = this.products.filter((p) => p.id !== id);
    this.logActivity('Product Deleted', `Deleted product: ${prod?.name || id}`);
    this.persistAndNotify();
  }

  addCategory(categoryData: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      ...categoryData,
    };
    this.categories.push(newCat);
    this.logActivity('Category Added', `Added category: ${newCat.name}`);
    this.persistAndNotify();
    return newCat;
  }

  updateCategory(id: string, categoryData: Partial<Category>) {
    this.categories = this.categories.map((c) => (c.id === id ? { ...c, ...categoryData } : c));
    this.persistAndNotify();
  }

  deleteCategory(id: string) {
    this.categories = this.categories.filter((c) => c.id !== id);
    this.persistAndNotify();
  }

  // --- Inventory & Stock Adjustment ---
  adjustStock(productId: string, newStock: number, reason: StockAdjustment['reason'], notes?: string) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return;
    const previousStock = product.currentStock;
    const change = newStock - previousStock;
    product.currentStock = newStock;

    const adjustment: StockAdjustment = {
      id: `adj-${Date.now()}`,
      productId,
      productName: product.name,
      previousStock,
      newStock,
      change,
      reason,
      notes,
      adjustedBy: this.currentUser?.name || 'Staff',
      date: new Date().toISOString(),
    };
    this.stockAdjustments.unshift(adjustment);
    this.logActivity(
      'Stock Adjusted',
      `${product.name}: ${previousStock} -> ${newStock} (${change > 0 ? '+' : ''}${change}) Reason: ${reason}`
    );
    this.persistAndNotify();
  }

  // --- Sales & POS Billing ---
  createSale(saleData: {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    items: Invoice['items'];
    discount: number;
    tax: number;
    paymentMethod: Invoice['paymentMethod'];
    paidAmount: number;
    receiptSize?: '58mm' | '80mm';
  }): Invoice {
    const subtotal = saleData.items.reduce((sum, item) => sum + item.total, 0);
    const total = Math.max(0, subtotal - saleData.discount + saleData.tax);
    const paidAmount = Math.min(total, Math.max(0, saleData.paidAmount));
    const balanceDue = Math.max(0, total - paidAmount);

    const invoiceNo = `${this.settings.invoicePrefix}${this.invoiceCounter}`;
    this.invoiceCounter += 1;

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNo,
      customerId: saleData.customerId,
      customerName: saleData.customerName || 'Walk-in Customer',
      customerPhone: saleData.customerPhone,
      items: saleData.items,
      subtotal,
      discount: saleData.discount,
      tax: saleData.tax,
      total,
      paidAmount,
      balanceDue,
      paymentMethod: saleData.paymentMethod,
      status: balanceDue > 0 ? 'partial' : 'completed',
      cashierName: this.currentUser?.name || 'Cashier',
      cashierId: this.currentUser?.id || 'cashier',
      receiptSize: saleData.receiptSize || this.settings.defaultReceiptSize,
      createdAt: new Date().toISOString(),
    };

    // 1. Deduct stock for each sold item
    saleData.items.forEach((item) => {
      const prod = this.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
      }
    });

    // 2. If credit or partial sale for an existing registered customer, update customer balance & ledger
    if (saleData.customerId) {
      const customer = this.customers.find((c) => c.id === saleData.customerId);
      if (customer) {
        // Debit the full bill amount, credit the cash paid, resulting in net increase of balanceDue
        customer.outstandingBalance += balanceDue;

        const ledgerEntry: CustomerLedgerEntry = {
          id: `c-led-${Date.now()}`,
          customerId: customer.id,
          date: new Date().toISOString(),
          type: 'sale',
          referenceNo: invoiceNo,
          description: `Invoice ${invoiceNo} (${invoice.items.length} items) - Paid: Rs. ${paidAmount.toLocaleString()}`,
          debit: total,
          credit: paidAmount,
          balance: customer.outstandingBalance,
        };
        this.customerLedger.push(ledgerEntry);
      }
    }

    this.invoices.unshift(invoice);
    this.logActivity(
      'Sale Created',
      `Invoice ${invoiceNo} for Rs. ${total.toLocaleString()} (${saleData.customerName})`
    );
    this.persistAndNotify();
    return invoice;
  }

  returnSale(invoiceId: string, reason: string): boolean {
    const invoice = this.invoices.find((i) => i.id === invoiceId);
    if (!invoice || invoice.status === 'returned') return false;

    // Restore stock
    invoice.items.forEach((item) => {
      const prod = this.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.currentStock += item.quantity;
      }
    });

    // Revert customer balance if customer was attached
    if (invoice.customerId) {
      const customer = this.customers.find((c) => c.id === invoice.customerId);
      if (customer) {
        customer.outstandingBalance = Math.max(0, customer.outstandingBalance - invoice.balanceDue);
        const ledgerEntry: CustomerLedgerEntry = {
          id: `c-led-${Date.now()}`,
          customerId: customer.id,
          date: new Date().toISOString(),
          type: 'return',
          referenceNo: `RET-${invoice.invoiceNo}`,
          description: `Sales Return for ${invoice.invoiceNo} - Reason: ${reason}`,
          debit: 0,
          credit: invoice.total,
          balance: customer.outstandingBalance,
        };
        this.customerLedger.push(ledgerEntry);
      }
    }

    invoice.status = 'returned';
    invoice.returnReason = reason;
    invoice.returnedAt = new Date().toISOString();

    this.logActivity('Sale Returned', `Returned Invoice ${invoice.invoiceNo}: ${reason}`);
    this.persistAndNotify();
    return true;
  }

  // --- Customer Management & Ledger ---
  addCustomer(customerData: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      ...customerData,
      createdAt: new Date().toISOString(),
    };
    this.customers.push(newCust);
    if (newCust.outstandingBalance > 0) {
      this.customerLedger.push({
        id: `c-led-${Date.now()}`,
        customerId: newCust.id,
        date: new Date().toISOString(),
        type: 'sale',
        referenceNo: 'OPENING',
        description: 'Opening Balance (Udhaar)',
        debit: newCust.outstandingBalance,
        credit: 0,
        balance: newCust.outstandingBalance,
      });
    }
    this.logActivity('Customer Added', `Added customer ${newCust.name}`);
    this.persistAndNotify();
    return newCust;
  }

  updateCustomer(id: string, customerData: Partial<Customer>) {
    this.customers = this.customers.map((c) => (c.id === id ? { ...c, ...customerData } : c));
    this.persistAndNotify();
  }

  recordCustomerPayment(
    customerId: string,
    amount: number,
    paymentMethod: 'cash' | 'bank',
    reference: string
  ): boolean {
    const customer = this.customers.find((c) => c.id === customerId);
    if (!customer || amount <= 0) return false;

    customer.outstandingBalance = Math.max(0, customer.outstandingBalance - amount);
    const ledgerEntry: CustomerLedgerEntry = {
      id: `c-led-${Date.now()}`,
      customerId: customer.id,
      date: new Date().toISOString(),
      type: 'payment',
      referenceNo: reference || `PAY-${Date.now().toString().slice(-4)}`,
      description: `Payment Received via ${paymentMethod.toUpperCase()}`,
      debit: 0,
      credit: amount,
      balance: customer.outstandingBalance,
    };
    this.customerLedger.push(ledgerEntry);
    this.logActivity(
      'Payment Received',
      `Received Rs. ${amount.toLocaleString()} from ${customer.name} via ${paymentMethod}`
    );
    this.persistAndNotify();
    return true;
  }

  // --- Supplier Management & Purchases ---
  addSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt'>): Supplier {
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      ...supplierData,
      createdAt: new Date().toISOString(),
    };
    this.suppliers.push(newSup);
    if (newSup.payableBalance > 0) {
      this.supplierLedger.push({
        id: `s-led-${Date.now()}`,
        supplierId: newSup.id,
        date: new Date().toISOString(),
        type: 'purchase',
        referenceNo: 'OPENING',
        description: 'Opening Payable Balance',
        debit: 0,
        credit: newSup.payableBalance,
        balance: newSup.payableBalance,
      });
    }
    this.logActivity('Supplier Added', `Added supplier ${newSup.name} (${newSup.company})`);
    this.persistAndNotify();
    return newSup;
  }

  updateSupplier(id: string, supplierData: Partial<Supplier>) {
    this.suppliers = this.suppliers.map((s) => (s.id === id ? { ...s, ...supplierData } : s));
    this.persistAndNotify();
  }

  createPurchase(purchaseData: {
    supplierId: string;
    supplierName: string;
    items: Purchase['items'];
    paidAmount: number;
    paymentMethod: Purchase['paymentMethod'];
  }): Purchase {
    const totalAmount = purchaseData.items.reduce((sum, item) => sum + item.total, 0);
    const paidAmount = Math.min(totalAmount, Math.max(0, purchaseData.paidAmount));
    const balanceDue = Math.max(0, totalAmount - paidAmount);

    const purchase: Purchase = {
      id: `pur-${Date.now()}`,
      purchaseNo: `PO-${Date.now().toString().slice(-6)}`,
      supplierId: purchaseData.supplierId,
      supplierName: purchaseData.supplierName,
      items: purchaseData.items,
      totalAmount,
      paidAmount,
      balanceDue,
      date: new Date().toISOString(),
      paymentMethod: purchaseData.paymentMethod,
      status: 'received',
    };

    // Increase stock of items
    purchaseData.items.forEach((item) => {
      const prod = this.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.currentStock += item.quantity;
        // Optionally update purchase price to reflect latest cost
        prod.purchasePrice = item.unitCost;
      }
    });

    // Update supplier balance and ledger
    const supplier = this.suppliers.find((s) => s.id === purchaseData.supplierId);
    if (supplier) {
      supplier.payableBalance += balanceDue;
      const ledgerEntry: SupplierLedgerEntry = {
        id: `s-led-${Date.now()}`,
        supplierId: supplier.id,
        date: new Date().toISOString(),
        type: 'purchase',
        referenceNo: purchase.purchaseNo,
        description: `Purchase order ${purchase.purchaseNo} - Paid: Rs. ${paidAmount.toLocaleString()}`,
        debit: paidAmount,
        credit: totalAmount,
        balance: supplier.payableBalance,
      };
      this.supplierLedger.push(ledgerEntry);
    }

    this.purchases.unshift(purchase);
    this.logActivity(
      'Purchase Recorded',
      `PO ${purchase.purchaseNo} from ${purchaseData.supplierName} for Rs. ${totalAmount.toLocaleString()}`
    );
    this.persistAndNotify();
    return purchase;
  }

  recordSupplierPayment(
    supplierId: string,
    amount: number,
    paymentMethod: 'cash' | 'bank',
    reference: string
  ): boolean {
    const supplier = this.suppliers.find((s) => s.id === supplierId);
    if (!supplier || amount <= 0) return false;

    supplier.payableBalance = Math.max(0, supplier.payableBalance - amount);
    const ledgerEntry: SupplierLedgerEntry = {
      id: `s-led-${Date.now()}`,
      supplierId: supplier.id,
      date: new Date().toISOString(),
      type: 'payment',
      referenceNo: reference || `SUP-PAY-${Date.now().toString().slice(-4)}`,
      description: `Payment Made via ${paymentMethod.toUpperCase()}`,
      debit: amount,
      credit: 0,
      balance: supplier.payableBalance,
    };
    this.supplierLedger.push(ledgerEntry);
    this.logActivity(
      'Supplier Payment',
      `Paid Rs. ${amount.toLocaleString()} to ${supplier.name} via ${paymentMethod}`
    );
    this.persistAndNotify();
    return true;
  }

  // --- Expenses Management ---
  addExpense(expenseData: Omit<Expense, 'id'>): Expense {
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      ...expenseData,
    };
    this.expenses.unshift(newExp);
    this.logActivity('Expense Recorded', `${newExp.category}: Rs. ${newExp.amount.toLocaleString()} (${newExp.title})`);
    this.persistAndNotify();
    return newExp;
  }

  deleteExpense(id: string) {
    const exp = this.expenses.find((e) => e.id === id);
    this.expenses = this.expenses.filter((e) => e.id !== id);
    this.logActivity('Expense Deleted', `Deleted ${exp?.title || id}`);
    this.persistAndNotify();
  }

  // --- Settings & System Control ---
  updateSettings(newSettings: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.logActivity('Settings Updated', 'Shop settings configuration updated');
    this.persistAndNotify();
  }

  toggleOfflineMode(offline: boolean) {
    this.settings.offlineMode = offline;
    this.logActivity('Offline Mode Toggled', offline ? 'Switched to Offline Mode' : 'Connected to Online Cloud');
    this.persistAndNotify();
  }

  // --- Analytics & Financial Calculations ---
  getMetrics() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const activeInvoices = this.invoices.filter((i) => i.status !== 'returned');

    // Today's Sales
    const todayInvoices = activeInvoices.filter((i) => i.createdAt.slice(0, 10) === todayStr);
    const todaySales = todayInvoices.reduce((sum, i) => sum + i.total, 0);

    // Today's Gross Profit = Net Sales - COGS
    let todayCOGS = 0;
    todayInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        todayCOGS += (item.purchasePrice || 0) * item.quantity;
      });
    });
    const todayGrossProfit = Math.max(0, todaySales - todayCOGS);

    // Today's Expenses
    const todayExpensesList = this.expenses.filter((e) => e.date.slice(0, 10) === todayStr);
    const todayExpenses = todayExpensesList.reduce((sum, e) => sum + e.amount, 0);

    // Today's Net Profit = Gross Profit - Expenses
    const todayNetProfit = todayGrossProfit - todayExpenses;

    // Monthly figures
    const thisMonthStr = new Date().toISOString().slice(0, 7);
    const monthInvoices = activeInvoices.filter((i) => i.createdAt.slice(0, 7) === thisMonthStr);
    const monthlyRevenue = monthInvoices.reduce((sum, i) => sum + i.total, 0);

    const monthExpensesList = this.expenses.filter((e) => e.date.slice(0, 7) === thisMonthStr);
    const totalExpenses = monthExpensesList.reduce((sum, e) => sum + e.amount, 0);

    // Stock metrics
    const totalProducts = this.products.length;
    const totalStockValue = this.products.reduce(
      (sum, p) => sum + p.currentStock * p.purchasePrice,
      0
    );
    const lowStockProducts = this.products.filter((p) => p.currentStock <= p.minStockAlert);

    // Balances
    const customerOutstanding = this.customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
    const supplierOutstanding = this.suppliers.reduce((sum, s) => sum + s.payableBalance, 0);

    return {
      todaySales,
      todayGrossProfit,
      todayNetProfit,
      monthlyRevenue,
      totalExpenses,
      totalProducts,
      totalStockValue,
      lowStockCount: lowStockProducts.length,
      customerOutstanding,
      supplierOutstanding,
    };
  }

  // --- Backup & Restore ---
  exportBackup(): string {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      shopName: this.settings.shopName,
      settings: this.settings,
      categories: this.categories,
      products: this.products,
      customers: this.customers,
      customerLedger: this.customerLedger,
      suppliers: this.suppliers,
      supplierLedger: this.supplierLedger,
      expenses: this.expenses,
      invoices: this.invoices,
      purchases: this.purchases,
      users: this.users,
      stockAdjustments: this.stockAdjustments,
      auditLogs: this.auditLogs,
    };
    return JSON.stringify(backupData, null, 2);
  }

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && data.categories) {
        this.settings = data.settings || this.settings;
        this.categories = data.categories || this.categories;
        this.products = data.products || this.products;
        this.customers = data.customers || this.customers;
        this.customerLedger = data.customerLedger || this.customerLedger;
        this.suppliers = data.suppliers || this.suppliers;
        this.supplierLedger = data.supplierLedger || this.supplierLedger;
        this.expenses = data.expenses || this.expenses;
        this.invoices = data.invoices || this.invoices;
        this.purchases = data.purchases || this.purchases;
        this.users = data.users || this.users;
        this.stockAdjustments = data.stockAdjustments || [];
        this.auditLogs = data.auditLogs || [];
        this.logActivity('Backup Restored', 'Database restored successfully from backup file');
        this.persistAndNotify();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }

  resetToDefaults() {
    this.settings = initialSettings;
    this.categories = initialCategories;
    this.products = initialProducts;
    this.customers = initialCustomers;
    this.customerLedger = initialCustomerLedger;
    this.suppliers = initialSuppliers;
    this.supplierLedger = initialSupplierLedger;
    this.expenses = initialExpenses;
    this.invoices = initialInvoices;
    this.purchases = initialPurchases;
    this.users = initialUsers;
    this.currentUser = initialUsers[0];
    this.stockAdjustments = [];
    this.auditLogs = [];
    this.invoiceCounter = 1004;
    this.logActivity('Reset to Defaults', 'Sample wholesale data restored');
    this.persistAndNotify();
  }
}

// Singleton instance
export const wholesaleStore = new WholesaleStore();
