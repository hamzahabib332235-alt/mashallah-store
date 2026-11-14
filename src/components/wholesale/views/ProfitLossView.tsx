import React, { useState, useMemo } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  Printer,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ProfitLossView: React.FC = () => {
  const { invoices, expenses, settings } = useWholesaleStore();
  const [period, setPeriod] = useState<'today' | 'month' | 'all'>('month');

  const todayStr = new Date().toISOString().slice(0, 10);
  const thisMonthStr = new Date().toISOString().slice(0, 7);

  // Filter invoices and expenses based on period
  const activeInvoices = useMemo(() => {
    return invoices.filter((i) => {
      if (i.status === 'returned') return false;
      if (period === 'today') return i.createdAt.slice(0, 10) === todayStr;
      if (period === 'month') return i.createdAt.slice(0, 7) === thisMonthStr;
      return true;
    });
  }, [invoices, period, todayStr, thisMonthStr]);

  const activeExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (period === 'today') return e.date.slice(0, 10) === todayStr;
      if (period === 'month') return e.date.slice(0, 7) === thisMonthStr;
      return true;
    });
  }, [expenses, period, todayStr, thisMonthStr]);

  // Calculations
  const grossSales = activeInvoices.reduce((s, i) => s + i.subtotal, 0);
  const totalDiscounts = activeInvoices.reduce((s, i) => s + i.discount, 0);
  const netSalesRevenue = Math.max(0, grossSales - totalDiscounts);

  // Cost of Goods Sold (COGS)
  let totalCOGS = 0;
  activeInvoices.forEach((inv) => {
    inv.items.forEach((item) => {
      totalCOGS += (item.purchasePrice || 0) * item.quantity;
    });
  });

  const grossProfit = Math.max(0, netSalesRevenue - totalCOGS);
  const grossProfitMargin = netSalesRevenue > 0 ? (grossProfit / netSalesRevenue) * 100 : 0;

  // Operating Expenses breakdown
  const expenseByCategory: Record<string, number> = {};
  activeExpenses.forEach((exp) => {
    expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + exp.amount;
  });
  const totalOperatingExpenses = activeExpenses.reduce((s, e) => s + e.amount, 0);

  // Net Profit
  const netProfit = grossProfit - totalOperatingExpenses;
  const netProfitMargin = netSalesRevenue > 0 ? (netProfit / netSalesRevenue) * 100 : 0;

  // Cash Flow distinction (Received cash vs Credit Udhaar)
  const cashReceived = activeInvoices.reduce((s, i) => s + i.paidAmount, 0);
  const creditReceivableDue = activeInvoices.reduce((s, i) => s + i.balanceDue, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Period Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card border border-border p-4 shadow-xs print:hidden">
        <div>
          <h3 className="text-sm font-bold text-foreground">Real Profit & Loss Statement</h3>
          <p className="text-xs text-muted-foreground">
            Accrual-based financial accounting: Net Sales - COGS = Gross Profit; Gross Profit - Expenses = Net Profit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-muted/40 p-1 text-xs font-semibold">
            <button
              onClick={() => setPeriod('today')}
              className={`rounded px-3 py-1 transition-all ${
                period === 'today' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`rounded px-3 py-1 transition-all ${
                period === 'month' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`rounded px-3 py-1 transition-all ${
                period === 'all' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Time
            </button>
          </div>

          <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
            <Printer className="h-4 w-4" /> Print P&L
          </Button>
        </div>
      </div>

      {/* Main Financial KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">
            Net Turnover / Sales Revenue
          </span>
          <div className="mt-1 text-2xl font-black text-foreground">
            Rs. {netSalesRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Gross sales Rs. {grossSales.toLocaleString()} less discounts
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
              Gross Profit
            </span>
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-600">
              {grossProfitMargin.toFixed(1)}% Margin
            </span>
          </div>
          <div className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">
            Rs. {grossProfit.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            After deducting Cost of Goods Sold (COGS)
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
              Net Profit
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-600">
              {netProfitMargin.toFixed(1)}% Net Margin
            </span>
          </div>
          <div className={`mt-1 text-2xl font-black ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            Rs. {netProfit.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            After deducting all operating overheads
          </p>
        </div>
      </div>

      {/* Income & Expense Breakdown Statement Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs font-sans text-xs">
        <h4 className="text-sm font-bold text-foreground border-b border-border pb-3 flex items-center justify-between">
          <span>Income & Expenditure Account ({period.toUpperCase()})</span>
          <span className="text-xs font-normal text-muted-foreground">Currency: PKR</span>
        </h4>

        <div className="mt-4 space-y-3">
          {/* Revenue Section */}
          <div className="space-y-1.5">
            <div className="font-bold text-foreground uppercase tracking-wider text-[11px] text-emerald-600 dark:text-emerald-400">
              1. Trading Revenue
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Gross Product Sales:</span>
              <span className="font-semibold text-foreground">Rs. {grossSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50 text-red-500">
              <span>Less: Wholesale Trade Discounts:</span>
              <span>- Rs. {totalDiscounts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold text-foreground bg-muted/20 px-2 rounded">
              <span>Net Sales Revenue:</span>
              <span>Rs. {netSalesRevenue.toLocaleString()}</span>
            </div>
          </div>

          {/* Cost of Goods Sold Section */}
          <div className="space-y-1.5 pt-2">
            <div className="font-bold text-foreground uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400">
              2. Cost of Sales (COGS)
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Historical Purchase Cost of Sold Inventory:</span>
              <span className="font-semibold text-foreground">Rs. {totalCOGS.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 px-2 rounded">
              <span>GROSS PROFIT (Net Sales - COGS):</span>
              <span>Rs. {grossProfit.toLocaleString()}</span>
            </div>
          </div>

          {/* Operating Overheads Section */}
          <div className="space-y-1.5 pt-2">
            <div className="font-bold text-foreground uppercase tracking-wider text-[11px] text-rose-600 dark:text-rose-400">
              3. Operating Expenses
            </div>
            {Object.keys(expenseByCategory).length === 0 ? (
              <div className="text-muted-foreground py-1">No expenses recorded for this period.</div>
            ) : (
              Object.entries(expenseByCategory).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">{cat}:</span>
                  <span className="font-semibold text-foreground">Rs. {amt.toLocaleString()}</span>
                </div>
              ))
            )}
            <div className="flex justify-between py-1.5 font-bold text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 px-2 rounded">
              <span>TOTAL OPERATING EXPENSES:</span>
              <span>Rs. {totalOperatingExpenses.toLocaleString()}</span>
            </div>
          </div>

          {/* Net Profit Line */}
          <div className="pt-4 border-t-2 border-border flex justify-between items-center text-sm font-black bg-muted/40 p-3 rounded-xl">
            <span className="uppercase text-foreground">NET PROFIT / (LOSS):</span>
            <span className={netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400 text-lg' : 'text-red-500 text-lg'}>
              Rs. {netProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Section 10 Rule: Credit sales vs Cash */}
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
          <div className="font-bold text-foreground text-[11px] flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" /> Cash Realization vs Udhaar Notice
          </div>
          <p className="mt-1">
            In accordance with sound wholesale accounting principles, credit sales (Udhaar) of{' '}
            <strong className="text-foreground">Rs. {creditReceivableDue.toLocaleString()}</strong> are recorded under receivables
            and not treated as physical cash in hand. Cash realized at counter is{' '}
            <strong className="text-emerald-600 dark:text-emerald-400">Rs. {cashReceived.toLocaleString()}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
