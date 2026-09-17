export function getToolStatusText(name: string) {
  const labels: Record<string, string> = {
    listCustomers: 'Looking for customers…',
    findCustomers: 'Finding customers…',
    getCustomer: 'Getting customer data…',
    createCustomer: 'Creating customer…',
    updateCustomer: 'Updating customer…',
    deleteCustomer: 'Deleting customer…',

    listSuppliers: 'Looking for suppliers…',
    findSuppliers: 'Finding suppliers…',
    getSupplier: 'Getting supplier data…',
    createSupplier: 'Creating supplier…',
    updateSupplier: 'Updating supplier…',
    deleteSupplier: 'Deleting supplier…',

    listProducts: 'Looking for products…',
    findProducts: 'Finding products…',
    getProduct: 'Getting product data…',
    createProduct: 'Creating product…',
    updateProduct: 'Updating product…',
    deleteProduct: 'Deleting product…',

    listWarehouses: 'Looking for warehouses…',
    findWarehouses: 'Finding warehouses…',
    getWarehouse: 'Getting warehouse data…',
    createWarehouse: 'Creating warehouse…',
    updateWarehouse: 'Updating warehouse…',
    deleteWarehouse: 'Deleting warehouse…',

    listWarehouseStock: 'Checking warehouse stock…',
    getWarehouseStock: 'Checking stock quantity…',

    listPurchaseInvoices: 'Looking for purchase invoices…',
    getPurchaseInvoice: 'Getting purchase invoice…',
    createPurchaseInvoice: 'Creating purchase invoice…',
    markPurchaseInvoiceAsPaid: 'Marking purchase invoice as paid…',

    listSalesInvoices: 'Looking for sales invoices…',
    getSalesInvoice: 'Getting sales invoice…',
    createSalesInvoice: 'Creating sales invoice…',
    markSalesInvoiceAsPaid: 'Marking sales invoice as paid…',

    getPurchaseInvoiceItems: 'Getting purchase invoice items…',
    getSalesInvoiceItems: 'Getting sales invoice items…',

    listStockMovementsByWarehouse: 'Checking warehouse movements…',
    listStockMovementsByProduct: 'Checking product movements…',
    listStockMovementsByType: 'Checking stock movements…',
    getStockMovement: 'Getting stock movement…',
    createStockAdjustment: 'Adjusting warehouse stock…',
  };

  return labels[name] ?? `Executing ${name}…`;
}
