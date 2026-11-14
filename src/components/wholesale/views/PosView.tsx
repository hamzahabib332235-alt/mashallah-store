import React, { useState, useMemo } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { Product, InvoiceItem, Invoice, Customer } from '@/types/wholesale';
import {
  Search,
  Barcode,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Printer,
  User,
  CreditCard,
  DollarSign,
  AlertCircle,
  Tag,
  Check,
  RefreshCw,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThermalReceipt } from '../ThermalReceipt';

export const PosView: React.FC = () => {
  const { store, products, categories, customers, settings } = useWholesaleStore();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceTier, setPriceTier] = useState<'wholesale' | 'retail'>('wholesale');

  // Cart State
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customCustomerName, setCustomCustomerName] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'credit' | 'split'>('cash');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [receiptSize, setReceiptSize] = useState<'58mm' | '80mm'>(settings.defaultReceiptSize);

  // Completed Invoice for instant thermal preview
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);

  // Selected customer object for credit limit and previous balance check
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  }, [cart]);

  const taxAmount = useMemo(() => {
    return settings.taxRatePercent > 0 ? (subtotal * settings.taxRatePercent) / 100 : 0;
  }, [subtotal, settings.taxRatePercent]);

  const grandTotal = Math.max(0, subtotal - discount + taxAmount);

  // Change or Due Calculation
  const changeDue = Math.max(0, amountReceived - grandTotal);
  const balanceRemaining = Math.max(0, grandTotal - amountReceived);

  // Add Product to Cart
  const handleAddToCart = (product: Product) => {
    if (product.currentStock <= 0) {
      alert(`Warning: ${product.name} is out of stock!`);
      return;
    }

    const existingIdx = cart.findIndex((item) => item.productId === product.id);
    const unitPrice = priceTier === 'wholesale' ? product.wholesalePrice : product.retailPrice;

    if (existingIdx >= 0) {
      const existing = cart[existingIdx];
      const newQty = existing.quantity + 1;
      if (newQty > product.currentStock) {
        alert(`Cannot add more than available warehouse stock (${product.currentStock})`);
        return;
      }
      const updated = [...cart];
      updated[existingIdx] = {
        ...existing,
        quantity: newQty,
        total: newQty * existing.unitPrice,
      };
      setCart(updated);
    } else {
      const newItem: InvoiceItem = {
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        quantity: 1,
        priceType: priceTier,
        unitPrice,
        purchasePrice: product.purchasePrice,
        total: unitPrice * 1,
      };
      setCart([...cart, newItem]);
    }
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (product && nextQty > product.currentStock) {
              alert(`Maximum available stock is ${product.currentStock}`);
              return item;
            }
            return {
              ...item,
              quantity: nextQty,
              total: nextQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as InvoiceItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Are you sure you want to clear the current cart?')) {
      setCart([]);
      setDiscount(0);
      setAmountReceived(0);
      setSelectedCustomerId('');
      setCustomCustomerName('');
    }
  };

  // Barcode enter key trigger
  const handleBarcodeSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const exactMatch = products.find(
        (p) => p.barcode === searchQuery.trim() || p.sku.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      if (exactMatch) {
        handleAddToCart(exactMatch);
        setSearchQuery('');
      }
    }
  };

  // Complete checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add items to checkout.');
      return;
    }

    const customerName = selectedCustomer
      ? selectedCustomer.name
      : customCustomerName.trim() || 'Walk-in Wholesale Customer';

    // Determine actual paid amount
    let finalPaid = amountReceived;
    if (paymentMethod === 'cash' || paymentMethod === 'bank') {
      if (finalPaid === 0 || finalPaid >= grandTotal) {
        finalPaid = grandTotal;
      }
    } else if (paymentMethod === 'credit') {
      finalPaid = 0; // Pure Udhaar
    }

    // Check credit limit if credit sale
    if (paymentMethod === 'credit' && selectedCustomer) {
      const newTotalDebt = selectedCustomer.outstandingBalance + grandTotal;
      if (newTotalDebt > selectedCustomer.creditLimit) {
        const proceed = confirm(
          `Customer credit limit of Rs. ${selectedCustomer.creditLimit.toLocaleString()} will be exceeded!\nCurrent: Rs. ${selectedCustomer.outstandingBalance.toLocaleString()}\nNew Total: Rs. ${newTotalDebt.toLocaleString()}\n\nProceed anyway with manager authorization?`
        );
        if (!proceed) return;
      }
    }

    const invoice = store.createSale({
      customerId: selectedCustomerId || undefined,
      customerName,
      customerPhone: selectedCustomer?.phone,
      items: cart,
      discount,
      tax: taxAmount,
      paymentMethod,
      paidAmount: finalPaid,
      receiptSize,
    });

    // Reset and show receipt
    setCompletedInvoice(invoice);
    setCart([]);
    setDiscount(0);
    setAmountReceived(0);
    setCustomCustomerName('');
    setSelectedCustomerId('');
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] gap-4 select-none">
      {/* LEFT COLUMN: Product Catalog, Barcode & Category Filter */}
      <div className="flex-1 flex flex-col rounded-xl bg-card border border-border p-4 overflow-hidden shadow-xs">
        {/* Search & Pricing Tier Switch */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-border">
          <div className="relative flex-1 min-w-[240px]">
            <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Scan Barcode or Search by Name / SKU (Press Enter)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleBarcodeSearch}
              className="pl-9 text-xs"
            />
          </div>

          {/* Wholesale vs Retail pricing toggle */}
          <div className="flex rounded-lg border border-border bg-muted/40 p-1 text-xs">
            <button
              type="button"
              onClick={() => setPriceTier('wholesale')}
              className={`rounded-md px-3 py-1 font-bold transition-all ${
                priceTier === 'wholesale'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Wholesale Rate
            </button>
            <button
              type="button"
              onClick={() => setPriceTier('retail')}
              className={`rounded-md px-3 py-1 font-bold transition-all ${
                priceTier === 'retail'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Retail Rate
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All Items ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 py-2">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.currentStock <= 0;
            const isLowStock = p.currentStock <= p.minStockAlert;
            const activePrice = priceTier === 'wholesale' ? p.wholesalePrice : p.retailPrice;

            return (
              <button
                key={p.id}
                type="button"
                disabled={isOutOfStock}
                onClick={() => handleAddToCart(p)}
                className={`group flex flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                  isOutOfStock
                    ? 'border-border/40 bg-muted/20 opacity-50 cursor-not-allowed'
                    : 'border-border bg-card hover:border-emerald-500 hover:shadow-md cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono text-muted-foreground truncate">{p.sku}</span>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                        isOutOfStock
                          ? 'bg-red-500/20 text-red-500'
                          : isLowStock
                          ? 'bg-amber-500/20 text-amber-600'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {p.currentStock} {p.unit}s
                    </span>
                  </div>
                  <h4 className="mt-1.5 text-xs font-bold text-foreground line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {p.name}
                  </h4>
                </div>

                <div className="mt-3 flex items-baseline justify-between border-t border-border/50 pt-2">
                  <div className="text-[10px] text-muted-foreground capitalize">
                    {priceTier}:
                  </div>
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    Rs. {activePrice.toLocaleString()}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: POS Cart & Instant Checkout */}
      <div className="w-96 flex flex-col rounded-xl bg-card border border-border p-4 shadow-xl shrink-0">
        {/* Cart Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-foreground text-sm">Sale Cart</span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Customer Khata Selector */}
        <div className="py-2.5 border-b border-border space-y-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground flex items-center justify-between">
            <span>Customer (Udhaar / Khata)</span>
            {selectedCustomer && (
              <span className="text-orange-600 font-semibold">
                Khata: Rs. {selectedCustomer.outstandingBalance.toLocaleString()}
              </span>
            )}
          </Label>
          <select
            value={selectedCustomerId}
            onChange={(e) => {
              setSelectedCustomerId(e.target.value);
              if (e.target.value) setCustomCustomerName('');
            }}
            className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden"
          >
            <option value="">-- Walk-in Wholesale Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Balance: Rs. {c.outstandingBalance.toLocaleString()})
              </option>
            ))}
          </select>
          {!selectedCustomerId && (
            <Input
              type="text"
              placeholder="Or enter Walk-in Buyer Name..."
              value={customCustomerName}
              onChange={(e) => setCustomCustomerName(e.target.value)}
              className="h-7 text-xs"
            />
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-border/60">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <ShoppingCart className="h-10 w-10 opacity-30 mb-2" />
              <p className="text-xs font-semibold">Cart is currently empty</p>
              <p className="text-[11px]">Scan a barcode or click products to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="py-2 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-foreground truncate">
                    {item.productName}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Rs. {item.unitPrice.toLocaleString()} / {item.unit}
                  </div>
                </div>

                {/* Qty Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateQty(item.productId, -1)}
                    className="h-6 w-6 rounded bg-muted flex items-center justify-center text-foreground hover:bg-muted/80"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQty(item.productId, 1)}
                    className="h-6 w-6 rounded bg-muted flex items-center justify-center text-foreground hover:bg-muted/80"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Item Total & Delete */}
                <div className="text-right min-w-[70px]">
                  <div className="text-xs font-bold text-foreground">
                    Rs. {item.total.toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="text-[10px] text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary Calculations */}
        <div className="border-t border-border pt-3 space-y-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal:</span>
            <span>Rs. {subtotal.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Discount (Rs):</span>
            <input
              type="number"
              min="0"
              value={discount || ''}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="w-24 rounded border border-border bg-background px-2 py-0.5 text-right text-xs font-bold text-emerald-600 focus:outline-hidden"
            />
          </div>

          {settings.taxRatePercent > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Tax ({settings.taxRatePercent}%):</span>
              <span>Rs. {taxAmount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-black text-foreground border-t border-border pt-2">
            <span>Grand Total:</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              Rs. {grandTotal.toLocaleString()}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-2">
            <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
              {(['cash', 'bank', 'credit', 'split'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(mode);
                    if (mode === 'cash' || mode === 'bank') {
                      setAmountReceived(grandTotal);
                    } else if (mode === 'credit') {
                      setAmountReceived(0);
                    }
                  }}
                  className={`rounded-md py-1.5 capitalize transition-all ${
                    paymentMethod === mode
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {mode === 'credit' ? 'Udhaar' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Paid Input & Change Due */}
          {(paymentMethod === 'cash' || paymentMethod === 'split') && (
            <div className="rounded-lg bg-muted/40 p-2 space-y-1.5 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">Cash Received:</span>
                <input
                  type="number"
                  min="0"
                  value={amountReceived || ''}
                  onChange={(e) => setAmountReceived(Number(e.target.value))}
                  placeholder={grandTotal.toString()}
                  className="w-28 rounded border border-border bg-background px-2 py-0.5 text-right text-xs font-bold text-foreground focus:outline-hidden"
                />
              </div>
              {amountReceived > grandTotal && (
                <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Change Return:</span>
                  <span>Rs. {changeDue.toLocaleString()}</span>
                </div>
              )}
              {amountReceived < grandTotal && (
                <div className="flex justify-between text-xs font-bold text-red-500">
                  <span>Balance (Due/Udhaar):</span>
                  <span>Rs. {balanceRemaining.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Receipt Size Toggle before printing */}
          <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground">
            <span>Thermal Size:</span>
            <div className="flex gap-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="rcptSize"
                  checked={receiptSize === '80mm'}
                  onChange={() => setReceiptSize('80mm')}
                />
                80mm (Standard)
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="rcptSize"
                  checked={receiptSize === '58mm'}
                  onChange={() => setReceiptSize('58mm')}
                />
                58mm
              </label>
            </div>
          </div>

          {/* Checkout & Print Button */}
          <Button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 text-sm gap-2 shadow-lg shadow-emerald-950/40"
          >
            <Printer className="h-4 w-4" />
            Complete Sale & Issue Receipt
          </Button>
        </div>
      </div>

      {/* Instant Thermal Receipt Modal after checkout */}
      {completedInvoice && (
        <ThermalReceipt
          invoice={completedInvoice}
          settings={settings}
          customerPreviousBalance={selectedCustomer?.outstandingBalance || 0}
          onClose={() => setCompletedInvoice(null)}
        />
      )}
    </div>
  );
};
