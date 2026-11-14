import React, { useState } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { Supplier } from '@/types/wholesale';
import { Building2, Plus, DollarSign, Edit2, Phone, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const SuppliersView: React.FC = () => {
  const { store, suppliers } = useWholesaleStore();

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [payableBalance, setPayableBalance] = useState<number>(0);

  // Payment Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [activeSupplier, setActiveSupplier] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'bank'>('bank');
  const [payRef, setPayRef] = useState('');

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setName('');
    setCompany('');
    setPhone('+92 ');
    setAddress('');
    setPayableBalance(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setName(s.name);
    setCompany(s.company);
    setPhone(s.phone);
    setAddress(s.address);
    setPayableBalance(s.payableBalance);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSupplier) {
      store.updateSupplier(editingSupplier.id, {
        name,
        company,
        phone,
        address,
      });
    } else {
      store.addSupplier({
        name,
        company,
        phone,
        address,
        payableBalance,
      });
    }
    setIsModalOpen(false);
  };

  const handleOpenPayment = (s: Supplier) => {
    setActiveSupplier(s);
    setPayAmount(Math.min(s.payableBalance, 50000));
    setPayMethod('bank');
    setPayRef(`CHQ-${Date.now().toString().slice(-4)}`);
    setPayModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSupplier || payAmount <= 0) return;
    store.recordSupplierPayment(activeSupplier.id, payAmount, payMethod, payRef);
    setPayModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl bg-card border border-border p-4 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-foreground">Supplier Directory</h3>
          <p className="text-xs text-muted-foreground">
            Manage manufacturer accounts, distributors, and payable records
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add New Supplier
        </Button>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs hover:border-emerald-500/50 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-foreground text-sm">{s.name}</h4>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {s.company}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenEdit(s)}
                  className="h-7 w-7 p-0"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{s.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{s.address}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-border pt-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">
                  Payable Due
                </div>
                <div className="text-sm font-black text-rose-600 dark:text-rose-400">
                  Rs. {s.payableBalance.toLocaleString()}
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => handleOpenPayment(s)}
                className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold gap-1"
              >
                <DollarSign className="h-3.5 w-3.5" /> Pay Supplier
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label>Contact Person Name</Label>
                <Input
                  required
                  placeholder="e.g. Sheikh Naveed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label>Company / Factory Name</Label>
                <Input
                  required
                  placeholder="e.g. Mughal Agri Mills"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label>Contact Phone Number</Label>
                <Input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label>Factory / Depot Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="text-xs"
                />
              </div>

              {!editingSupplier && (
                <div className="space-y-1">
                  <Label>Opening Payable Balance (PKR)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={payableBalance}
                    onChange={(e) => setPayableBalance(Number(e.target.value))}
                    className="text-xs font-bold"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  {editingSupplier ? 'Save Changes' : 'Create Supplier'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment to Supplier Modal */}
      {payModalOpen && activeSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Record Supplier Payment
              </h3>
              <button
                onClick={() => setPayModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3 text-xs">
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="font-bold text-foreground">{activeSupplier.name}</div>
                <div className="text-xs text-muted-foreground">{activeSupplier.company}</div>
                <div className="mt-1 text-xs">
                  Current Payable: <strong className="text-rose-600">Rs. {activeSupplier.payableBalance.toLocaleString()}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Payment Amount (PKR)</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <Label>Payment Mode</Label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                >
                  <option value="bank">Bank Transfer / Cheque</option>
                  <option value="cash">Cash Voucher</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label>Cheque / Reference Number</Label>
                <Input
                  placeholder="e.g. HBL Cheque #19203"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setPayModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
