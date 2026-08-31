import { db } from '@/prisma/db';

import type { DbClient } from '@/prisma/types';

import { NotFoundError } from '@/lib/errors/not-found-error';

export type SalesInvoiceItemCreateInput = {
  invoiceId: number;
  productId: number;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
};

export async function createSalesInvoiceItemInTransaction(
  companyId: number,
  itemData: SalesInvoiceItemCreateInput,
  client: DbClient,
) {
  const invoice = await client.orm.public.SalesInvoice.where({
    companyId,
    id: itemData.invoiceId,
  }).first();

  if (!invoice) {
    throw new NotFoundError('Sales invoice not found');
  }

  const product = await client.orm.public.Product.where({
    companyId,
    id: itemData.productId,
  }).first();

  if (!product) {
    throw new NotFoundError('Product not found or does not belong to company');
  }

  return client.orm.public.SalesInvoiceItem.create(itemData);
}

export async function getSalesInvoiceItemsByInvoiceId(
  companyId: number,
  invoiceId: number,
) {
  const invoice = await db.orm.public.SalesInvoice.where({
    companyId,
    id: invoiceId,
  }).first();

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
  const invoice = await db.orm.public.SalesInvoice.where({
    companyId,
    id: invoiceId,
  }).first();

  if (!invoice) {
    return null;
  }

  return db.orm.public.SalesInvoiceItem.where({
    invoiceId: invoice.id,
    id: itemId,
  }).first();
}
