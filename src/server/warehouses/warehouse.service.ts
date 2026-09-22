import { db } from '@/prisma/db';

export type WarehouseCreateInput = {
  name: string;
  address?: string;
};

export type WarehouseUpdateInput = {
  name?: string;
  address?: string;
};

export async function createWarehouse(
  companyId: number,
  warehouseData: WarehouseCreateInput,
) {
  return db.orm.public.Warehouse.create({
    ...warehouseData,
    companyId,
  });
}

export async function getWarehousesByCompanyId(companyId: number) {
  const warehouses = await db.orm.public.Warehouse.where({ companyId })
    .include('stocks', (stock) => stock.select('quantity'))
    .all();

  return warehouses.map((warehouse) => ({
    ...warehouse,
    products: warehouse.stocks.length,
    units: warehouse.stocks.reduce(
      (total, stock) => total + Number(stock.quantity),
      0,
    ),
  }));
}

export async function getWarehouseById(companyId: number, warehouseId: number) {
  return db.orm.public.Warehouse.where({
    companyId,
    id: warehouseId,
    isActive: true,
  }).first();
}

export async function updateWarehouse(
  companyId: number,
  warehouseId: number,
  warehouseData: WarehouseUpdateInput,
) {
  return db.orm.public.Warehouse.where({
    companyId,
    id: warehouseId,
    isActive: true,
  }).update(warehouseData);
}

export async function deleteWarehouse(companyId: number, warehouseId: number) {
  return db.orm.public.Warehouse.where({
    companyId,
    id: warehouseId,
  }).update({
    isActive: false,
  });
}

export async function findWarehouses(companyId: number, query: string) {
  const normalizedQuery = query.trim();

  return db.orm.public.Warehouse.where({ companyId, isActive: true })
    .where((warehouse) => warehouse.name.ilike(`%${normalizedQuery}%`))
    .all();
}
