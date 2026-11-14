import React, { useState, useMemo } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { Product, UnitType } from '@/types/wholesale';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Barcode,
  Layers,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const ProductsView: React.FC = () => {
  const { store, products, categories } = useWholesaleStore();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [unit, setUnit] = useState<UnitType>('carton');
  const [packSize, setPackSize] = useState<number>(1);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(10);
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search);
      const matchCat = selectedCat === 'all' || p.categoryId === selectedCat;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCat]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setSku(`MW-SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setBarcode(`8964000${Math.floor(100000 + Math.random() * 900000)}`);
    setCategoryId(categories[0]?.id || '');
    setUnit('carton');
    setPackSize(12);
    setPurchasePrice(5000);
    setWholesalePrice(5400);
    setRetailPrice(5800);
    setCurrentStock(50);
    setMinStockAlert(15);
    setBatchNo(`B-${new Date().getFullYear()}-01`);
    setExpiryDate('2028-12-31');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setBarcode(p.barcode);
    setCategoryId(p.categoryId);
    setUnit(p.unit);
    setPackSize(p.packSize || 1);
    setPurchasePrice(p.purchasePrice);
    setWholesalePrice(p.wholesalePrice);
    setRetailPrice(p.retailPrice);
    setCurrentStock(p.currentStock);
    setMinStockAlert(p.minStockAlert);
    setBatchNo(p.batchNo || '');
    setExpiryDate(p.expiryDate || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Product name is required');
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);
    const categoryName = cat ? cat.name : 'General';

    if (editingProduct) {
      store.updateProduct(editingProduct.id, {
        name,
        sku,
        barcode,
        categoryId,
        categoryName,
        unit,
        packSize,
        purchasePrice,
        wholesalePrice,
        retailPrice,
        currentStock,
        minStockAlert,
        batchNo,
        expiryDate,
      });
    } else {
      store.addProduct({
        name,
        sku,
        barcode,
        categoryId,
        categoryName,
        unit,
        packSize,
        purchasePrice,
        wholesalePrice,
        retailPrice,
        currentStock,
        minStockAlert,
        batchNo,
        expiryDate,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, prodName: string) => {
    if (confirm(`Are you sure you want to delete ${prodName}?`)) {
      store.deleteProduct(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card border border-border p-4 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products by Name, SKU or Barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Product Name & SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Unit & Pack</th>
                <th className="px-4 py-3 text-right">Cost (Purchase)</th>
                <th className="px-4 py-3 text-right">Wholesale Rate</th>
                <th className="px-4 py-3 text-right">Retail Rate</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3">Batch & Expiry</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    No wholesale products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.currentStock <= p.minStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-foreground">{p.name}</div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                          <span>SKU: {p.sku}</span>
                          <span>•</span>
                          <span>Bar: {p.barcode}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.categoryName}</td>
                      <td className="px-4 py-3 capitalize">
                        <span className="font-semibold text-foreground">{p.unit}</span>
                        {p.packSize > 1 && (
                          <div className="text-[10px] text-muted-foreground">
                            1 {p.unit} = {p.packSize} pcs
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Rs. {p.purchasePrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        Rs. {p.wholesalePrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        Rs. {p.retailPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-bold ${
                            isLow
                              ? 'bg-red-500/15 text-red-600'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {p.currentStock} {p.unit}s
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-muted-foreground">
                        <div>Batch: {p.batchNo || 'N/A'}</div>
                        <div className="text-[10px]">Exp: {p.expiryDate || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEdit(p)}
                            className="h-7 w-7 p-0"
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(p.id, p.name)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingProduct ? 'Edit Wholesale Product' : 'Add New Wholesale Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label>Product Title / Description</Label>
                  <Input
                    required
                    placeholder="e.g. Mughal Super Basmati Rice (25kg Bag)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label>SKU Code</Label>
                  <Input
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Barcode (EAN-13)</Label>
                  <Input
                    required
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Category</Label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label>Primary Unit</Label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitType)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden capitalize"
                  >
                    {(['piece', 'packet', 'dozen', 'box', 'carton'] as UnitType[]).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label>Unit Multiplier (Pieces inside)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={packSize}
                    onChange={(e) => setPackSize(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Purchase Cost Price (PKR)</Label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Wholesale Selling Price (PKR)</Label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(Number(e.target.value))}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Retail Price (PKR)</Label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Current Stock Quantity</Label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Min Stock Alert Level</Label>
                  <Input
                    type="number"
                    min="1"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Batch Number</Label>
                  <Input
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
