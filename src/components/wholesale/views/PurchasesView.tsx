import React, { useState } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { PurchaseItem } from '@/types/wholesale';
import {
  Truck,
  Plus,
  Trash2,
  DollarSign,
  Building2,
  Package,
  Calendar,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const PurchasesView: React.FC = () => {
  const { store, purchases, suppliers, products } = useWholesaleStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'credit'>('bank');

  // Form row item
  const [itemProdId, setItemProdId] = useState(products[0]?.id || '');
  const [itemQty, setItemQty] = useState<number>(10);
  const [itemCost, setItemCost] = useState<number>(products[0]?.purchasePrice || 5000);

  const totalAmount = purchaseItems.reduce((s, i) => s + i.total, 0);

  const handleOpenNewPurchase = () => {
    setSelectedSupplierId(suppliers[0]?.id || '');
    setPurchaseItems([]);
    setPaidAmount(0);
    setPaymentMethod('bank');
    setItemProdId(products[0]?.id || '');
    setItemQty(10);
    setItemCost(products[0]?.purchasePrice || 5000);
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    const prod = products.find((p) => p.id === itemProdId);
    if (!prod) return;

    const newItem: PurchaseItem = {
      productId: prod.id,
      productName: prod.name,
      unit: prod.unit,
      quantity: itemQty,
      unitCost: itemCost,
      total: itemQty * itemCost,
    };
    setPurchaseItems([...purchaseItems, newItem]);
    setPaidAmount(totalAmount + newItem.total); // default full pay
  };

  const handleRemoveItem = (idx: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== idx));
  };

  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0) {
      alert('Please add at least one item to this purchase order.');
      return;
    }

    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!supplier) {
      alert('Please select a supplier.');
      return;
    }

    store.createPurchase({
      supplierId: supplier.id,
      supplierName: `${supplier.name} (${supplier.company})`,
      items: purchaseItems,
      paidAmount,
      paymentMethod,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center justify-between rounded-xl bg-card border border-border p-4 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-foreground">Supplier Purchase Orders</h3>
          <p className="text-xs text-muted-foreground">
            Replenish inventory stock and manage vendor payables
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleOpenNewPurchase}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
        >
          <Plus className="h-4 w-4" /> Record Purchase (Receive Stock)
        </Button>
      </div>

      {/* Purchases Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">PO Number</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Supplier / Vendor</th>
                <th className="px-4 py-3 text-center">Items Received</th>
                <th className="px-4 py-3 text-right">Total Bill (PKR)</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Payable Balance</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    No purchase orders recorded yet.
                  </td>
                </tr>
              ) : (
                purchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-foreground">
                      {pur.purchaseNo}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(pur.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{pur.supplierName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded bg-muted px-2 py-0.5 font-bold">
                        {pur.items.reduce((s, i) => s + i.quantity, 0)} units
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-foreground">
                      Rs. {pur.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      Rs. {pur.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {pur.balanceDue > 0 ? (
                        <span className="text-red-500">Rs. {pur.balanceDue.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 uppercase text-[11px] font-bold text-muted-foreground">
                      {pur.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                        {pur.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Record Supplier Purchase & Replenish Stock
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPurchase} className="space-y-4 text-xs">
              <div>
                <Label>Select Supplier</Label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.company} (Payable: Rs. {s.payableBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Items Box */}
              <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                <span className="font-bold text-foreground text-xs uppercase tracking-wider">
                  Add Stock Line Item
                </span>

                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6 space-y-1">
                    <Label>Product</Label>
                    <select
                      value={itemProdId}
                      onChange={(e) => {
                        setItemProdId(e.target.value);
                        const p = products.find((prod) => prod.id === e.target.value);
                        if (p) setItemCost(p.purchasePrice);
                      }}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <Label>Unit Cost (Rs)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={itemCost}
                      onChange={(e) => setItemCost(Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full h-8 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold"
                    >
                      + Add
                    </Button>
                  </div>
                </div>

                {/* Added Items List */}
                {purchaseItems.length > 0 && (
                  <div className="mt-2 divide-y divide-border border-t border-border pt-2">
                    {purchaseItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1.5">
                        <div>
                          <span className="font-bold text-foreground">{item.productName}</span>
                          <span className="text-muted-foreground ml-2">
                            {item.quantity} {item.unit}s @ Rs. {item.unitCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-foreground">
                            Rs. {item.total.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total & Payment details */}
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                <div className="space-y-1">
                  <Label>Payment Mode</Label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                  >
                    <option value="bank">Bank Transfer / Cheque</option>
                    <option value="cash">Cash Payment</option>
                    <option value="credit">Credit / Full Payable (Udhaar)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label>Amount Paid Now (PKR)</Label>
                  <Input
                    type="number"
                    min="0"
                    max={totalAmount}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center bg-muted/40 p-3 rounded-lg border border-border">
                <div className="text-xs">
                  <span>Grand Total: </span>
                  <span className="font-black text-foreground text-sm">
                    Rs. {totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs">
                  <span>Payable Due: </span>
                  <span className="font-bold text-red-500">
                    Rs. {Math.max(0, totalAmount - paidAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  Receive & Update Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
