import { db } from '@/prisma/db';

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
