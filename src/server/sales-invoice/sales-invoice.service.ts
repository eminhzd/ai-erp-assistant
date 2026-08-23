import { db } from '@/prisma/db';

export type SalesInvoiceCreateInput = {
  companyId: number;
  customerId: number;
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

export type SalesInvoiceUpdateInput = {
  warehouseId?: number;
  customerId?: number;
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

export async function createSalesInvoice(invoiceData: SalesInvoiceCreateInput) {
  return db.orm.public.SalesInvoice.create(invoiceData);
}

export async function getSalesInvoicesByCompanyId(companyId: number) {
  return db.orm.public.SalesInvoice.where({
    companyId,
  }).all();
}

export async function getSalesInvoiceById(companyId: number, id: number) {
  return db.orm.public.SalesInvoice.where({ companyId, id }).first();
}

export async function updateSalesInvoice(
  companyId: number,
  id: number,
  invoiceData: SalesInvoiceUpdateInput,
) {
  return db.orm.public.SalesInvoice.where({ companyId, id }).update(
    invoiceData,
  );
}
