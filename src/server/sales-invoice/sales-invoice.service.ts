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

import { getCustomerById } from '../customers/customer.service';
import { getProductById } from '../products/product.service';
import { createSalesInvoiceItemInTransaction } from '../sales-invoice-items/sales-invoice-items.service';
import { createStockMovementInTransaction } from '../stock-movements/stock-movements.service';
import { getWarehouseById } from '../warehouses/warehouse.service';

export type SalesInvoiceItemInput = {
  productId: number;
  quantity: string;
  unitPrice: string;
};

export type SalesInvoiceCreateInput = {
  customerId: number;
  warehouseId: number;
  invoiceNumber: string;
  currency: 'USD' | 'EUR' | 'AZN';
  discount?: string;
  tax?: string;
  issueDate?: Date;
  dueDate?: Date;
  notes?: string;
  items: SalesInvoiceItemInput[];
};

export type SalesInvoiceUpdateInput = {
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

export async function createSalesInvoice(
  companyId: number,
  invoiceData: SalesInvoiceCreateInput,
) {
  const {
    customerId,
    warehouseId,
    items,
    discount = '0',
    tax = '0',
    ...invoiceDataWithoutItems
  } = invoiceData;

  if (items.length === 0) {
    throw new ValidationError('Sales invoice must contain at least one item');
  }

  if (!isNonNegativeDecimal(discount)) {
    throw new ValidationError('Discount cannot be negative');
  }

  if (!isNonNegativeDecimal(tax)) {
    throw new ValidationError('Tax cannot be negative');
  }

  const customer = await getCustomerById(companyId, customerId);

  if (!customer) {
    throw new NotFoundError('Customer not found or does not belong to company');
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
        'Sales invoice item quantity must be greater than zero',
      );
    }

    if (!isNonNegativeDecimal(item.unitPrice)) {
      throw new ValidationError(
        'Sales invoice item unit price cannot be negative',
      );
    }

    if (productIds.has(item.productId)) {
      throw new ValidationError(
        `Product ${item.productId} cannot appear more than once in a sales invoice`,
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

  return db.transaction(async (tx) => {
    const invoice = await tx.orm.public.SalesInvoice.create({
      ...invoiceDataWithoutItems,
      companyId,
      customerId,
      warehouseId,
      status: 'ISSUED',
      subtotal,
      discount,
      tax,
      total,
    });

    for (const item of items) {
      const lineTotal = multiplyDecimal(item.quantity, item.unitPrice);

      await createSalesInvoiceItemInTransaction(
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
          type: 'SALE',
          quantity: item.quantity,
          salesInvoiceId: invoice.id,
        },
        tx,
      );
    }

    return invoice;
  });
}

export async function getSalesInvoicesByCompanyId(companyId: number) {
  return db.orm.public.SalesInvoice.where({
    companyId,
  }).all();
}

export async function getSalesInvoiceById(companyId: number, id: number) {
  return db.orm.public.SalesInvoice.where({
    companyId,
    id,
  }).first();
}

export async function updateSalesInvoice(
  companyId: number,
  id: number,
  invoiceData: SalesInvoiceUpdateInput,
) {
  const invoice = await getSalesInvoiceById(companyId, id);

  if (!invoice) {
    throw new NotFoundError(
      'Sales invoice not found or does not belong to company',
    );
  }

  if (invoice.status === 'CANCELLED') {
    throw new ValidationError('Cancelled sales invoice cannot be modified');
  }

  if (invoice.status === 'PAID') {
    throw new ValidationError('Paid sales invoice cannot be modified');
  }

  if (invoiceData.status === 'CANCELLED') {
    throw new ValidationError(
      'Sales invoice cancellation is not supported yet',
    );
  }

  if (invoiceData.status !== 'PAID') {
    throw new ValidationError('Sales invoice can only be marked as paid');
  }

  return db.orm.public.SalesInvoice.where({
    companyId,
    id,
  }).update({
    status: 'PAID',
  });
}
