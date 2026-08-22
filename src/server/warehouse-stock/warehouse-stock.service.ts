import { db } from '@/prisma/db';

// type WarehouseStockCreateInput = Parameters<typeof db.orm.public.WarehouseStock.create>[0];

export type WarehouseStockCreateInput = {
  warehouseId: number;
  productId: number;
  quantity: string;
};

export async function createWarehouseStock(
  warehouseStockData: WarehouseStockCreateInput,
) {
  return db.orm.public.WarehouseStock.create(warehouseStockData);
}

export async function getWarehouseStocksByWarehouse(warehouseId: number) {
  return db.orm.public.WarehouseStock.where({
    warehouseId,
  }).all();
}

export async function getWarehouseStock(
  warehouseId: number,
  productId: number,
) {
  return db.orm.public.WarehouseStock.where({ warehouseId, productId }).first();
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
