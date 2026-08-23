import { db } from '@/prisma/db';

// type PurchaseInvoiceCreateInput = Parameters<
//   typeof db.orm.public.PurchaseInvoice.create
// >[0];

export type PurchaseInvoiceCreateInput = {
  companyId: number;
  supplierId: number;
  warehouseId: number;
  invoiceNumber: string;
  status?: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
  currency: 'USD' | 'EUR' | 'AZN';
  subtotal: string;
  discount?: string;
  tax?: string;
  total: string;
  issueDate?: Date;
  dueDate?: Date;
  notes?: string;
};

export type PurchaseInvoiceUpdateInput = {
  warehouseId?: number;
  supplierId?: number;
  invoiceNumber?: string;
  status?: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
  currency?: 'USD' | 'EUR' | 'AZN';
  subtotal?: string;
  discount?: string;
  tax?: string;
  total?: string;
  issueDate?: Date;
  dueDate?: Date;
  notes?: string;
};

export async function createPurchaseInvoice(
  invoiceData: PurchaseInvoiceCreateInput,
) {
  return db.orm.public.PurchaseInvoice.create(invoiceData);
}

export async function getPurchaseInvoicesByCompanyId(companyId: number) {
  return db.orm.public.PurchaseInvoice.where({
    companyId,
  }).all();
}

export async function getPurchaseInvoiceById(companyId: number, id: number) {
  return db.orm.public.PurchaseInvoice.where({ companyId, id }).first();
}

export async function updatePurchaseInvoice(
  companyId: number,
  id: number,
  invoiceData: PurchaseInvoiceUpdateInput,
) {
  return db.orm.public.PurchaseInvoice.where({ companyId, id }).update(
    invoiceData,
  );
}
