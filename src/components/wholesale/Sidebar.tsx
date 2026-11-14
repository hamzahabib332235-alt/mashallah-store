import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Layers,
  Boxes,
  Truck,
  Building2,
  Users,
  BookOpen,
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronRight,
  LogOut,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';

export type ActiveTab =
  | 'dashboard'
  | 'pos'
  | 'sales'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'purchases'
  | 'suppliers'
  | 'customers'
  | 'customer-ledger'
  | 'supplier-ledger'
  | 'expenses'
  | 'profit-loss'
  | 'reports'
  | 'users'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const { currentUser, settings, metrics } = useWholesaleStore();

  const navGroups = [
    {
      group: 'Core Trading',
      items: [
        { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'pos' as ActiveTab, label: 'POS Billing', icon: ShoppingCart, badge: 'Fast' },
        { id: 'sales' as ActiveTab, label: 'Sales Invoices', icon: Receipt },
      ],
    },
    {
      group: 'Catalog & Stock',
      items: [
        { id: 'products' as ActiveTab, label: 'Products', icon: Package },
        { id: 'categories' as ActiveTab, label: 'Categories', icon: Layers },
        {
          id: 'inventory' as ActiveTab,
          label: 'Inventory Control',
          icon: Boxes,
          badge: metrics.lowStockCount > 0 ? `${metrics.lowStockCount} Low` : undefined,
          badgeAlert: true,
        },
      ],
    },
    {
      group: 'Parties & Supply',
      items: [
        { id: 'purchases' as ActiveTab, label: 'Purchases (PO)', icon: Truck },
        { id: 'suppliers' as ActiveTab, label: 'Suppliers', icon: Building2 },
        { id: 'customers' as ActiveTab, label: 'Customers (Khata)', icon: Users },
      ],
    },
    {
      group: 'Accounts & Ledgers',
      items: [
        { id: 'customer-ledger' as ActiveTab, label: 'Customer Ledger', icon: BookOpen },
        { id: 'supplier-ledger' as ActiveTab, label: 'Supplier Ledger', icon: ArrowDownLeft },
        { id: 'expenses' as ActiveTab, label: 'Shop Expenses', icon: DollarSign },
        { id: 'profit-loss' as ActiveTab, label: 'Profit & Loss', icon: TrendingUp },
      ],
    },
    {
      group: 'System & Admin',
      items: [
        { id: 'reports' as ActiveTab, label: 'Reports & Export', icon: BarChart3 },
        { id: 'users' as ActiveTab, label: 'Users & Audit', icon: ShieldCheck },
        { id: 'settings' as ActiveTab, label: 'Settings & Backup', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl select-none">
      {/* Brand Logo Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-lg shadow-lg shadow-emerald-900/40">
            MW
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold tracking-tight text-white truncate">
              {settings.shopName}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Wholesale ERP & POS
              </span>
            </div>
          </div>
        </div>

        {/* Sync & Mode Indicator Pill */}
        <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-900/90 px-2.5 py-1.5 border border-slate-800 text-[11px]">
          <div className="flex items-center gap-1.5">
            {settings.offlineMode ? (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-400 font-medium">Offline (Local SQLite)</span>
              </>
            ) : (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Cloud Synced</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">PKR (Rs)</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {group.group}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-semibold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        item.badgeAlert
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : isActive
                          ? 'bg-emerald-700 text-emerald-100'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {!item.badge && isActive && <ChevronRight className="h-3.5 w-3.5 opacity-80" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Session Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-emerald-400 font-bold text-xs border border-slate-700">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] uppercase font-bold text-emerald-400">{currentUser.role}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Switch User / Logout"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
