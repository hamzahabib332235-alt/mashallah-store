import React, { useState } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { Building2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SupplierLedgerView: React.FC = () => {
  const { suppliers, supplierLedger, settings } = useWholesaleStore();
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
  const ledgerEntries = supplierLedger
    .filter((entry) => entry.supplierId === selectedSupplierId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Selector & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card border border-border p-4 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Supplier Payable Ledger & Statement</h3>
            <p className="text-xs text-muted-foreground">
              Official running account statement for factory suppliers & distributors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground font-semibold focus:outline-hidden"
          >
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.company}) — Payable: Rs. {s.payableBalance.toLocaleString()}
              </option>
            ))}
          </select>

          <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
            <Printer className="h-4 w-4" /> Print Statement
          </Button>
        </div>
      </div>

      {/* Supplier Header Box */}
      {selectedSupplier && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                Supplier Vendor Statement
              </span>
              <h2 className="text-xl font-black text-foreground mt-0.5">
                {selectedSupplier.name} ({selectedSupplier.company})
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ph: {selectedSupplier.phone} • {selectedSupplier.address}
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-muted-foreground font-bold uppercase">
                Net Payable Balance
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                Rs. {selectedSupplier.payableBalance.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Ref No</th>
                  <th className="px-4 py-3">Transaction Description</th>
                  <th className="px-4 py-3 text-right">Debit (Payment Made)</th>
                  <th className="px-4 py-3 text-right">Credit (Purchase / Stock)</th>
                  <th className="px-4 py-3 text-right">Running Balance (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No ledger records found for this vendor.
                    </td>
                  </tr>
                ) : (
                  ledgerEntries.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {new Date(e.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-foreground">
                        {e.referenceNo}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{e.description}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {e.debit > 0 ? `Rs. ${e.debit.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {e.credit > 0 ? `Rs. ${e.credit.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-foreground">
                        Rs. {e.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Statement Footer */}
          <div className="mt-6 flex justify-between items-center border-t border-border pt-4 text-xs text-muted-foreground">
            <div>
              Account Statement • {settings.shopName}
            </div>
            <div>
              Printed: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
