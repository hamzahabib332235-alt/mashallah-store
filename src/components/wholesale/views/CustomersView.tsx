import React, { useState } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { Customer } from '@/types/wholesale';
import {
  Users,
  Plus,
  DollarSign,
  Edit2,
  Phone,
  MapPin,
  ShieldAlert,
  ArrowUpRight,
  X,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ActiveTab } from '../Sidebar';

interface CustomersViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectCustomerForLedger?: (customerId: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  setActiveTab,
  onSelectCustomerForLedger,
}) => {
  const { store, customers } = useWholesaleStore();

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(300000);
  const [openingBalance, setOpeningBalance] = useState<number>(0);

  // Payment Receipt Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'bank'>('cash');
  const [payRef, setPayRef] = useState('');

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('+92 ');
    setAddress('');
    setCreditLimit(300000);
    setOpeningBalance(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setAddress(c.address);
    setCreditLimit(c.creditLimit);
    setOpeningBalance(c.outstandingBalance);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCustomer) {
      store.updateCustomer(editingCustomer.id, {
        name,
        phone,
        address,
        creditLimit,
      });
    } else {
      store.addCustomer({
        name,
        phone,
        address,
        creditLimit,
        outstandingBalance: openingBalance,
      });
    }
    setIsModalOpen(false);
  };

  const handleOpenPayment = (c: Customer) => {
    setActiveCustomer(c);
    setPayAmount(Math.min(c.outstandingBalance, 25000));
    setPayMethod('cash');
    setPayRef(`RCV-${Date.now().toString().slice(-4)}`);
    setPayModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer || payAmount <= 0) return;
    store.recordCustomerPayment(activeCustomer.id, payAmount, payMethod, payRef);
    setPayModalOpen(false);
  };

  const handleViewLedger = (cId: string) => {
    if (onSelectCustomerForLedger) {
      onSelectCustomerForLedger(cId);
    }
    setActiveTab('customer-ledger');
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center justify-between rounded-xl bg-card border border-border p-4 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-foreground">Wholesale Customer Directory (Khata)</h3>
          <p className="text-xs text-muted-foreground">
            Manage wholesale retail buyers, credit limits, and credit sales (Udhaar)
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Wholesale Customer
        </Button>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((c) => {
          const isOverLimit = c.outstandingBalance > c.creditLimit;
          return (
            <div
              key={c.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs hover:border-emerald-500/50 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{c.name}</h4>
                    <div className="text-[11px] text-muted-foreground">
                      Limit: Rs. {c.creditLimit.toLocaleString()}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(c)}
                    className="h-7 w-7 p-0"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{c.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{c.address}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">
                      Udhaar (Outstanding)
                    </div>
                    <div
                      className={`text-sm font-black ${
                        c.outstandingBalance > 0
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      Rs. {c.outstandingBalance.toLocaleString()}
                    </div>
                  </div>

                  {isOverLimit && (
                    <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] font-bold text-red-600 flex items-center gap-0.5">
                      <ShieldAlert className="h-3 w-3" /> Over Limit
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleOpenPayment(c)}
                    disabled={c.outstandingBalance <= 0}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1"
                  >
                    <DollarSign className="h-3.5 w-3.5" /> Receive Cash
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewLedger(c.id)}
                    className="text-xs font-semibold gap-1"
                  >
                    <BookOpen className="h-3.5 w-3.5" /> Ledger
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingCustomer ? 'Edit Customer' : 'Add New Wholesale Customer'}
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
                <Label>Shop / Customer Full Name</Label>
                <Input
                  required
                  placeholder="e.g. Al-Madina General Store (Haji Saleem)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label>Mobile Phone Number</Label>
                <Input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label>Shop Address / Market Location</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label>Credit Limit (Udhaar Allowance in PKR)</Label>
                <Input
                  type="number"
                  min="0"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(Number(e.target.value))}
                  className="text-xs font-bold"
                />
              </div>

              {!editingCustomer && (
                <div className="space-y-1">
                  <Label>Opening Khata Balance (Existing Udhaar)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(Number(e.target.value))}
                    className="text-xs font-bold"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Payment Receipt Modal */}
      {payModalOpen && activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Receive Customer Udhaar Payment
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
                <div className="font-bold text-foreground">{activeCustomer.name}</div>
                <div className="mt-1 text-xs">
                  Current Khata (Udhaar): <strong className="text-orange-600">Rs. {activeCustomer.outstandingBalance.toLocaleString()}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Received Amount (PKR)</Label>
                <Input
                  type="number"
                  min="1"
                  max={activeCustomer.outstandingBalance}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <Label>Received Method</Label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                >
                  <option value="cash">Cash in Hand</option>
                  <option value="bank">Meezan / HBL Bank Transfer</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label>Voucher / Transaction Reference</Label>
                <Input
                  placeholder="e.g. Cash Receipt #4092"
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
                  Confirm & Update Khata
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
