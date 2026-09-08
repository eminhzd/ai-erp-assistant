import { db } from '@/prisma/db';

export type SupplierCreateInput = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
};

export type SupplierUpdateInput = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
};

export async function createSupplier(
  companyId: number,
  supplierData: SupplierCreateInput,
) {
  return db.orm.public.Supplier.create({
    ...supplierData,
    companyId,
  });
}

export async function getSuppliersByCompanyId(companyId: number) {
  return db.orm.public.Supplier.where({
    companyId,
    isActive: true,
  }).all();
}

export async function getSupplierById(companyId: number, supplierId: number) {
  return db.orm.public.Supplier.where({
    companyId,
    id: supplierId,
    isActive: true,
  }).first();
}

export async function updateSupplier(
  companyId: number,
  supplierId: number,
  supplierData: SupplierUpdateInput,
) {
  return db.orm.public.Supplier.where({
    companyId,
    id: supplierId,
    isActive: true,
  }).update(supplierData);
}

export async function deleteSupplier(companyId: number, supplierId: number) {
  return db.orm.public.Supplier.where({
    companyId,
    id: supplierId,
  }).update({
    isActive: false,
  });
}
