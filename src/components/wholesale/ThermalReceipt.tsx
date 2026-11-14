import React from 'react';
import { Invoice, AppSettings } from '@/types/wholesale';
import { Printer, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ThermalReceiptProps {
  invoice: Invoice;
  settings: AppSettings;
  customerPreviousBalance?: number;
  onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  invoice,
  settings,
  customerPreviousBalance = 0,
  onClose,
}) => {
  const [size, setSize] = React.useState<'58mm' | '80mm'>(invoice.receiptSize || settings.defaultReceiptSize);

  const handlePrint = () => {
    window.print();
  };

  const is58 = size === '58mm';
  const newBalance = customerPreviousBalance + invoice.balanceDue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[95vh] w-full max-w-md flex-col rounded-xl bg-card shadow-2xl border border-border">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Print Thermal Invoice</span>
            <div className="flex rounded-md border border-border bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSize('58mm')}
                className={`rounded px-2 py-0.5 font-medium transition-colors ${
                  is58 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                58mm
              </button>
              <button
                type="button"
                onClick={() => setSize('80mm')}
                className={`rounded px-2 py-0.5 font-medium transition-colors ${
                  !is58 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                80mm
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
              <Printer className="h-4 w-4" /> Print
            </Button>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Receipt Paper Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
          <div
            id="thermal-receipt"
            className={`mx-auto bg-white text-slate-900 shadow-md p-4 font-mono text-xs transition-all ${
              is58 ? 'w-[260px]' : 'w-[340px]'
            } print:w-full print:p-0 print:shadow-none`}
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            {/* Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3">
              <h1 className="text-base font-black tracking-wider uppercase">{settings.shopName}</h1>
              <p className="text-[11px] text-slate-600 font-sans mt-0.5">{settings.tagline}</p>
              <p className="text-[10px] text-slate-500 mt-1">{settings.address}</p>
              <p className="text-[10px] text-slate-700 font-bold">Tel: {settings.phone}</p>
              {settings.ntn && <p className="text-[10px] text-slate-500">NTN: {settings.ntn}</p>}
            </div>

            {/* Invoice Meta */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>INVOICE: <strong>{invoice.invoiceNo}</strong></span>
                <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier: {invoice.cashierName}</span>
                <span>{new Date(invoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="pt-1">
                <span>Customer: <strong>{invoice.customerName}</strong></span>
                {invoice.customerPhone && <div className="text-[10px] text-slate-600">Ph: {invoice.customerPhone}</div>}
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2 border-b border-dashed border-slate-400">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-slate-300 text-left">
                    <th className="pb-1">Item</th>
                    <th className="pb-1 text-center">Qty</th>
                    <th className="pb-1 text-right">Rate</th>
                    <th className="pb-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dotted divide-slate-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="py-1">
                      <td className="py-1 pr-1">
                        <div className="font-semibold line-clamp-1">{item.productName}</div>
                        <div className="text-[9px] text-slate-500 capitalize">{item.unit}</div>
                      </td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-right">{item.unitPrice.toLocaleString()}</td>
                      <td className="py-1 text-right font-bold">{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculation Totals */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs. {invoice.subtotal.toLocaleString()}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Special Discount:</span>
                  <span>- Rs. {invoice.discount.toLocaleString()}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>Rs. {invoice.tax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm border-t border-slate-300 pt-1">
                <span>NET TOTAL:</span>
                <span>Rs. {invoice.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment & Balance */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-semibold uppercase">{invoice.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-800">Rs. {invoice.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Bill Due:</span>
                <span className={`font-bold ${invoice.balanceDue > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                  Rs. {invoice.balanceDue.toLocaleString()}
                </span>
              </div>

              {invoice.customerId && (
                <div className="mt-1 pt-1 border-t border-dotted border-slate-300 text-[10px] space-y-0.5 bg-slate-50 p-1 rounded">
                  <div className="flex justify-between">
                    <span>Previous Outstanding (Udhaar):</span>
                    <span>Rs. {customerPreviousBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Total Outstanding Balance:</span>
                    <span>Rs. {newBalance.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Status / Refund info if returned */}
            {invoice.status === 'returned' && (
              <div className="my-2 border border-red-500 bg-red-50 p-1 text-center font-bold text-red-700">
                *** RETURNED / REFUNDED ***
                <div className="text-[10px] font-normal">{invoice.returnReason}</div>
              </div>
            )}

            {/* Barcode & Footer */}
            <div className="text-center pt-3 space-y-1">
              <div className="tracking-widest font-mono text-xs font-bold text-slate-800">
                * {invoice.invoiceNo} *
              </div>
              <div className="text-[9px] text-slate-500 font-sans leading-tight">
                {settings.receiptFooterMessage}
              </div>
              <div className="text-[8px] text-slate-400 pt-1">
                Software: MASHAALLAH WHOLESALE POS
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 border-t border-border p-3 print:hidden">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
            <Printer className="h-4 w-4" /> Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};
