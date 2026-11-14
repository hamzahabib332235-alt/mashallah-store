import { useState, useEffect } from 'react';
import { wholesaleStore } from '@/lib/wholesaleStore';

export function useWholesaleStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = wholesaleStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  return {
    store: wholesaleStore,
    settings: wholesaleStore.settings,
    categories: wholesaleStore.categories,
    products: wholesaleStore.products,
    customers: wholesaleStore.customers,
    customerLedger: wholesaleStore.customerLedger,
    suppliers: wholesaleStore.suppliers,
    supplierLedger: wholesaleStore.supplierLedger,
    expenses: wholesaleStore.expenses,
    invoices: wholesaleStore.invoices,
    purchases: wholesaleStore.purchases,
    users: wholesaleStore.users,
    currentUser: wholesaleStore.currentUser,
    stockAdjustments: wholesaleStore.stockAdjustments,
    auditLogs: wholesaleStore.auditLogs,
    metrics: wholesaleStore.getMetrics(),
  };
}
