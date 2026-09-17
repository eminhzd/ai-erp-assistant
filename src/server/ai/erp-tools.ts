import { createCustomerTools } from './tools/customer-tools';
import { createSupplierTools } from './tools/supplier-tools';
import { createProductTools } from './tools/product-tools';
import { createWarehouseTools } from './tools/warehouse-tools';
import { createWarehouseStockTools } from './tools/warehouse-stock-tools';
import { createPurchaseInvoiceTools } from './tools/purchase-invoice-tools';
import { createSalesInvoiceTools } from './tools/sales-invoice-tools';
import { createStockMovementTools } from './tools/stock-movement-tools';
import { createPurchaseInvoiceItemTools } from './tools/purchase-invoice-items-tools';
import { createSalesInvoiceItemTools } from './tools/sales-invoice-items-tools';

export function createErpTools(companyId: number) {
  return {
    ...createCustomerTools(companyId),
    ...createSupplierTools(companyId),
    ...createProductTools(companyId),
    ...createWarehouseTools(companyId),
    ...createWarehouseStockTools(companyId),
    ...createPurchaseInvoiceTools(companyId),
    ...createSalesInvoiceTools(companyId),
    ...createStockMovementTools(companyId),
    ...createPurchaseInvoiceItemTools(companyId),
    ...createSalesInvoiceItemTools(companyId),
  };
}
