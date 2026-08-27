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
    throw new ValidationError(
      'Stock movement quantity must be greater than zero',
    );
  }

  // Invoice conflict validation
  if (purchaseInvoiceId && salesInvoiceId) {
    throw new ConflictError(
      'Stock movement cannot have both purchase and sales invoice',
    );
  }

  // Movement type validation
  switch (type) {
    case 'PURCHASE':
      if (!purchaseInvoiceId) {
        throw new ValidationError(
          'Purchase movement requires purchase invoice',
        );
      }
      break;

    case 'SALE':
      if (!salesInvoiceId) {
        throw new ValidationError('Sale movement requires sales invoice');
      }
      break;

    case 'ADJUSTMENT_IN':
    case 'ADJUSTMENT_OUT':
      if (purchaseInvoiceId || salesInvoiceId) {
        throw new ValidationError(
          'Adjustment movement cannot have invoice reference',
        );
      }
      break;

    default:
      throw new ValidationError('Invalid stock movement type');
  }

  // Validate warehouse
  const warehouse = await getWarehouseById(companyId, warehouseId);

  if (!warehouse) {
    throw new NotFoundError(
      'Warehouse not found or does not belong to company',
    );
  }

  // Validate product
  const product = await getProductById(companyId, productId);

  if (!product) {
    throw new NotFoundError('Product not found or does not belong to company');
  }

  // Validate purchase invoice
  if (purchaseInvoiceId) {
    const invoice = await getPurchaseInvoiceById(companyId, purchaseInvoiceId);

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
  }

  // Validate sales invoice
  if (salesInvoiceId) {
    const invoice = await getSalesInvoiceById(companyId, salesInvoiceId);

    if (!invoice) {
      throw new NotFoundError(
        'Sales invoice not found or does not belong to company',
      );
    }

    if (invoice.warehouseId !== warehouseId) {
      throw new NotFoundError(
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
