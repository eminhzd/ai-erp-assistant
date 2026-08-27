import { db } from '@/prisma/db';

import {
  addDecimal,
  compareDecimal,
  isPositiveDecimal,
  subtractDecimal,
} from '@/lib/decimal';

import type { DbClient } from '@/prisma/types';
import { ConflictError, ValidationError, NotFoundError } from '@/lib/errors';

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
  client: DbClient = db,
) {
  const { productId, quantity } = warehouseStockData;

  const existing = await getWarehouseStock(
    companyId,
    warehouseId,
    productId,
    client,
  );

  if (existing) {
    throw new ConflictError('Warehouse stock already exists');
  }

  return client.orm.public.WarehouseStock.create({
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
  client: DbClient = db,
) {
  return client.orm.public.WarehouseStock.where({
    companyId,
    warehouseId,
    productId,
  }).first();
}

export async function increaseWarehouseStock(
  { companyId, warehouseId, productId, quantity }: WarehouseStockOperationInput,
  client: DbClient = db,
) {
  if (!isPositiveDecimal(quantity)) {
    throw new ValidationError('Quantity must be a positive decimal value');
  }

  const currentStock = await getWarehouseStock(
    companyId,
    warehouseId,
    productId,
    client,
  );

  if (!currentStock) {
    return createWarehouseStock(
      companyId,
      warehouseId,
      {
        productId,
        quantity,
      },
      client,
    );
  }

  return client.orm.public.WarehouseStock.where({
    companyId,
    warehouseId,
    productId,
  }).update({
    quantity: addDecimal(currentStock.quantity, quantity),
  });
}

export async function decreaseWarehouseStock(
  { companyId, warehouseId, productId, quantity }: WarehouseStockOperationInput,
  client: DbClient = db,
) {
  if (!isPositiveDecimal(quantity)) {
    throw new ValidationError('Quantity must be a positive decimal value');
  }

  const currentStock = await getWarehouseStock(
    companyId,
    warehouseId,
    productId,
    client,
  );

  if (!currentStock) {
    throw new NotFoundError('Warehouse stock not found');
  }

  if (compareDecimal(currentStock.quantity, quantity) < 0) {
    throw new ConflictError('Insufficient stock quantity');
  }

  return client.orm.public.WarehouseStock.where({
    companyId,
    warehouseId,
    productId,
  }).update({
    quantity: subtractDecimal(currentStock.quantity, quantity),
  });
}
