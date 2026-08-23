import { db } from '@/prisma/db';
import { getPurchaseInvoiceById } from '../purchase-invoices/purchase-invoice.service';

export type PurchaseInvoiceItemCreateInput = {
  invoiceId: number;
  productId: number;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
};

export type PurchaseInvoiceItemUpdateInput = {
  productId?: number;
  quantity?: string;
  unitPrice?: string;
  lineTotal?: string;
};

export async function createPurchaseInvoiceItem(
  companyId: number,
  invoiceData: PurchaseInvoiceItemCreateInput,
) {
  const invoice = await getPurchaseInvoiceById(
    companyId,
    invoiceData.invoiceId,
  );

  if (!invoice) {
    throw new Error('Purchase invoice not found');
  }

  return db.orm.public.PurchaseInvoiceItem.create(invoiceData);
}

export async function getPurchaseInvoiceItemsByInvoiceId(
  companyId: number,
  invoiceId: number,
) {
  const invoice = await getPurchaseInvoiceById(companyId, invoiceId);

  if (!invoice) {
    return [];
  }

  return db.orm.public.PurchaseInvoiceItem.where({
    invoiceId: invoice.id,
  }).all();
}

export async function getPurchaseInvoiceItemById(
  companyId: number,
  invoiceId: number,
  itemId: number,
) {
  const invoice = await getPurchaseInvoiceById(companyId, invoiceId);

  if (!invoice) {
    return null;
  }

  return db.orm.public.PurchaseInvoiceItem.where({
    invoiceId: invoice.id,
    id: itemId,
  }).first();
}

export async function updatePurchaseInvoiceItem(
  companyId: number,
  invoiceId: number,
  itemId: number,
  updateData: PurchaseInvoiceItemUpdateInput,
) {
  const invoice = await getPurchaseInvoiceById(companyId, invoiceId);

  if (!invoice) {
    return null;
  }

  return db.orm.public.PurchaseInvoiceItem.where({
    invoiceId: invoice.id,
    id: itemId,
  }).update(updateData);
}

export async function deletePurchaseInvoiceItem(
  companyId: number,
  invoiceId: number,
  itemId: number,
) {
  const invoice = await getPurchaseInvoiceById(companyId, invoiceId);

  if (!invoice) {
    return null;
  }

  return db.orm.public.PurchaseInvoiceItem.where({
    invoiceId: invoice.id,
    id: itemId,
  }).delete();
}
