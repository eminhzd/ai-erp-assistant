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
  const suppliers = await db.orm.public.Supplier.where({ companyId })
    .include('purchaseInvoices', (invoice) => invoice.select('id'))
    .all();

  return suppliers.map((supplier) => ({
    ...supplier,
    invoices: supplier.purchaseInvoices.length,
  }));
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

export async function findSuppliers(companyId: number, query: string) {
  const normalizedQuery = query.trim();

  return db.orm.public.Supplier.where({ companyId, isActive: true })
    .where((supplier) => supplier.name.ilike(`%${normalizedQuery}%`))
    .all();
}
