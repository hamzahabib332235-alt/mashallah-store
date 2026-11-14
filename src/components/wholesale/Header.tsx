import React from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { ActiveTab } from './Sidebar';
import {
  Bell,
  ShoppingCart,
  PlusCircle,
  Wifi,
  WifiOff,
  UserCheck,
  Search,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickSale: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickSale,
}) => {
  const { store, settings, currentUser, metrics } = useWholesaleStore();

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Executive Wholesale Dashboard';
      case 'pos':
        return 'Point of Sale (POS) Billing Terminal';
      case 'sales':
        return 'Sales Invoices & Transaction History';
      case 'products':
        return 'Wholesale Products Catalog & Pricing';
      case 'categories':
        return 'Product Categories & Classifications';
      case 'inventory':
        return 'Inventory Tracking & Stock Adjustments';
      case 'purchases':
        return 'Purchase Orders (PO) & Receiving';
      case 'suppliers':
        return 'Suppliers & Vendors Directory';
      case 'customers':
        return 'Wholesale Customers & Khata (Udhaar)';
      case 'customer-ledger':
        return 'Customer Statement & Running Ledger';
      case 'supplier-ledger':
        return 'Supplier Payables & Running Ledger';
      case 'expenses':
        return 'Shop & Operating Expenses Management';
      case 'profit-loss':
        return 'Real Profit & Loss Statement (P&L)';
      case 'reports':
        return 'Business Intelligence & Financial Reports';
      case 'users':
        return 'Staff Accounts, Roles & Audit Logs';
      case 'settings':
        return 'System Configuration & Data Backup';
      default:
        return 'Wholesale Management';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur-xs select-none">
      {/* Title & Path */}
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          {getTitle()}
        </h2>
        <p className="text-xs text-muted-foreground">
          {settings.shopName} • Lahore Commercial Trading
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Cloud / Offline Mode toggle button */}
        <button
          onClick={() => store.toggleOfflineMode(!settings.offlineMode)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
            settings.offlineMode
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
          }`}
          title="Toggle between Cloud Synchronization and Offline SQLite Mode"
        >
          {settings.offlineMode ? (
            <>
              <WifiOff className="h-3.5 w-3.5" />
              <span>Offline Mode (Local Storage)</span>
            </>
          ) : (
            <>
              <Wifi className="h-3.5 w-3.5" />
              <span>Online (Cloud Synced)</span>
            </>
          )}
        </button>

        {/* Low Stock Notification Pill */}
        {metrics.lowStockCount > 0 && (
          <button
            onClick={() => setActiveTab('inventory')}
            className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-1 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-colors"
            title={`${metrics.lowStockCount} items have reached low stock alert`}
          >
            <Bell className="h-3.5 w-3.5 animate-bounce" />
            <span>{metrics.lowStockCount} Low Stock</span>
          </button>
        )}

        {/* Quick New Sale button */}
        {activeTab !== 'pos' && (
          <Button
            size="sm"
            onClick={onOpenQuickSale}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs font-semibold"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Open POS Terminal</span>
          </Button>
        )}

        {/* User Role Tag */}
        <div className="flex items-center gap-2 border-l border-border pl-3">
          <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            {currentUser.name.charAt(0)}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-foreground">{currentUser.name}</div>
            <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
              {currentUser.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
