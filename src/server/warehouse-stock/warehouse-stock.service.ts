import { db } from '@/prisma/db';

import type { DbClient } from '@/prisma/types';

import {
  addDecimal,
  compareDecimal,
  isPositiveDecimal,
  subtractDecimal,
} from '@/lib/decimal';

import { ConflictError, NotFoundError, ValidationError } from '@/lib/errors';

export type WarehouseStockCreateInput = {
  productId: number;
  quantity: string;
};

export type WarehouseStockOperationInput = {
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

  if (!isPositiveDecimal(quantity)) {
    throw new ValidationError(
      'Warehouse stock quantity must be greater than zero',
    );
  }

  const existing = await getWarehouseStock(
    companyId,
    warehouseId,
    productId,
    client,
  );

  if (existing) {
    throw new ConflictError('Warehouse stock already exists');
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

  return client.orm.public.WarehouseStock.create({
    companyId,
    warehouseId,
    productId,
    quantity,
  });
}

export async function getWarehouseStocksByCompanyId(companyId: number) {
  const stocks = await db.orm.public.WarehouseStock.where({ companyId })
    .include('product', (product) => product.select('name', 'sku', 'unit'))
    .include('warehouse', (warehouse) => warehouse.select('name'))
    .all();

  return stocks;
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
  companyId: number,
  { warehouseId, productId, quantity }: WarehouseStockOperationInput,
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

  const newQuantity = addDecimal(currentStock.quantity, quantity);

  return client.orm.public.WarehouseStock.where({
    companyId,
    warehouseId,
    productId,
  }).update({
    quantity: newQuantity,
  });
}

export async function decreaseWarehouseStock(
  companyId: number,
  { warehouseId, productId, quantity }: WarehouseStockOperationInput,
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

  const newQuantity = subtractDecimal(currentStock.quantity, quantity);

  return client.orm.public.WarehouseStock.where({
    companyId,
    warehouseId,
    productId,
  }).update({
    quantity: newQuantity,
  });
}
