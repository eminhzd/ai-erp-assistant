import { db } from '@/prisma/db';
import {
  addDecimal,
  compareDecimal,
  isPositiveDecimal,
  subtractDecimal,
} from '@/lib/decimal';

export type WarehouseStockCreateInput = {
  productId: number;
  quantity: string;
};

export type WarehouseStockOperationInput = {
  companyId: number;
  warehouseId: number;
  productId: number;
  quantity: string;
};

export async function createWarehouseStock(
  companyId: number,
  warehouseId: number,
  warehouseStockData: WarehouseStockCreateInput,
) {
  const { productId, quantity } = warehouseStockData;

  return db.orm.public.WarehouseStock.create({
    companyId,
    warehouseId,
    productId,
    quantity,
  });
}

export async function getWarehouseStocksByWarehouseId(
  companyId: number,
  warehouseId: number,
) {
  return db.orm.public.WarehouseStock.where({
    companyId,
    warehouseId,
  }).all();
}

export async function getWarehouseStock(
  companyId: number,
  warehouseId: number,
  productId: number,
) {
  return db.orm.public.WarehouseStock.where({
    companyId,
    warehouseId,
    productId,
  }).first();
}

export async function increaseWarehouseStock({
  companyId,
  warehouseId,
  productId,
  quantity,
}: WarehouseStockOperationInput) {
  if (!isPositiveDecimal(quantity)) {
    throw new Error('Quantity must be a positive decimal value');
  }

  const currentStock = await getWarehouseStock(
    companyId,
    warehouseId,
    productId,
  );

  if (!currentStock) {
    return createWarehouseStock(companyId, warehouseId, {
      productId,
      quantity,
    });
  }

  return db.orm.public.WarehouseStock.where({
    companyId,
    warehouseId,
    productId,
  }).update({
    quantity: addDecimal(currentStock.quantity, quantity),
  });
}

export async function decreaseWarehouseStock({
  companyId,
  warehouseId,
  productId,
  quantity,
}: WarehouseStockOperationInput) {
  if (!isPositiveDecimal(quantity)) {
    throw new Error('Quantity must be a positive decimal value');
  }

  const currentStock = await getWarehouseStock(
    companyId,
    warehouseId,
    productId,
  );

  if (!currentStock) {
    throw new Error('Warehouse stock not found');
  }

  if (compareDecimal(currentStock.quantity, quantity) === -1) {
    throw new Error('Insufficient stock quantity');
  }

  return db.orm.public.WarehouseStock.where({
    companyId,
    warehouseId,
    productId,
  }).update({
    quantity: subtractDecimal(currentStock.quantity, quantity),
  });
}
