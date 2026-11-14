import React, { useState, useMemo } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { Invoice } from '@/types/wholesale';
import {
  Search,
  Receipt,
  Printer,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThermalReceipt } from '../ThermalReceipt';

export const SalesHistoryView: React.FC = () => {
  const { store, invoices, settings } = useWholesaleStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Return modal state
  const [returnInvoice, setReturnInvoice] = useState<Invoice | null>(null);
  const [returnReason, setReturnReason] = useState('Customer returned damaged or excess goods');

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const handleProcessReturn = () => {
    if (!returnInvoice) return;
    const ok = store.returnSale(returnInvoice.id, returnReason);
    if (ok) {
      alert(`Sale ${returnInvoice.invoiceNo} successfully returned. Stock restored to inventory.`);
      setReturnInvoice(null);
    } else {
      alert('Failed to return sale.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card border border-border p-4 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by Invoice No (e.g. MW-1001) or Customer Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden"
          >
            <option value="all">All Statuses ({invoices.length})</option>
            <option value="completed">Completed</option>
            <option value="partial">Partial Payment</option>
            <option value="returned">Returned / Refunded</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Invoice No</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Customer / Buyer</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-right">Total (PKR)</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Due</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                    No sales invoices found matching your search.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-foreground">
                      {inv.invoiceNo}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(inv.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {inv.customerName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded bg-muted px-2 py-0.5 font-bold">
                        {inv.items.reduce((s, i) => s + i.quantity, 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-foreground">
                      Rs. {inv.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      Rs. {inv.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {inv.balanceDue > 0 ? (
                        <span className="text-red-500">Rs. {inv.balanceDue.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 uppercase text-[11px] font-bold text-muted-foreground">
                      {inv.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          inv.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : inv.status === 'partial'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-red-500/15 text-red-600'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInvoice(inv)}
                          className="h-7 text-xs gap-1"
                          title="Print / View Thermal Receipt"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Receipt
                        </Button>

                        {inv.status !== 'returned' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setReturnInvoice(inv)}
                            className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-500/10 gap-1"
                            title="Return Sale / Reverse Stock"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Return
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Confirmation Modal */}
      {returnInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 text-red-600">
              <RotateCcw className="h-5 w-5" />
              Process Sales Return & Refund
            </h3>
            <p className="text-xs text-muted-foreground">
              Returning Invoice <strong>{returnInvoice.invoiceNo}</strong> (Total: Rs.{' '}
              {returnInvoice.total.toLocaleString()}).
              This will automatically restore items back into warehouse stock and reverse any Khata balance.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Return Reason</label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:outline-hidden"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setReturnInvoice(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleProcessReturn} className="bg-red-600 hover:bg-red-700 text-white font-bold">
                Confirm Return & Restore Stock
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Thermal Receipt Preview Modal */}
      {selectedInvoice && (
        <ThermalReceipt
          invoice={selectedInvoice}
          settings={settings}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};
