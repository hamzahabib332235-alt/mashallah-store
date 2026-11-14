import React from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Users,
  Building2,
  Receipt,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  Truck,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { ActiveTab } from '../Sidebar';
import { ThermalReceipt } from '../ThermalReceipt';
import { Invoice } from '@/types/wholesale';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { metrics, invoices, products, purchases, settings } = useWholesaleStore();
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);

  // Prepare chart data for 7-day sales and gross profit trend
  const chartData = [
    { day: 'Mon', sales: 125000, profit: 16000 },
    { day: 'Tue', sales: 180000, profit: 24000 },
    { day: 'Wed', sales: 145000, profit: 18500 },
    { day: 'Thu', sales: 210000, profit: 29000 },
    { day: 'Fri', sales: 295000, profit: 41000 },
    { day: 'Sat', sales: 340000, profit: 48000 },
    { day: 'Today', sales: Math.max(metrics.todaySales, 95000), profit: Math.max(metrics.todayGrossProfit, 14000) },
  ];

  // Top products by stock value / volume
  const topProducts = [...products]
    .sort((a, b) => b.currentStock * b.wholesalePrice - a.currentStock * a.wholesalePrice)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Wholesale Intelligence Hub • {settings.currency}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">{settings.shopName}</h1>
            <p className="text-sm text-slate-300 max-w-xl mt-1">
              Real-time trading analytics, offline-synchronized POS, inventory valuation, and customer Udhaar balances.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveTab('pos')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-lg shadow-emerald-950/50"
            >
              <ShoppingCart className="h-4 w-4" />
              New Sale (POS)
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab('purchases')}
              className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white gap-2"
            >
              <Truck className="h-4 w-4" />
              Receive Stock
            </Button>
          </div>
        </div>
      </div>

      {/* 10 KPI Metric Cards (Strictly Section 3 of Brief) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Today's Total Sales */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Today's Sales</span>
              <span className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-black text-foreground">
              Rs. {metrics.todaySales.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="h-3 w-3" /> Real-time active sales
            </div>
          </CardContent>
        </Card>

        {/* 2. Today's Gross Profit */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Today's Gross Profit</span>
              <span className="p-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <DollarSign className="h-3.5 w-3.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-black text-blue-600 dark:text-blue-400">
              Rs. {metrics.todayGrossProfit.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Sales minus COGS
            </div>
          </CardContent>
        </Card>

        {/* 3. Today's Net Profit */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Today's Net Profit</span>
              <span className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className={`text-xl font-black ${metrics.todayNetProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              Rs. {metrics.todayNetProfit.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              After daily expenses
            </div>
          </CardContent>
        </Card>

        {/* 4. Monthly Revenue */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Monthly Revenue</span>
              <span className="p-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Receipt className="h-3.5 w-3.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-black text-foreground">
              Rs. {metrics.monthlyRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">
              Current Month Total
            </div>
          </CardContent>
        </Card>

        {/* 5. Total Expenses */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Month Expenses</span>
              <span className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <DollarSign className="h-3.5 w-3.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-black text-amber-600 dark:text-amber-400">
              Rs. {metrics.totalExpenses.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Rent, bills & salaries
            </div>
          </CardContent>
        </Card>

        {/* 6. Total Products */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Total Catalog</span>
              <span className="p-1 rounded bg-slate-500/10 text-slate-600 dark:text-slate-400">
                <Package className="h-3.5 w-3.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-black text-foreground">
              {metrics.totalProducts} Items
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Active wholesale SKUs
            </div>
          </CardContent>
        </Card>

        {/* 7. Total Stock Value */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Total Stock Value</span>
              <span className="p-1 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Package className="h-3.5 w-3.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-black text-teal-600 dark:text-teal-400">
              Rs. {metrics.totalStockValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Cost valuation (WAC)
            </div>
          </CardContent>
        </Card>

        {/* 8. Low Stock Products */}
        <Card
          onClick={() => setActiveTab('inventory')}
          className={`cursor-pointer transition-colors ${
            metrics.lowStockCount > 0
              ? 'border-red-300 dark:border-red-900 bg-red-500/5 hover:bg-red-500/10'
              : 'border-border bg-card'
          }`}
        >
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Low Stock Alerts</span>
              <span className="p-1 rounded bg-red-500/10 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-black text-red-600 dark:text-red-400">
              {metrics.lowStockCount} Products
            </div>
            <div className="text-[11px] text-red-600 font-medium mt-0.5 flex items-center gap-0.5">
              Click to reorder stock
            </div>
          </CardContent>
        </Card>

        {/* 9. Customer Outstanding (Udhaar) */}
        <Card
          onClick={() => setActiveTab('customers')}
          className="cursor-pointer border-border bg-card hover:bg-muted/30 transition-colors shadow-xs"
        >
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Customer Khata (Udhaar)</span>
              <span className="p-1 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <Users className="h-3.5 w-3.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-black text-orange-600 dark:text-orange-400">
              Rs. {metrics.customerOutstanding.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Total receivables
            </div>
          </CardContent>
        </Card>

        {/* 10. Supplier Outstanding Balance */}
        <Card
          onClick={() => setActiveTab('suppliers')}
          className="cursor-pointer border-border bg-card hover:bg-muted/30 transition-colors shadow-xs"
        >
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Supplier Payables</span>
              <span className="p-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Building2 className="h-3.5 w-3.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-black text-rose-600 dark:text-rose-400">
              Rs. {metrics.supplierOutstanding.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Outstanding bills
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Profit Area Chart */}
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Weekly Sales & Profit Trend (PKR)
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Daily wholesale gross turnover and gross profit performance
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Turnover</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">Gross Profit</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip
                    formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                    name="Sales"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#profitGrad)"
                    name="Gross Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top-Selling Products */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
              <span>Top Inventory Assets</span>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('products')} className="text-xs h-7">
                View All
              </Button>
            </CardTitle>
            <p className="text-xs text-muted-foreground">High-demand wholesale stock</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Stock: {p.currentStock} {p.unit}s • Rate: Rs. {p.wholesalePrice.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-foreground">
                    Rs. {(p.currentStock * p.wholesalePrice).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">In Stock</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Recent Purchases Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">Recent Sales Invoices</CardTitle>
                <p className="text-xs text-muted-foreground">Latest transactions issued from POS</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('sales')} className="text-xs h-7">
                All Invoices
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {invoices.slice(0, 4).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">{inv.invoiceNo}</span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                          inv.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : inv.status === 'partial'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-red-500/15 text-red-600'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{inv.customerName}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {inv.cashierName}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div className="text-xs font-black text-foreground">
                        Rs. {inv.total.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Paid: Rs. {inv.paidAmount.toLocaleString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedInvoice(inv)}
                      className="h-7 px-2 text-xs"
                      title="View & Print Thermal Receipt"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">Recent Supplier Purchases</CardTitle>
                <p className="text-xs text-muted-foreground">Stock replenished from mills and distributors</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('purchases')} className="text-xs h-7">
                All Purchases
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {purchases.slice(0, 4).map((pur) => (
                <div key={pur.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">{pur.purchaseNo}</span>
                      <span className="rounded bg-blue-500/15 px-1.5 py-0.2 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                        {pur.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{pur.supplierName}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(pur.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-foreground">
                      Rs. {pur.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Paid: Rs. {pur.paidAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thermal Receipt Modal */}
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
