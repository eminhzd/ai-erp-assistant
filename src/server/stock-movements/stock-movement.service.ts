import { db } from '@/prisma/db';
import { getWarehouseById } from '../warehouses/warehouse.service';
import { getProductById } from '../products/product.service';
import { getPurchaseInvoiceById } from '../purchase-invoices/purchase-invoice.service';
import { getSalesInvoiceById } from '../sales-invoice/sales-invoice.service';

// type StockMovementCreateInput = Parameters<typeof db.orm.public.StockMovement.create>[0];

export type StockMovementType =
  'PURCHASE' | 'SALE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';

export type StockMovementCreateInput = {
  companyId: number;
  warehouseId: number;
  productId: number;
  type: StockMovementType;
  quantity: string;
  salesInvoiceId?: number;
  purchaseInvoiceId?: number;
};

export async function createStockMovement(
  stockMovementData: StockMovementCreateInput,
) {
  const {
    type,
    purchaseInvoiceId,
    salesInvoiceId,
    quantity,
    companyId,
    warehouseId,
    productId,
  } = stockMovementData;

  // Quantity validation
  const parsedQuantity = Number(quantity);

  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error('Stock movement quantity must be greater than zero');
  }

  // Invoice conflict validation
  if (purchaseInvoiceId && salesInvoiceId) {
    throw new Error(
      'Stock movement cannot have both purchase and sales invoice',
    );
  }

  // Movement type validation
  switch (type) {
    case 'PURCHASE':
      if (!purchaseInvoiceId) {
        throw new Error('Purchase movement requires purchase invoice');
      }
      break;

    case 'SALE':
      if (!salesInvoiceId) {
        throw new Error('Sale movement requires sales invoice');
      }
      break;

    case 'ADJUSTMENT_IN':
    case 'ADJUSTMENT_OUT':
      if (purchaseInvoiceId || salesInvoiceId) {
        throw new Error('Adjustment movement cannot have invoice reference');
      }
      break;

    default:
      throw new Error('Invalid stock movement type');
  }

  // Validate warehouse
  const warehouse = await getWarehouseById(companyId, warehouseId);

  if (!warehouse) {
    throw new Error('Warehouse not found or does not belong to company');
  }

  // Validate product
  const product = await getProductById(companyId, productId);

  if (!product) {
    throw new Error('Product not found or does not belong to company');
  }

  // Validate purchase invoice
  if (purchaseInvoiceId) {
    const invoice = await getPurchaseInvoiceById(companyId, purchaseInvoiceId);

    if (!invoice) {
      throw new Error(
        'Purchase invoice not found or does not belong to company',
      );
    }

    if (invoice.warehouseId !== warehouseId) {
      throw new Error(
        'Purchase invoice warehouse does not match movement warehouse',
      );
    }
  }

  // Validate sales invoice
  if (salesInvoiceId) {
    const invoice = await getSalesInvoiceById(companyId, salesInvoiceId);

    if (!invoice) {
      throw new Error('Sales invoice not found or does not belong to company');
    }

    if (invoice.warehouseId !== warehouseId) {
      throw new Error(
        'Sales invoice warehouse does not match movement warehouse',
      );
    }
  }

  return db.orm.public.StockMovement.create(stockMovementData);
}

export async function getStockMovementsByWarehouse(
  companyId: number,
  warehouseId: number,
) {
  return db.orm.public.StockMovement.where({
    companyId,
    warehouseId,
  }).all();
}

export async function getStockMovementsByProduct(
  companyId: number,
  productId: number,
) {
  return db.orm.public.StockMovement.where({ companyId, productId }).all();
}

export async function getStockMovementsById(companyId: number, id: number) {
  return db.orm.public.StockMovement.where({ companyId, id }).first();
}

export async function getStockMovementsByType(
  companyId: number,
  type: StockMovementType,
) {
  return db.orm.public.StockMovement.where({ companyId, type }).all();
}

// export async function increaseStock(
//   companyId: number,
//   warehouseId: number,
//   warehouseData: WarehouseUpdateInput,
// ) {
//   return db.orm.public.Warehouse.where({
//     companyId,
//     id: warehouseId,
//     isActive: true,
//   }).update(warehouseData);
// }

// export async function decreaseStock(companyId: number, warehouseId: number) {
//   return db.orm.public.Warehouse.where({ companyId, id: warehouseId }).update({
//     isActive: false,
//   });
// }
