import { describe, expect, it, beforeEach } from 'vitest';
import { wholesaleStore } from '@/lib/wholesaleStore';

describe('MASHAALLAH WHOLESALE Store & Business Logic', () => {
  beforeEach(() => {
    wholesaleStore.resetToDefaults();
  });

  it('initializes with default settings, products and customers', () => {
    expect(wholesaleStore.settings.shopName).toBe('MASHAALLAH WHOLESALE');
    expect(wholesaleStore.settings.currency).toBe('PKR');
    expect(wholesaleStore.products.length).toBeGreaterThan(5);
    expect(wholesaleStore.customers.length).toBeGreaterThan(2);
    expect(wholesaleStore.suppliers.length).toBeGreaterThan(1);
  });

  it('authenticates admin Hamza Habib successfully with credentials', () => {
    // 1. Success with correct admin credentials (hamzahabib / 242006)
    const authResult = wholesaleStore.authenticate('hamzahabib', '242006');
    expect(authResult.success).toBe(true);
    expect(authResult.user?.name).toBe('Hamza Habib');
    expect(authResult.user?.username).toBe('hamzahabib');
    expect(authResult.user?.role).toBe('admin');
    expect(wholesaleStore.currentUser.name).toBe('Hamza Habib');

    // 2. Failure with wrong password
    const failedAuth = wholesaleStore.authenticate('hamzahabib', 'wrongpass');
    expect(failedAuth.success).toBe(false);
    expect(failedAuth.error).toBeDefined();

    // 3. Failure with unknown user
    const unknownAuth = wholesaleStore.authenticate('unknown_user', 'pass');
    expect(unknownAuth.success).toBe(false);
  });

  it('correctly creates a sale, deducts product stock, and updates customer ledger for credit sale', () => {
    const product = wholesaleStore.products[0];
    const initialStock = product.currentStock;
    const customer = wholesaleStore.customers[0];
    const initialBalance = customer.outstandingBalance;

    const qtyToSell = 5;
    const unitPrice = product.wholesalePrice;
    const total = qtyToSell * unitPrice;
    const paidAmount = 10000;
    const expectedBalanceDue = total - paidAmount;

    const invoice = wholesaleStore.createSale({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      items: [
        {
          productId: product.id,
          productName: product.name,
          unit: product.unit,
          quantity: qtyToSell,
          priceType: 'wholesale',
          unitPrice,
          purchasePrice: product.purchasePrice,
          total,
        },
      ],
      discount: 0,
      tax: 0,
      paymentMethod: 'split',
      paidAmount,
      receiptSize: '80mm',
    });

    // 1. Verify invoice generated
    expect(invoice.invoiceNo).toMatch(/^MW-\d+/);
    expect(invoice.total).toBe(total);
    expect(invoice.paidAmount).toBe(paidAmount);
    expect(invoice.balanceDue).toBe(expectedBalanceDue);

    // 2. Verify stock deducted
    const updatedProduct = wholesaleStore.products.find((p) => p.id === product.id);
    expect(updatedProduct?.currentStock).toBe(initialStock - qtyToSell);

    // 3. Verify customer outstanding balance updated
    const updatedCustomer = wholesaleStore.customers.find((c) => c.id === customer.id);
    expect(updatedCustomer?.outstandingBalance).toBe(initialBalance + expectedBalanceDue);

    // 4. Verify customer ledger entry exists
    const lastLedger = wholesaleStore.customerLedger[wholesaleStore.customerLedger.length - 1];
    expect(lastLedger.customerId).toBe(customer.id);
    expect(lastLedger.referenceNo).toBe(invoice.invoiceNo);
    expect(lastLedger.debit).toBe(total);
    expect(lastLedger.credit).toBe(paidAmount);
  });

  it('correctly processes sales return, restoring warehouse stock and reversing customer debt', () => {
    const product = wholesaleStore.products[0];
    const initialStock = product.currentStock;
    const customer = wholesaleStore.customers[0];
    const initialCustomerBalance = customer.outstandingBalance;

    const invoice = wholesaleStore.createSale({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      items: [
        {
          productId: product.id,
          productName: product.name,
          unit: product.unit,
          quantity: 4,
          priceType: 'wholesale',
          unitPrice: product.wholesalePrice,
          purchasePrice: product.purchasePrice,
          total: 4 * product.wholesalePrice,
        },
      ],
      discount: 0,
      tax: 0,
      paymentMethod: 'credit',
      paidAmount: 0,
    });

    const stockAfterSale = wholesaleStore.products.find((p) => p.id === product.id)?.currentStock;
    expect(stockAfterSale).toBe(initialStock - 4);

    // Perform return
    const returned = wholesaleStore.returnSale(invoice.id, 'Customer cancellation');
    expect(returned).toBe(true);

    // Verify stock restored
    const stockAfterReturn = wholesaleStore.products.find((p) => p.id === product.id)?.currentStock;
    expect(stockAfterReturn).toBe(initialStock);

    // Verify customer balance returned to initial
    const customerAfterReturn = wholesaleStore.customers.find((c) => c.id === customer.id);
    expect(customerAfterReturn?.outstandingBalance).toBe(initialCustomerBalance);
  });

  it('correctly records customer payments and reduces outstanding Udhaar balance', () => {
    const customer = wholesaleStore.customers[0];
    const initialBalance = customer.outstandingBalance;
    const paymentAmount = 25000;

    const success = wholesaleStore.recordCustomerPayment(
      customer.id,
      paymentAmount,
      'cash',
      'RCP-TEST-01'
    );

    expect(success).toBe(true);
    const updatedCustomer = wholesaleStore.customers.find((c) => c.id === customer.id);
    expect(updatedCustomer?.outstandingBalance).toBe(initialBalance - paymentAmount);

    const latestLedger = wholesaleStore.customerLedger[wholesaleStore.customerLedger.length - 1];
    expect(latestLedger.credit).toBe(paymentAmount);
    expect(latestLedger.balance).toBe(initialBalance - paymentAmount);
  });

  it('records supplier purchase, replenishes stock and updates supplier payable balance', () => {
    const supplier = wholesaleStore.suppliers[0];
    const product = wholesaleStore.products[0];
    const initialStock = product.currentStock;
    const initialPayable = supplier.payableBalance;

    const purchaseQty = 20;
    const unitCost = 6500;
    const totalAmount = purchaseQty * unitCost;
    const paidAmount = 50000;
    const balanceDue = totalAmount - paidAmount;

    const purchase = wholesaleStore.createPurchase({
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: [
        {
          productId: product.id,
          productName: product.name,
          unit: product.unit,
          quantity: purchaseQty,
          unitCost,
          total: totalAmount,
        },
      ],
      paidAmount,
      paymentMethod: 'bank',
    });

    expect(purchase.totalAmount).toBe(totalAmount);
    expect(purchase.balanceDue).toBe(balanceDue);

    // Verify stock increased
    const updatedProduct = wholesaleStore.products.find((p) => p.id === product.id);
    expect(updatedProduct?.currentStock).toBe(initialStock + purchaseQty);

    // Verify supplier payable updated
    const updatedSupplier = wholesaleStore.suppliers.find((s) => s.id === supplier.id);
    expect(updatedSupplier?.payableBalance).toBe(initialPayable + balanceDue);
  });

  it('calculates financial metrics accurately (Gross Profit = Net Sales - COGS)', () => {
    const metrics = wholesaleStore.getMetrics();
    expect(typeof metrics.todaySales).toBe('number');
    expect(typeof metrics.todayGrossProfit).toBe('number');
    expect(typeof metrics.todayNetProfit).toBe('number');
    expect(metrics.totalProducts).toBe(wholesaleStore.products.length);
    expect(metrics.totalStockValue).toBeGreaterThan(0);
  });

  it('exports and restores complete JSON backup with integrity', () => {
    const exportedJSON = wholesaleStore.exportBackup();
    expect(exportedJSON).toContain('MASHAALLAH WHOLESALE');

    // Make an adjustment
    wholesaleStore.products[0].name = 'Modified Product Name';
    expect(wholesaleStore.products[0].name).toBe('Modified Product Name');

    // Restore from backup
    const restored = wholesaleStore.importBackup(exportedJSON);
    expect(restored).toBe(true);
    expect(wholesaleStore.products[0].name).not.toBe('Modified Product Name');
  });
});
