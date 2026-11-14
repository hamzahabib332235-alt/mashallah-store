import React, { useState } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { BookOpen, Printer, Download, User, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerLedgerViewProps {
  initialCustomerId?: string;
}

export const CustomerLedgerView: React.FC<CustomerLedgerViewProps> = ({
  initialCustomerId,
}) => {
  const { customers, customerLedger, settings } = useWholesaleStore();
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialCustomerId || customers[0]?.id || ''
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const ledgerEntries = customerLedger
    .filter((entry) => entry.customerId === selectedCustomerId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Selector & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card border border-border p-4 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Customer Khata Ledger & Statement</h3>
            <p className="text-xs text-muted-foreground">
              Official running account statement for wholesale buyers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground font-semibold focus:outline-hidden"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Khata: Rs. {c.outstandingBalance.toLocaleString()})
              </option>
            ))}
          </select>

          <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
            <Printer className="h-4 w-4" /> Print Statement
          </Button>
        </div>
      </div>

      {/* Customer Header Box */}
      {selectedCustomer && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                Wholesale Account Statement
              </span>
              <h2 className="text-xl font-black text-foreground mt-0.5">
                {selectedCustomer.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ph: {selectedCustomer.phone} • {selectedCustomer.address}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Credit Limit</div>
                <div className="text-sm font-bold text-foreground">
                  Rs. {selectedCustomer.creditLimit.toLocaleString()}
                </div>
              </div>
              <div className="text-right border-l border-border pl-6">
                <div className="text-xs text-muted-foreground font-bold uppercase">
                  Net Outstanding (Udhaar)
                </div>
                <div className="text-2xl font-black text-orange-600 dark:text-orange-400">
                  Rs. {selectedCustomer.outstandingBalance.toLocaleString()}
                </div>
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
                  <th className="px-4 py-3 text-right">Debit (Sale / Bill)</th>
                  <th className="px-4 py-3 text-right">Credit (Payment Received)</th>
                  <th className="px-4 py-3 text-right">Running Balance (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No ledger transactions found for this customer.
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
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {e.debit > 0 ? `Rs. ${e.debit.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
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
              Generated by: {settings.shopName} POS System
            </div>
            <div>
              Date Printed: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
