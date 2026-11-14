import React, { useState } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { User, UserRole } from '@/types/wholesale';
import {
  ShieldCheck,
  Plus,
  UserCheck,
  Lock,
  Phone,
  Clock,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const UsersView: React.FC = () => {
  const { store, users, auditLogs, currentUser } = useWholesaleStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('cashier');
  const [phone, setPhone] = useState('+92 ');
  const [pin, setPin] = useState('1234');

  const handleOpenAdd = () => {
    setUsername('');
    setName('');
    setRole('cashier');
    setPhone('+92 ');
    setPin('1234');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;

    store.addUser({
      username,
      name,
      role,
      phone,
      pin,
      active: true,
    });
    setIsModalOpen(false);
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
      case 'manager':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30';
      case 'cashier':
        return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add User */}
      <div className="flex items-center justify-between rounded-xl bg-card border border-border p-4 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-foreground">Role-Based Staff Access & Security</h3>
          <p className="text-xs text-muted-foreground">
            Manage Admin, Manager, and Cashier terminals and inspect audit logs
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Staff Account
        </Button>
      </div>

      {/* Staff Accounts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.map((u) => {
          const isCurrent = currentUser.id === u.id;
          return (
            <div
              key={u.id}
              className={`flex flex-col justify-between rounded-xl border p-4 shadow-xs transition-all ${
                isCurrent
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-border bg-card'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-sm">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{u.name}</h4>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        @{u.username}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${getRoleBadge(
                      u.role
                    )}`}
                  >
                    {u.role}
                  </span>
                </div>

                <div className="mt-3 text-xs text-muted-foreground space-y-1">
                  <div>Ph: {u.phone || 'N/A'}</div>
                  <div>Security PIN: ••••</div>
                  <div className="text-[11px] pt-1">
                    {u.role === 'admin' && '• Full System & Financial Access'}
                    {u.role === 'manager' && '• Inventory, Stock, Purchases & Ledgers'}
                    {u.role === 'cashier' && '• POS Billing, Counter Sales & Receipts'}
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-2 flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {isCurrent ? '● Current Active Session' : 'Active Account'}
                </span>
                {!isCurrent && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => store.setCurrentUser(u)}
                    className="h-7 text-xs font-semibold"
                  >
                    Switch To
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Log Activity History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Security & Transaction Audit Trail
          </h4>
          <span className="text-xs text-muted-foreground">
            Preserves operator responsibility & transaction integrity
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User / Operator</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Transaction Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-foreground">
                      {log.userName}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      {log.action}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Add New Staff Member</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input
                  required
                  placeholder="e.g. Kashif Mehmood"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label>Username</Label>
                <Input
                  required
                  placeholder="e.g. kashif"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label>Assigned Role</Label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                >
                  <option value="cashier">Cashier (POS & Billing)</option>
                  <option value="manager">Manager (Inventory, Purchases & Sales)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label>Contact Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label>4-Digit Security PIN</Label>
                <Input
                  type="password"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
