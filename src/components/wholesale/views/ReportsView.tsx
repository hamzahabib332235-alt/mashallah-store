import React, { useState } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Package,
  Users,
  Building2,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type ReportType =
  | 'daily_sales'
  | 'monthly_sales'
  | 'purchases'
  | 'stock_valuation'
  | 'customer_balances'
  | 'supplier_balances'
  | 'expenses';

export const ReportsView: React.FC = () => {
  const { invoices, purchases, products, customers, suppliers, expenses, settings } =
    useWholesaleStore();
  const [reportType, setReportType] = useState<ReportType>('daily_sales');

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `MASHAALLAH_WHOLESALE_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === 'daily_sales' || reportType === 'monthly_sales') {
      headers = ['Invoice No', 'Date', 'Customer', 'Items Count', 'Total PKR', 'Paid PKR', 'Due PKR', 'Status'];
      rows = invoices.map((i) => [
        i.invoiceNo,
        new Date(i.createdAt).toLocaleDateString(),
        `"${i.customerName}"`,
        i.items.length,
        i.total,
        i.paidAmount,
        i.balanceDue,
        i.status,
      ]);
    } else if (reportType === 'purchases') {
      headers = ['PO Number', 'Date', 'Supplier', 'Total PKR', 'Paid PKR', 'Due PKR', 'Status'];
      rows = purchases.map((p) => [
        p.purchaseNo,
        new Date(p.date).toLocaleDateString(),
        `"${p.supplierName}"`,
        p.totalAmount,
        p.paidAmount,
        p.balanceDue,
        p.status,
      ]);
    } else if (reportType === 'stock_valuation') {
      headers = ['SKU', 'Barcode', 'Product Name', 'Category', 'Unit', 'Stock Qty', 'Cost Price PKR', 'Total Value PKR'];
      rows = products.map((p) => [
        p.sku,
        p.barcode,
        `"${p.name}"`,
        `"${p.categoryName}"`,
        p.unit,
        p.currentStock,
        p.purchasePrice,
        p.currentStock * p.purchasePrice,
      ]);
    } else if (reportType === 'customer_balances') {
      headers = ['Customer Name', 'Phone', 'Address', 'Credit Limit PKR', 'Outstanding Balance (Udhaar) PKR'];
      rows = customers.map((c) => [
        `"${c.name}"`,
        c.phone,
        `"${c.address}"`,
        c.creditLimit,
        c.outstandingBalance,
      ]);
    } else if (reportType === 'supplier_balances') {
      headers = ['Supplier Name', 'Company', 'Phone', 'Payable Balance PKR'];
      rows = suppliers.map((s) => [
        `"${s.name}"`,
        `"${s.company}"`,
        s.phone,
        s.payableBalance,
      ]);
    } else if (reportType === 'expenses') {
      headers = ['Date', 'Category', 'Title', 'Amount PKR', 'Payment Method', 'Recorded By'];
      rows = expenses.map((e) => [
        new Date(e.date).toLocaleDateString(),
        e.category,
        `"${e.title}"`,
        e.amount,
        e.paymentMethod,
        `"${e.recordedBy}"`,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Action Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card border border-border p-4 shadow-xs print:hidden">
        <div>
          <h3 className="text-sm font-bold text-foreground">Audit Reports & Data Export</h3>
          <p className="text-xs text-muted-foreground">
            Generate and export financial, stock valuation, and receivables statements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={exportCSV}
            className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 gap-1.5"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export Excel / CSV
          </Button>
          <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
            <Printer className="h-4 w-4" /> Print Report
          </Button>
        </div>
      </div>

      {/* Report Types Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 print:hidden">
        {[
          { id: 'daily_sales', label: 'Sales Report', icon: BarChart3 },
          { id: 'purchases', label: 'Purchases Report', icon: Truck },
          { id: 'stock_valuation', label: 'Stock Valuation', icon: Package },
          { id: 'customer_balances', label: 'Customer Receivables (Udhaar)', icon: Users },
          { id: 'supplier_balances', label: 'Supplier Payables', icon: Building2 },
          { id: 'expenses', label: 'Expenses Report', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as ReportType)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Printable Report Document Paper */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs font-sans text-xs">
        {/* Document Header */}
        <div className="border-b border-border pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-black text-foreground uppercase tracking-wider">
              {settings.shopName}
            </h2>
            <p className="text-xs text-muted-foreground">{settings.address}</p>
            <p className="text-xs text-muted-foreground">Tel: {settings.phone} • NTN: {settings.ntn}</p>
          </div>
          <div className="text-right">
            <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-xs font-bold uppercase">
              {reportType.replace('_', ' ')}
            </span>
            <div className="text-xs text-muted-foreground mt-1">
              Date: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Dynamic Table Content */}
        <div className="mt-4 overflow-x-auto">
          {reportType === 'daily_sales' && (
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2">Invoice No</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2 text-right">Subtotal</th>
                  <th className="px-3 py-2 text-right">Discount</th>
                  <th className="px-3 py-2 text-right">Total Net</th>
                  <th className="px-3 py-2 text-right">Paid</th>
                  <th className="px-3 py-2 text-right">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-3 py-2 font-mono font-bold">{inv.invoiceNo}</td>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2 font-medium">{inv.customerName}</td>
                    <td className="px-3 py-2 text-right">Rs. {inv.subtotal.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-emerald-600">Rs. {inv.discount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-black">Rs. {inv.total.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-semibold text-emerald-600">Rs. {inv.paidAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-semibold text-red-500">
                      {inv.balanceDue > 0 ? `Rs. ${inv.balanceDue.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'purchases' && (
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2">PO No</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Supplier</th>
                  <th className="px-3 py-2 text-right">Total PKR</th>
                  <th className="px-3 py-2 text-right">Paid PKR</th>
                  <th className="px-3 py-2 text-right">Payable Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 font-mono font-bold">{p.purchaseNo}</td>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="px-3 py-2 font-medium">{p.supplierName}</td>
                    <td className="px-3 py-2 text-right font-black">Rs. {p.totalAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-semibold text-emerald-600">Rs. {p.paidAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-semibold text-rose-600">
                      {p.balanceDue > 0 ? `Rs. ${p.balanceDue.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'stock_valuation' && (
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2">SKU Code</th>
                  <th className="px-3 py-2">Product Name</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2 text-center">Current Stock</th>
                  <th className="px-3 py-2 text-right">Cost Price (WAC)</th>
                  <th className="px-3 py-2 text-right">Stock Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 font-mono font-bold">{p.sku}</td>
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.categoryName}</td>
                    <td className="px-3 py-2 text-center font-bold">{p.currentStock} {p.unit}s</td>
                    <td className="px-3 py-2 text-right">Rs. {p.purchasePrice.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-black text-emerald-600 dark:text-emerald-400">
                      Rs. {(p.currentStock * p.purchasePrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'customer_balances' && (
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2">Customer Shop Name</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Address</th>
                  <th className="px-3 py-2 text-right">Credit Limit</th>
                  <th className="px-3 py-2 text-right">Udhaar Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 font-bold">{c.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{c.phone}</td>
                    <td className="px-3 py-2 text-muted-foreground">{c.address}</td>
                    <td className="px-3 py-2 text-right">Rs. {c.creditLimit.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-black text-orange-600 dark:text-orange-400">
                      Rs. {c.outstandingBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'supplier_balances' && (
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2">Supplier Person</th>
                  <th className="px-3 py-2">Company / Factory</th>
                  <th className="px-3 py-2">Contact Phone</th>
                  <th className="px-3 py-2 text-right">Payable Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {suppliers.map((s) => (
                  <tr key={s.id}>
                    <td className="px-3 py-2 font-bold">{s.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{s.company}</td>
                    <td className="px-3 py-2 text-muted-foreground">{s.phone}</td>
                    <td className="px-3 py-2 text-right font-black text-rose-600 dark:text-rose-400">
                      Rs. {s.payableBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'expenses' && (
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Expense Details</th>
                  <th className="px-3 py-2">Recorded By</th>
                  <th className="px-3 py-2 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-3 py-2 font-bold">{e.category}</td>
                    <td className="px-3 py-2 font-medium">{e.title}</td>
                    <td className="px-3 py-2 text-muted-foreground">{e.recordedBy}</td>
                    <td className="px-3 py-2 text-right font-black text-rose-600 dark:text-rose-400">
                      Rs. {e.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
