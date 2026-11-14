import React, { useState } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { Sidebar, ActiveTab } from './Sidebar';
import { Header } from './Header';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { PosView } from './views/PosView';
import { SalesHistoryView } from './views/SalesHistoryView';
import { ProductsView } from './views/ProductsView';
import { CategoriesView } from './views/CategoriesView';
import { InventoryView } from './views/InventoryView';
import { PurchasesView } from './views/PurchasesView';
import { SuppliersView } from './views/SuppliersView';
import { CustomersView } from './views/CustomersView';
import { CustomerLedgerView } from './views/CustomerLedgerView';
import { SupplierLedgerView } from './views/SupplierLedgerView';
import { ExpensesView } from './views/ExpensesView';
import { ProfitLossView } from './views/ProfitLossView';
import { ReportsView } from './views/ReportsView';
import { UsersView } from './views/UsersView';
import { SettingsView } from './views/SettingsView';

export const WholesaleApp: React.FC = () => {
  const { store, currentUser } = useWholesaleStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return store.isSessionActive();
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedCustomerIdForLedger, setSelectedCustomerIdForLedger] = useState<string | undefined>(
    undefined
  );

  const handleLogout = () => {
    store.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginView onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenQuickSale={() => setActiveTab('pos')}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/40">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'pos' && <PosView />}
          {activeTab === 'sales' && <SalesHistoryView />}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'categories' && <CategoriesView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'purchases' && <PurchasesView />}
          {activeTab === 'suppliers' && <SuppliersView />}
          {activeTab === 'customers' && (
            <CustomersView
              setActiveTab={setActiveTab}
              onSelectCustomerForLedger={(cId) => setSelectedCustomerIdForLedger(cId)}
            />
          )}
          {activeTab === 'customer-ledger' && (
            <CustomerLedgerView initialCustomerId={selectedCustomerIdForLedger} />
          )}
          {activeTab === 'supplier-ledger' && <SupplierLedgerView />}
          {activeTab === 'expenses' && <ExpensesView />}
          {activeTab === 'profit-loss' && <ProfitLossView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'users' && <UsersView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};
