import { db } from '@/prisma/db';

import {
  addDecimal,
  compareDecimal,
  isNonNegativeDecimal,
  isPositiveDecimal,
  multiplyDecimal,
  subtractDecimal,
} from '@/lib/decimal';

import { NotFoundError, ValidationError } from '@/lib/errors';

import { getProductById } from '../products/product.service';
import { createPurchaseInvoiceItemInTransaction } from '../purchase-invoice-items/purchase-invoice-items.service';
import { createStockMovementInTransaction } from '../stock-movements/stock-movements.service';
import { getSupplierById } from '../suppliers/supplier.service';
import { getWarehouseById } from '../warehouses/warehouse.service';

export type PurchaseInvoiceItemInput = {
  productId: number;
  quantity: string;
  unitPrice: string;
};

export type PurchaseInvoiceCreateInput = {
  supplierId: number;
  warehouseId: number;
  discount?: string;
  tax?: string;
  issueDate?: Date;
  dueDate?: Date;
  notes?: string;
  items: PurchaseInvoiceItemInput[];
};

export type PurchaseInvoiceUpdateInput = {
  status?: 'PAID' | 'CANCELLED';
};

function calculateSubtotal(
  items: Array<{
    quantity: string;
    unitPrice: string;
  }>,
): string {
  let subtotal = '0';

  for (const item of items) {
    const lineTotal = multiplyDecimal(item.quantity, item.unitPrice);
    subtotal = addDecimal(subtotal, lineTotal);
  }

  return subtotal;
}

async function generatePurchaseInvoiceNumber(
  companyId: number,
): Promise<string> {
  const invoices = await db.orm.public.PurchaseInvoice.where({
    companyId,
  }).all();

  let maxNumber = 0;

  for (const invoice of invoices) {
    const match = invoice.invoiceNumber.match(/^PURCH-INV-(\d+)$/);

    if (!match) continue;

    const number = Number(match[1]);

    if (number > maxNumber) {
      maxNumber = number;
    }
  }

  const nextNumber = maxNumber + 1;

  return `PURCH-INV-${String(nextNumber).padStart(3, '0')}`;
}

export async function createPurchaseInvoice(
  companyId: number,
  invoiceData: PurchaseInvoiceCreateInput,
) {
  const {
    supplierId,
    warehouseId,
    items,
    discount = '0',
    tax = '0',
    ...invoiceDataWithoutItems
  } = invoiceData;

  if (items.length === 0) {
    throw new ValidationError(
      'Purchase invoice must contain at least one item',
    );
  }

  if (!isNonNegativeDecimal(discount)) {
    throw new ValidationError('Discount cannot be negative');
  }

  if (!isNonNegativeDecimal(tax)) {
    throw new ValidationError('Tax cannot be negative');
  }

  const company = await db.orm.public.Company.where({ id: companyId }).first();

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  const supplier = await getSupplierById(companyId, supplierId);

  if (!supplier) {
    throw new NotFoundError('Supplier not found or does not belong to company');
  }

  const warehouse = await getWarehouseById(companyId, warehouseId);

  if (!warehouse) {
    throw new NotFoundError(
      'Warehouse not found or does not belong to company',
    );
  }

  const productIds = new Set<number>();

  for (const item of items) {
    if (!isPositiveDecimal(item.quantity)) {
      throw new ValidationError(
        'Purchase invoice item quantity must be greater than zero',
      );
    }

    if (!isNonNegativeDecimal(item.unitPrice)) {
      throw new ValidationError(
        'Purchase invoice item unit price cannot be negative',
      );
    }

    if (productIds.has(item.productId)) {
      throw new ValidationError(
        `Product ${item.productId} cannot appear more than once in a purchase invoice`,
      );
    }

    productIds.add(item.productId);

    const product = await getProductById(companyId, item.productId);

    if (!product) {
      throw new NotFoundError(
        `Product ${item.productId} not found or does not belong to company`,
      );
    }
  }

  const subtotal = calculateSubtotal(items);

  if (compareDecimal(discount, subtotal) > 0) {
    throw new ValidationError('Discount cannot be greater than subtotal');
  }

  const subtotalAfterDiscount = subtractDecimal(subtotal, discount);

  const total = addDecimal(subtotalAfterDiscount, tax);
  const invoiceNumber = await generatePurchaseInvoiceNumber(companyId);

  return db.transaction(async (tx) => {
    const invoice = await tx.orm.public.PurchaseInvoice.create({
      ...invoiceDataWithoutItems,
      companyId,
      supplierId,
      warehouseId,
      invoiceNumber,
      currency: company.currency,
      status: 'ISSUED',
      subtotal,
      discount,
      tax,
      total,
    });

    for (const item of items) {
      const lineTotal = multiplyDecimal(item.quantity, item.unitPrice);

      await createPurchaseInvoiceItemInTransaction(
        companyId,
        {
          invoiceId: invoice.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal,
        },
        tx,
      );

      await createStockMovementInTransaction(
        companyId,
        {
          warehouseId,
          productId: item.productId,
          type: 'PURCHASE',
          quantity: item.quantity,
          purchaseInvoiceId: invoice.id,
        },
        tx,
      );
    }

    return invoice;
  });
}

export async function getPurchaseInvoicesByCompanyId(companyId: number) {
  return db.orm.public.PurchaseInvoice.where({
    companyId,
  }).all();
}

export async function getPurchaseInvoiceById(companyId: number, id: number) {
  return db.orm.public.PurchaseInvoice.where({
    companyId,
    id,
  }).first();
}

export async function updatePurchaseInvoice(
  companyId: number,
  id: number,
  invoiceData: PurchaseInvoiceUpdateInput,
) {
  const invoice = await getPurchaseInvoiceById(companyId, id);

  if (!invoice) {
    return null;
  }

  if (invoice.status === 'CANCELLED') {
    throw new ValidationError('Cancelled purchase invoice cannot be modified');
  }

  if (invoice.status === 'PAID') {
    throw new ValidationError('Paid purchase invoice cannot be modified');
  }

  if (invoiceData.status === 'CANCELLED') {
    throw new ValidationError(
      'Purchase invoice cancellation is not supported yet',
    );
  }

  if (invoiceData.status !== 'PAID') {
    throw new ValidationError('Purchase invoice can only be marked as paid');
  }

  return db.orm.public.PurchaseInvoice.where({
    companyId,
    id,
  }).update({
    status: 'PAID',
  });
}
