import { db } from '@/prisma/db';

import { getWarehouseById } from '../warehouses/warehouse.service';
import { getProductById } from '../products/product.service';
import { getPurchaseInvoiceById } from '../purchase-invoices/purchase-invoice.service';
import { getSalesInvoiceById } from '../sales-invoice/sales-invoice.service';

import {
  decreaseWarehouseStock,
  increaseWarehouseStock,
} from '../warehouse-stock/warehouse-stock.service';

import { isPositiveDecimal } from '@/lib/decimal';

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
  if (!isPositiveDecimal(quantity)) {
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

  return db.transaction(async (tx) => {
    const movement =
      await tx.orm.public.StockMovement.create(stockMovementData);

    const stockOperationData = {
      companyId,
      warehouseId,
      productId,
      quantity,
    };

    switch (type) {
      case 'PURCHASE':
      case 'ADJUSTMENT_IN':
        await increaseWarehouseStock(stockOperationData, tx);

        break;

      case 'SALE':
      case 'ADJUSTMENT_OUT':
        await decreaseWarehouseStock(stockOperationData, tx);

        break;
    }

    return movement;
  });
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
  return db.orm.public.StockMovement.where({
    companyId,
    productId,
  }).all();
}

export async function getStockMovementsById(companyId: number, id: number) {
  return db.orm.public.StockMovement.where({
    companyId,
    id,
  }).first();
}

export async function getStockMovementsByType(
  companyId: number,
  type: StockMovementType,
) {
  return db.orm.public.StockMovement.where({
    companyId,
    type,
  }).all();
}
