import { db } from '@/prisma/db';

import type { DbClient } from '@/prisma/types';

import {
  decreaseWarehouseStock,
  increaseWarehouseStock,
} from '../warehouse-stock/warehouse-stock.service';

import { compareDecimal, isPositiveDecimal } from '@/lib/decimal';

import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors';

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

async function validateStockMovement(
  stockMovementData: StockMovementCreateInput,
  client: DbClient,
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

  if (!isPositiveDecimal(quantity)) {
    throw new ValidationError(
      'Stock movement quantity must be greater than zero',
    );
  }

  const hasPurchaseInvoice = purchaseInvoiceId !== undefined;
  const hasSalesInvoice = salesInvoiceId !== undefined;

  if (hasPurchaseInvoice && hasSalesInvoice) {
    throw new ConflictError(
      'Stock movement cannot have both purchase and sales invoice',
    );
  }

  switch (type) {
    case 'PURCHASE':
      if (!hasPurchaseInvoice) {
        throw new ValidationError(
          'Purchase movement requires purchase invoice',
        );
      }
      break;

    case 'SALE':
      if (!hasSalesInvoice) {
        throw new ValidationError('Sale movement requires sales invoice');
      }
      break;

    case 'ADJUSTMENT_IN':
    case 'ADJUSTMENT_OUT':
      if (hasPurchaseInvoice || hasSalesInvoice) {
        throw new ValidationError(
          'Adjustment movement cannot have invoice reference',
        );
      }
      break;

    default:
      throw new ValidationError('Invalid stock movement type');
  }

  const warehouse = await client.orm.public.Warehouse.where({
    companyId,
    id: warehouseId,
  }).first();

  if (!warehouse) {
    throw new NotFoundError(
      'Warehouse not found or does not belong to company',
    );
  }

  const product = await client.orm.public.Product.where({
    companyId,
    id: productId,
  }).first();

  if (!product) {
    throw new NotFoundError('Product not found or does not belong to company');
  }

  if (hasPurchaseInvoice) {
    const invoice = await client.orm.public.PurchaseInvoice.where({
      companyId,
      id: purchaseInvoiceId,
    }).first();

    if (!invoice) {
      throw new NotFoundError(
        'Purchase invoice not found or does not belong to company',
      );
    }

    if (invoice.warehouseId !== warehouseId) {
      throw new ConflictError(
        'Purchase invoice warehouse does not match movement warehouse',
      );
    }

    const invoiceItem = await client.orm.public.PurchaseInvoiceItem.where({
      invoiceId: invoice.id,
      productId,
    }).first();

    if (!invoiceItem) {
      throw new ConflictError(
        'Product is not included in the purchase invoice',
      );
    }

    if (compareDecimal(quantity, invoiceItem.quantity) !== 0) {
      throw new ConflictError(
        'Stock movement quantity must match purchase invoice item quantity',
      );
    }

    const existingMovement = await client.orm.public.StockMovement.where({
      purchaseInvoiceId: invoice.id,
      productId,
      type: 'PURCHASE',
    }).first();

    if (existingMovement) {
      throw new ConflictError(
        'Purchase invoice already has a stock movement for this product',
      );
    }
  }

  if (hasSalesInvoice) {
    const invoice = await client.orm.public.SalesInvoice.where({
      companyId,
      id: salesInvoiceId,
    }).first();

    if (!invoice) {
      throw new NotFoundError(
        'Sales invoice not found or does not belong to company',
      );
    }

    if (invoice.warehouseId !== warehouseId) {
      throw new ConflictError(
        'Sales invoice warehouse does not match movement warehouse',
      );
    }

    const invoiceItem = await client.orm.public.SalesInvoiceItem.where({
      invoiceId: invoice.id,
      productId,
    }).first();

    if (!invoiceItem) {
      throw new ConflictError('Product is not included in the sales invoice');
    }

    if (compareDecimal(quantity, invoiceItem.quantity) !== 0) {
      throw new ConflictError(
        'Stock movement quantity must match sales invoice item quantity',
      );
    }

    const existingMovement = await client.orm.public.StockMovement.where({
      salesInvoiceId: invoice.id,
      productId,
      type: 'SALE',
    }).first();

    if (existingMovement) {
      throw new ConflictError(
        'Sales invoice already has a stock movement for this product',
      );
    }
  }
}

export async function createStockMovementInTransaction(
  stockMovementData: StockMovementCreateInput,
  client: DbClient,
) {
  await validateStockMovement(stockMovementData, client);

  const { type, companyId, warehouseId, productId, quantity } =
    stockMovementData;

  const movement =
    await client.orm.public.StockMovement.create(stockMovementData);

  const stockOperationData = {
    companyId,
    warehouseId,
    productId,
    quantity,
  };

  switch (type) {
    case 'PURCHASE':
    case 'ADJUSTMENT_IN':
      await increaseWarehouseStock(stockOperationData, client);
      break;

    case 'SALE':
    case 'ADJUSTMENT_OUT':
      await decreaseWarehouseStock(stockOperationData, client);
      break;

    default:
      throw new ValidationError('Invalid stock movement type');
  }

  return movement;
}

export async function createStockMovement(
  stockMovementData: StockMovementCreateInput,
) {
  return db.transaction(async (tx: DbClient) => {
    return createStockMovementInTransaction(stockMovementData, tx);
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

export async function getStockMovementById(companyId: number, id: number) {
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
