import React, { useState, useMemo } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { Expense, ExpenseCategory } from '@/types/wholesale';
import {
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Filter,
  TrendingDown,
  Building,
  Zap,
  Users,
  Truck,
  Wifi,
  Wrench,
  HelpCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Shop Rent',
  'Electricity',
  'Employee Salaries',
  'Transport',
  'Internet',
  'Maintenance',
  'Other',
];

export const ExpensesView: React.FC = () => {
  const { store, expenses, currentUser } = useWholesaleStore();
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('Shop Rent');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('cash');
  const [notes, setNotes] = useState('');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => selectedCat === 'all' || e.category === selectedCat);
  }, [expenses, selectedCat]);

  const totalExpenseSum = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleOpenAdd = () => {
    setCategory('Shop Rent');
    setTitle('');
    setAmount(5000);
    setDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod('cash');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    store.addExpense({
      category,
      title,
      amount,
      date: new Date(date).toISOString(),
      paymentMethod,
      recordedBy: `${currentUser.name} (${currentUser.role})`,
      notes,
    });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this expense entry?')) {
      store.deleteExpense(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Total */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card border border-border p-4 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-foreground">Shop Operating Expenses</h3>
          <p className="text-xs text-muted-foreground">
            Track overhead costs: Rent, Electricity, Labor & Freight
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">
              Total Filtered
            </span>
            <div className="text-lg font-black text-rose-600 dark:text-rose-400">
              Rs. {totalExpenseSum.toLocaleString()}
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Expense Entry
          </Button>
        </div>
      </div>

      {/* Filter by Category */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedCat('all')}
          className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 transition-colors ${
            selectedCat === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All Categories ({expenses.length})
        </button>
        {EXPENSE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCat(c)}
            className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 transition-colors ${
              selectedCat === c
                ? 'bg-emerald-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Expense Category</th>
                <th className="px-4 py-3">Title / Description</th>
                <th className="px-4 py-3 text-right">Amount (PKR)</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3">Recorded By</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground">
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">{exp.title}</td>
                    <td className="px-4 py-3 text-right font-black text-rose-600 dark:text-rose-400">
                      Rs. {exp.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 uppercase text-[11px] font-bold text-muted-foreground">
                      {exp.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{exp.recordedBy}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                      {exp.notes || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(exp.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        title="Delete Expense"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Record Shop Expense
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label>Expense Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label>Expense Title</Label>
                <Input
                  required
                  placeholder="e.g. November Godown Electricity Bill"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label>Amount (PKR)</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Payment Method</Label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                  >
                    <option value="cash">Cash Voucher</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Additional Notes</Label>
                <textarea
                  rows={2}
                  placeholder="Receipt number, invoice reference, or recipient details..."
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
                  Save Expense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
