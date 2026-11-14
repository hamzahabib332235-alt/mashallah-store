export type UnitType = 'piece' | 'packet' | 'dozen' | 'box' | 'carton';

export interface UnitConversion {
  unit: UnitType;
  multiplier: number; // e.g. 1 carton = 12 pieces or boxes
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  categoryName: string;
  unit: UnitType;
  packSize: number; // multiplier to base piece
  subUnitName?: UnitType;
  purchasePrice: number; // cost per primary unit in PKR
  wholesalePrice: number; // wholesale price per primary unit in PKR
  retailPrice: number; // retail price per primary unit in PKR
  currentStock: number; // in primary units
  minStockAlert: number;
  batchNo?: string;
  expiryDate?: string;
  image?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  creditLimit: number;
  outstandingBalance: number; // PKR
  createdAt: string;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  date: string;
  type: 'sale' | 'payment' | 'return';
  referenceNo: string;
  description: string;
  debit: number; // Increases receivable
  credit: number; // Decreases receivable (e.g. payment received)
  balance: number;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  address: string;
  payableBalance: number; // PKR
  createdAt: string;
}

export interface SupplierLedgerEntry {
  id: string;
  supplierId: string;
  date: string;
  type: 'purchase' | 'payment' | 'return';
  referenceNo: string;
  description: string;
  debit: number; // Payment made to supplier
  credit: number; // Purchase from supplier
  balance: number;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  unit: UnitType;
  quantity: number;
  priceType: 'wholesale' | 'retail';
  unitPrice: number;
  purchasePrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  paymentMethod: 'cash' | 'bank' | 'credit' | 'split';
  status: 'completed' | 'returned' | 'partial';
  cashierName: string;
  cashierId: string;
  receiptSize: '58mm' | '80mm';
  createdAt: string;
  returnReason?: string;
  returnedAt?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  unit: UnitType;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNo: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  date: string;
  paymentMethod: 'cash' | 'bank' | 'credit';
  status: 'received' | 'returned';
}

export type ExpenseCategory =
  | 'Shop Rent'
  | 'Electricity'
  | 'Employee Salaries'
  | 'Transport'
  | 'Internet'
  | 'Maintenance'
  | 'Other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'bank';
  recordedBy: string;
  notes?: string;
}

export type UserRole = 'admin' | 'manager' | 'cashier';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone?: string;
  pin?: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  change: number;
  reason: 'damage' | 'expired' | 'audit_correction' | 'theft' | 'other';
  notes?: string;
  adjustedBy: string;
  date: string;
}

export interface AppSettings {
  shopName: string;
  tagline: string;
  address: string;
  phone: string;
  ntn: string;
  currency: string;
  invoicePrefix: string;
  defaultReceiptSize: '58mm' | '80mm';
  taxRatePercent: number;
  receiptFooterMessage: string;
  lowStockThreshold: number;
  offlineMode: boolean;
}
