import { db } from '@/prisma/db';
import { getSalesInvoiceById } from '../sales-invoice/sales-invoice.service';
import { NotFoundError } from '@/lib/errors/not-found-error';

export type SalesInvoiceItemCreateInput = {
  invoiceId: number;
  productId: number;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
};

export type SalesInvoiceItemUpdateInput = {
  productId?: number;
  quantity?: string;
  unitPrice?: string;
  lineTotal?: string;
};

export async function createSalesInvoiceItem(
  companyId: number,
  invoiceData: SalesInvoiceItemCreateInput,
) {
  const invoice = await getSalesInvoiceById(companyId, invoiceData.invoiceId);

  if (!invoice) {
    throw new NotFoundError('Sales invoice not found');
  }

  return db.orm.public.SalesInvoiceItem.create(invoiceData);
}

export async function getSalesInvoiceItemsByInvoiceId(
  companyId: number,
  invoiceId: number,
) {
  const invoice = await getSalesInvoiceById(companyId, invoiceId);

  if (!invoice) {
    return [];
  }

  return db.orm.public.SalesInvoiceItem.where({
    invoiceId: invoice.id,
  }).all();
}

export async function getSalesInvoiceItemById(
  companyId: number,
  invoiceId: number,
  itemId: number,
) {
  const invoice = await getSalesInvoiceById(companyId, invoiceId);

  if (!invoice) {
    return null;
  }

  return db.orm.public.SalesInvoiceItem.where({
    invoiceId: invoice.id,
    id: itemId,
  }).first();
}

export async function updateSalesInvoiceItem(
  companyId: number,
  invoiceId: number,
  itemId: number,
  updateData: SalesInvoiceItemUpdateInput,
) {
  const invoice = await getSalesInvoiceById(companyId, invoiceId);

  if (!invoice) {
    return null;
  }

  return db.orm.public.SalesInvoiceItem.where({
    invoiceId: invoice.id,
    id: itemId,
  }).update(updateData);
}

export async function deleteSalesInvoiceItem(
  companyId: number,
  invoiceId: number,
  itemId: number,
) {
  const invoice = await getSalesInvoiceById(companyId, invoiceId);

  if (!invoice) {
    return null;
  }

  return db.orm.public.SalesInvoiceItem.where({
    invoiceId: invoice.id,
    id: itemId,
  }).delete();
}
