import { db } from '@/prisma/db';

import type { DbClient } from '@/prisma/types';

import { NotFoundError } from '@/lib/errors';

export type PurchaseInvoiceItemCreateInput = {
  invoiceId: number;
  productId: number;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
};

export async function createPurchaseInvoiceItemInTransaction(
  companyId: number,
  itemData: PurchaseInvoiceItemCreateInput,
  client: DbClient,
) {
  const invoice = await client.orm.public.PurchaseInvoice.where({
    companyId,
    id: itemData.invoiceId,
  }).first();

  if (!invoice) {
    throw new NotFoundError('Purchase invoice not found');
  }

  const product = await client.orm.public.Product.where({
    companyId,
    id: itemData.productId,
  }).first();

  if (!product) {
    throw new NotFoundError('Product not found or does not belong to company');
  }

  return client.orm.public.PurchaseInvoiceItem.create(itemData);
}

export async function getPurchaseInvoiceItemsByInvoiceId(
  companyId: number,
  invoiceId: number,
) {
  const invoice = await db.orm.public.PurchaseInvoice.where({
    companyId,
    id: invoiceId,
  }).first();

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
  const invoice = await db.orm.public.PurchaseInvoice.where({
    companyId,
    id: invoiceId,
  }).first();

  if (!invoice) {
    return null;
  }

  return db.orm.public.PurchaseInvoiceItem.where({
    invoiceId: invoice.id,
    id: itemId,
  }).first();
}
