import React, { useState } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { StockAdjustment } from '@/types/wholesale';
import {
  Boxes,
  AlertTriangle,
  Calendar,
  PlusCircle,
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const InventoryView: React.FC = () => {
  const { store, products, stockAdjustments, metrics } = useWholesaleStore();

  // Stock Adjustment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [newStock, setNewStock] = useState<number>(0);
  const [reason, setReason] = useState<StockAdjustment['reason']>('audit_correction');
  const [notes, setNotes] = useState('');

  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStockAlert);
  const expiringProducts = products.filter(
    (p) => p.expiryDate && new Date(p.expiryDate).getTime() < new Date().getTime() + 180 * 24 * 3600 * 1000
  );

  const selectedProduct = products.find((p) => p.id === selectedProdId);

  const handleOpenAdjustment = (prodId?: string) => {
    const id = prodId || products[0]?.id || '';
    setSelectedProdId(id);
    const prod = products.find((p) => p.id === id);
    setNewStock(prod ? prod.currentStock : 0);
    setReason('audit_correction');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdId) return;
    store.adjustStock(selectedProdId, newStock, reason, notes);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="text-xs font-semibold text-muted-foreground uppercase">
            Total Warehouse Valuation
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            Rs. {metrics.totalStockValue.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Based on purchase cost across all {products.length} SKUs
          </p>
        </div>

        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 shadow-xs">
          <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase flex items-center justify-between">
            <span>Low Stock Products</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="mt-1 text-2xl font-black text-red-600">
            {lowStockProducts.length} Items
          </div>
          <p className="text-[11px] text-red-600/80 mt-0.5">
            Below defined threshold quantity
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-xs">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase flex items-center justify-between">
            <span>Near Expiry Alerts</span>
            <Calendar className="h-4 w-4" />
          </div>
          <div className="mt-1 text-2xl font-black text-amber-600">
            {expiringProducts.length} Items
          </div>
          <p className="text-[11px] text-amber-600/80 mt-0.5">
            Expiring within upcoming 6 months
          </p>
        </div>
      </div>

      {/* Low Stock Warning Banner & Table */}
      {lowStockProducts.length > 0 && (
        <div className="rounded-xl border border-red-500/40 bg-card p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Urgent Stock Reorder Required</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenAdjustment(lowStockProducts[0].id)}
              className="text-xs"
            >
              Adjust Stock Count
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 p-3"
              >
                <div>
                  <div className="font-bold text-xs text-foreground">{p.name}</div>
                  <div className="text-[11px] text-red-600 font-medium">
                    Current: {p.currentStock} {p.unit}s (Min Alert: {p.minStockAlert})
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleOpenAdjustment(p.id)}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 px-2"
                >
                  Adjust
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Action Bar */}
      <div className="flex items-center justify-between rounded-xl bg-card border border-border p-4 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-foreground">Stock Adjustment & Damage Log</h3>
          <p className="text-xs text-muted-foreground">
            Audit count updates, damaged goods write-offs, and stock adjustments
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => handleOpenAdjustment()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
        >
          <PlusCircle className="h-4 w-4" /> Record Stock Adjustment
        </Button>
      </div>

      {/* Stock Adjustments Audit History Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3 text-center">Previous</th>
                <th className="px-4 py-3 text-center">New Stock</th>
                <th className="px-4 py-3 text-center">Change</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stockAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No manual stock adjustments recorded yet.
                  </td>
                </tr>
              ) : (
                stockAdjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(adj.date).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {adj.productName}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">{adj.previousStock}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-foreground">
                      {adj.newStock}
                    </td>
                    <td className="px-4 py-3 text-center font-bold">
                      <span
                        className={
                          adj.change > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : adj.change < 0
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                        }
                      >
                        {adj.change > 0 ? `+${adj.change}` : adj.change}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize">
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold">
                        {adj.reason.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{adj.adjustedBy}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                      {adj.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Record Stock Adjustment</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label>Select Product</Label>
                <select
                  value={selectedProdId}
                  onChange={(e) => {
                    setSelectedProdId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod) setNewStock(prod.currentStock);
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.currentStock} {p.unit}s)
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
                  Current System Stock: <strong>{selectedProduct.currentStock} {selectedProduct.unit}s</strong>
                </div>
              )}

              <div className="space-y-1">
                <Label>New Actual Counted Stock</Label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label>Reason for Adjustment</Label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as StockAdjustment['reason'])}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden capitalize"
                >
                  <option value="audit_correction">Audit / Stock-taking Count Correction</option>
                  <option value="damage">Damaged in Warehouse or Transit</option>
                  <option value="expired">Expired Goods Written Off</option>
                  <option value="theft">Lost or Theft</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label>Notes & Justification</Label>
                <textarea
                  rows={2}
                  placeholder="Reason details or authorization memo..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-md border border-border bg-background p-2 text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  Update Stock Count
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
