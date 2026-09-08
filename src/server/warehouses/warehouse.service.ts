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
  return db.orm.public.Warehouse.where({
    companyId,
    isActive: true,
  }).all();
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
