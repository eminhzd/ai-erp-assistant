import { registerUser } from '@/server/users/user.service';
import { createCustomer } from '@/server/customers/customer.service';
import { createSupplier } from '@/server/suppliers/supplier.service';
import { createProduct } from '@/server/products/product.service';
import { createWarehouse } from '@/server/warehouses/warehouse.service';
import { createPurchaseInvoice } from '@/server/purchase-invoice/purchase-invoice.service';
import { db } from '@/prisma/db';

export type EvalContext = {
  companyId: number;
  customerId: number;
  supplierId: number;
  productId: number;
  warehouseId: number;
  purchaseInvoiceId: number;
};

const EVAL_EMAIL_PREFIX = 'ai-eval+';
const EVAL_COMPANY_NAME_PREFIX = 'Eval Company ';

function guardAgainstProduction() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run evals against a production environment');
  }

  const dbUrl = process.env.DATABASE_URL ?? '';

  if (/prod/i.test(dbUrl)) {
    throw new Error(
      'Refusing to run evals against a database that looks like production',
    );
  }
}

export async function seedEvalData(): Promise<EvalContext> {
  guardAgainstProduction();

  const runId = Date.now();

  const { company } = await registerUser({
    name: 'Eval Bot',
    email: `${EVAL_EMAIL_PREFIX}${runId}@internal.test`,
    password: 'EvalRunner1234!',
    companyName: `${EVAL_COMPANY_NAME_PREFIX}${runId}`,
  });

  const customer = await createCustomer(company.id, {
    name: 'Eval Test Customer',
  });

  // A second customer makes "missing customer" cases genuinely ambiguous.
  await createCustomer(company.id, {
    name: 'Eval Alternative Customer',
  });

  const supplier = await createSupplier(company.id, {
    name: 'Eval Test Supplier',
  });

  const product = await createProduct(company.id, {
    name: 'Eval Test Product',
    sku: `EVAL-${runId}`,
    purchasePrice: '1.00',
    salePrice: '2.00',
  });

  const warehouse = await createWarehouse(company.id, {
    name: 'Eval Test Warehouse',
  });

  // Seed real stock through the same business logic used by the application.
  const purchaseInvoice = await createPurchaseInvoice(company.id, {
    supplierId: supplier.id,
    warehouseId: warehouse.id,
    items: [
      {
        productId: product.id,
        quantity: '20',
        unitPrice: '1.00',
      },
    ],
  });

  return {
    companyId: company.id,
    customerId: customer.id,
    supplierId: supplier.id,
    productId: product.id,
    warehouseId: warehouse.id,
    purchaseInvoiceId: purchaseInvoice.id,
  };
}

export async function cleanupEvalData(companyId: number) {
  guardAgainstProduction();

  await db.transaction(async (tx) => {
    const deleteMessages = db.raw.sql`
      DELETE FROM "messages"
      WHERE "companyId" = ${companyId}
    `
      .affectedCount()
      .build();

    await tx.execute(deleteMessages);

    const deleteSalesInvoiceItems = db.raw.sql`
      DELETE FROM "salesInvoiceItem"
      WHERE "invoiceId" IN (
        SELECT "id"
        FROM "salesInvoice"
        WHERE "companyId" = ${companyId}
      )
    `
      .affectedCount()
      .build();

    await tx.execute(deleteSalesInvoiceItems);

    const deletePurchaseInvoiceItems = db.raw.sql`
      DELETE FROM "purchaseInvoiceItem"
      WHERE "invoiceId" IN (
        SELECT "id"
        FROM "purchaseInvoice"
        WHERE "companyId" = ${companyId}
      )
    `
      .affectedCount()
      .build();

    await tx.execute(deletePurchaseInvoiceItems);

    const deleteStockMovements = db.raw.sql`
      DELETE FROM "stockMovement"
      WHERE "companyId" = ${companyId}
    `
      .affectedCount()
      .build();

    await tx.execute(deleteStockMovements);

    const deleteWarehouseStock = db.raw.sql`
      DELETE FROM "warehouseStock"
      WHERE "companyId" = ${companyId}
    `
      .affectedCount()
      .build();

    await tx.execute(deleteWarehouseStock);

    const deleteSalesInvoices = db.raw.sql`
      DELETE FROM "salesInvoice"
      WHERE "companyId" = ${companyId}
    `
      .affectedCount()
      .build();

    await tx.execute(deleteSalesInvoices);

    const deletePurchaseInvoices = db.raw.sql`
      DELETE FROM "purchaseInvoice"
      WHERE "companyId" = ${companyId}
    `
      .affectedCount()
      .build();

    await tx.execute(deletePurchaseInvoices);

    const deleteCustomers = db.raw.sql`
      DELETE FROM "customer"
      WHERE "companyId" = ${companyId}
    `
      .affectedCount()
      .build();

    await tx.execute(deleteCustomers);

    const deleteSuppliers = db.raw.sql`
      DELETE FROM "supplier"
      WHERE "companyId" = ${companyId}
    `
      .affectedCount()
      .build();

    await tx.execute(deleteSuppliers);

    const deleteProducts = db.raw.sql`
      DELETE FROM "product"
      WHERE "companyId" = ${companyId}
    `
      .affectedCount()
      .build();

    await tx.execute(deleteProducts);

    const deleteWarehouses = db.raw.sql`
      DELETE FROM "warehouse"
      WHERE "companyId" = ${companyId}
    `
      .affectedCount()
      .build();

    await tx.execute(deleteWarehouses);

    const deleteChats = db.raw.sql`
      DELETE FROM "chats"
      WHERE "companyId" = ${companyId}
    `
      .affectedCount()
      .build();

    await tx.execute(deleteChats);

    const deleteInvoiceSequences = db.raw.sql`
      DELETE FROM "invoiceSequence"
      WHERE "companyId" = ${companyId}
    `
      .affectedCount()
      .build();

    await tx.execute(deleteInvoiceSequences);

    const deleteUsers = db.raw.sql`
      DELETE FROM "users"
      WHERE "companyId" = ${companyId}
    `
      .affectedCount()
      .build();

    await tx.execute(deleteUsers);

    const deleteCompany = db.raw.sql`
      DELETE FROM "company"
      WHERE "id" = ${companyId}
    `
      .affectedCount()
      .build();

    await tx.execute(deleteCompany);
  });
}

export async function cleanupStaleEvalData(olderThanHours = 1) {
  guardAgainstProduction();

  const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

  const allCompanies = await db.orm.public.Company.all();

  const staleCompanies = allCompanies.filter(
    (company) =>
      company.name.startsWith(EVAL_COMPANY_NAME_PREFIX) &&
      company.createdAt < cutoff,
  );

  for (const company of staleCompanies) {
    await cleanupEvalData(company.id);
  }
}
