import { db } from '@/prisma/db';

import {
  createCustomer,
  deleteCustomer,
  findCustomers,
  getCustomerById,
  getCustomersByCompanyId,
  updateCustomer,
} from '@/server/customers/customer.service';

import {
  createSupplier,
  deleteSupplier,
  findSuppliers,
  getSupplierById,
  getSuppliersByCompanyId,
  updateSupplier,
} from '@/server/suppliers/supplier.service';

import {
  createProduct,
  deleteProduct,
  findProducts,
  getProductById,
  getProductsByCompanyId,
  updateProduct,
} from '@/server/products/product.service';

import {
  createWarehouse,
  deleteWarehouse,
  findWarehouses,
  getWarehouseById,
  getWarehousesByCompanyId,
  updateWarehouse,
} from '@/server/warehouses/warehouse.service';

import {
  createWarehouseStock,
  decreaseWarehouseStock,
  getWarehouseStock,
  getWarehouseStocksByCompanyId,
  getWarehouseStocksByWarehouseId,
  increaseWarehouseStock,
} from '@/server/warehouse-stock/warehouse-stock.service';

import {
  createStockMovement,
  getStockMovementById,
  getStockMovementsByProduct,
  getStockMovementsByType,
  getStockMovementsByWarehouse,
} from '@/server/stock-movements/stock-movements.service';

import {
  createPurchaseInvoice,
  getPurchaseInvoiceById,
  getPurchaseInvoicesByCompanyId,
  updatePurchaseInvoice,
} from '@/server/purchase-invoice/purchase-invoice.service';

import {
  getPurchaseInvoiceItemById,
  getPurchaseInvoiceItemsByInvoiceId,
} from '@/server/purchase-invoice-items/purchase-invoice-items.service';

import {
  createSalesInvoice,
  getSalesInvoiceById,
  getSalesInvoicesByCompanyId,
  updateSalesInvoice,
} from '@/server/sales-invoice/sales-invoice.service';

import {
  getSalesInvoiceItemById,
  getSalesInvoiceItemsByInvoiceId,
} from '@/server/sales-invoice-items/sales-invoice-items.service';

let passed = 0;
let failed = 0;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function test(name: string, callback: () => Promise<void>) {
  try {
    await callback();

    passed++;
    console.log(`  ✅ ${name}`);
  } catch (error) {
    failed++;

    console.error(`  ❌ ${name}`);

    if (error instanceof Error) {
      console.error(`     ${error.message}`);
    } else {
      console.error('    ', error);
    }
  }
}

async function expectError(operation: () => Promise<unknown>, message: string) {
  let failedAsExpected = false;

  try {
    await operation();
  } catch {
    failedAsExpected = true;
  }

  if (!failedAsExpected) {
    throw new Error(`Expected operation to fail: ${message}`);
  }
}

async function expectNoResult(
  operation: () => Promise<unknown>,
  message: string,
) {
  const result = await operation();

  assert(
    result === null,
    `${message}. Expected null, received: ${JSON.stringify(result)}`,
  );
}

async function createTestCompany(name: string) {
  const company = await db.transaction(async (tx) => {
    const company = await tx.orm.public.Company.create({
      name,
    });

    await tx.orm.public.InvoiceSequence.createAll([
      {
        companyId: company.id,
        type: 'SALES',
      },
      {
        companyId: company.id,
        type: 'PURCHASE',
      },
    ]);

    return company;
  });

  return company;
}

function section(title: string) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(title);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

async function main() {
  const suffix = Date.now();

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                  SERVICE TESTS STARTED                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // --------------------------------------------------------------------------
  // Companies
  // --------------------------------------------------------------------------

  section('COMPANIES');

  const company = await createTestCompany(`Test Company ${suffix}`);
  const secondCompany = await createTestCompany(
    `Second Test Company ${suffix}`,
  );

  await test('create test companies', async () => {
    assert(company.id, 'Company A should be created');
    assert(secondCompany.id, 'Company B should be created');
    assert(
      company.id !== secondCompany.id,
      'Test companies should have different ids',
    );
  });

  // --------------------------------------------------------------------------
  // Base fixtures
  // --------------------------------------------------------------------------

  section('BASE FIXTURES');

  const warehouse = await createWarehouse(company.id, {
    name: `Main Warehouse ${suffix}`,
    address: 'Baku',
  });

  const secondWarehouse = await createWarehouse(company.id, {
    name: `Second Warehouse ${suffix}`,
    address: 'Ganja',
  });

  const deletedWarehouse = await createWarehouse(company.id, {
    name: `Deleted Warehouse ${suffix}`,
    address: 'Sumqayit',
  });

  const secondCompanyWarehouse = await createWarehouse(secondCompany.id, {
    name: `Foreign Warehouse ${suffix}`,
    address: 'Baku',
  });

  const product = await createProduct(company.id, {
    name: `Product ${suffix}`,
    sku: `SKU-${suffix}`,
    unit: 'pcs',
    purchasePrice: '100',
    salePrice: '150',
  });

  // Must remain active for transaction rollback tests.
  const secondProduct = await createProduct(company.id, {
    name: `Second Product ${suffix}`,
    sku: `SKU-SECOND-${suffix}`,
    unit: 'pcs',
    purchasePrice: '50',
    salePrice: '80',
  });

  const deletedProduct = await createProduct(company.id, {
    name: `Deleted Product ${suffix}`,
    sku: `SKU-DELETED-${suffix}`,
    unit: 'pcs',
    purchasePrice: '25',
    salePrice: '40',
  });

  const secondCompanyProduct = await createProduct(secondCompany.id, {
    name: `Foreign Product ${suffix}`,
    sku: `SKU-FOREIGN-${suffix}`,
    unit: 'pcs',
    purchasePrice: '100',
    salePrice: '150',
  });

  const supplier = await createSupplier(company.id, {
    name: `Supplier ${suffix}`,
    email: `supplier-${suffix}@example.com`,
    phone: '+994501111111',
    address: 'Baku',
    taxId: `SUP-${suffix}`,
  });

  const foreignSupplier = await createSupplier(secondCompany.id, {
    name: `Foreign Supplier ${suffix}`,
    email: `foreign-supplier-${suffix}@example.com`,
    phone: '+994502222222',
    address: 'Baku',
    taxId: `FOREIGN-SUP-${suffix}`,
  });

  const customer = await createCustomer(company.id, {
    name: `Customer ${suffix}`,
    email: `customer-${suffix}@example.com`,
    phone: '+994503333333',
    address: 'Baku',
    taxId: `CUS-${suffix}`,
  });

  const foreignCustomer = await createCustomer(secondCompany.id, {
    name: `Foreign Customer ${suffix}`,
    email: `foreign-customer-${suffix}@example.com`,
    phone: '+994504444444',
    address: 'Baku',
    taxId: `FOREIGN-CUS-${suffix}`,
  });

  await test('create base fixtures', async () => {
    assert(warehouse.id, 'Main warehouse should be created');
    assert(secondWarehouse.id, 'Second warehouse should be created');
    assert(deletedWarehouse.id, 'Deletion warehouse should be created');
    assert(secondCompanyWarehouse.id, 'Foreign warehouse should be created');
    assert(product.id, 'Product should be created');
    assert(secondProduct.id, 'Second product should be created');
    assert(deletedProduct.id, 'Deletion product should be created');
    assert(secondCompanyProduct.id, 'Foreign product should be created');
    assert(supplier.id, 'Supplier should be created');
    assert(foreignSupplier.id, 'Foreign supplier should be created');
    assert(customer.id, 'Customer should be created');
    assert(foreignCustomer.id, 'Foreign customer should be created');
  });

  // --------------------------------------------------------------------------
  // Customer service
  // --------------------------------------------------------------------------

  section('CUSTOMER SERVICE');

  await test('getCustomersByCompanyId', async () => {
    const customers = await getCustomersByCompanyId(company.id);

    assert(
      customers.some((item) => item.id === customer.id),
      'Customer should exist in company list',
    );
  });

  await test('getCustomerById', async () => {
    const customerById = await getCustomerById(company.id, customer.id);

    assert(customerById?.id === customer.id, 'Customer should be found by id');
  });

  await test('findCustomers', async () => {
    const foundCustomers = await findCustomers(company.id, customer.name);

    assert(
      foundCustomers.some((item) => item.id === customer.id),
      'Customer search should find customer by name',
    );
  });

  await test('updateCustomer', async () => {
    await updateCustomer(company.id, customer.id, {
      phone: '+994505555555',
      address: 'Updated address',
    });

    const updatedCustomer = await getCustomerById(company.id, customer.id);

    assert(
      updatedCustomer?.phone === '+994505555555',
      'Customer phone should be updated',
    );

    assert(
      updatedCustomer?.address === 'Updated address',
      'Customer address should be updated',
    );
  });

  await test('deleteCustomer', async () => {
    await deleteCustomer(company.id, customer.id);

    const deletedCustomer = await getCustomerById(company.id, customer.id);

    assert(
      deletedCustomer === null,
      'Deleted customer should not be returned by getCustomerById',
    );

    const deletedCustomerSearch = await findCustomers(
      company.id,
      customer.name,
    );

    assert(
      !deletedCustomerSearch.some((item) => item.id === customer.id),
      'Deleted customer should not be returned by findCustomers',
    );
  });

  await test('duplicate customer name is rejected', async () => {
    await expectError(
      () =>
        createCustomer(company.id, {
          name: customer.name,
        }),
      'Duplicate customer name should be rejected',
    );
  });

  const activeCustomer = await createCustomer(company.id, {
    name: `Active Customer ${suffix}`,
    email: `active-customer-${suffix}@example.com`,
    phone: '+994506666666',
    address: 'Baku',
    taxId: `ACTIVE-CUS-${suffix}`,
  });

  await test('create active customer', async () => {
    assert(activeCustomer.id, 'Active customer should be created');
  });

  // --------------------------------------------------------------------------
  // Supplier service
  // --------------------------------------------------------------------------

  section('SUPPLIER SERVICE');

  await test('getSuppliersByCompanyId', async () => {
    const suppliers = await getSuppliersByCompanyId(company.id);

    assert(
      suppliers.some((item) => item.id === supplier.id),
      'Supplier should exist in company list',
    );
  });

  await test('getSupplierById', async () => {
    const supplierById = await getSupplierById(company.id, supplier.id);

    assert(supplierById?.id === supplier.id, 'Supplier should be found by id');
  });

  await test('findSuppliers', async () => {
    const foundSuppliers = await findSuppliers(company.id, supplier.name);

    assert(
      foundSuppliers.some((item) => item.id === supplier.id),
      'Supplier search should find supplier',
    );
  });

  await test('updateSupplier', async () => {
    await updateSupplier(company.id, supplier.id, {
      phone: '+994507777777',
      address: 'Updated supplier address',
    });

    const updatedSupplier = await getSupplierById(company.id, supplier.id);

    assert(
      updatedSupplier?.phone === '+994507777777',
      'Supplier phone should be updated',
    );

    assert(
      updatedSupplier?.address === 'Updated supplier address',
      'Supplier address should be updated',
    );
  });

  const temporarySupplier = await createSupplier(company.id, {
    name: `Temporary Supplier ${suffix}`,
    email: `temporary-${suffix}@example.com`,
  });

  await test('deleteSupplier', async () => {
    await deleteSupplier(company.id, temporarySupplier.id);

    const deletedSupplier = await getSupplierById(
      company.id,
      temporarySupplier.id,
    );

    assert(
      deletedSupplier === null,
      'Deleted supplier should not be returned by getSupplierById',
    );
  });

  await test('duplicate supplier name is rejected', async () => {
    await expectError(
      () =>
        createSupplier(company.id, {
          name: supplier.name,
        }),
      'Duplicate supplier name should be rejected',
    );
  });

  // --------------------------------------------------------------------------
  // Product service
  // --------------------------------------------------------------------------

  section('PRODUCT SERVICE');

  await test('getProductsByCompanyId', async () => {
    const products = await getProductsByCompanyId(company.id);

    assert(
      products.some((item) => item.id === product.id),
      'Product should exist in company list',
    );
  });

  await test('getProductById', async () => {
    const productById = await getProductById(company.id, product.id);

    assert(productById?.id === product.id, 'Product should be found by id');
  });

  await test('findProducts by name', async () => {
    const productsByName = await findProducts(company.id, product.name);

    assert(
      productsByName.some((item) => item.id === product.id),
      'Product search should find by name',
    );
  });

  await test('findProducts by SKU', async () => {
    const productsBySku = await findProducts(company.id, product.sku);

    assert(
      productsBySku.some((item) => item.id === product.id),
      'Product search should find by SKU',
    );
  });

  await test('updateProduct', async () => {
    await updateProduct(company.id, product.id, {
      salePrice: '175',
    });

    const updatedProduct = await getProductById(company.id, product.id);

    assert(
      updatedProduct?.salePrice === '175',
      'Product sale price should be updated',
    );
  });

  await test('deleteProduct', async () => {
    await deleteProduct(company.id, deletedProduct.id);

    const deletedProductById = await getProductById(
      company.id,
      deletedProduct.id,
    );

    assert(
      deletedProductById === null,
      'Deleted product should not be returned by getProductById',
    );

    const productsAfterDelete = await getProductsByCompanyId(company.id);

    assert(
      !productsAfterDelete.some((item) => item.id === deletedProduct.id),
      'Deleted product should not exist in active product list',
    );
  });

  await test('duplicate product SKU is rejected', async () => {
    await expectError(
      () =>
        createProduct(company.id, {
          name: `Duplicate SKU Product ${suffix}`,
          sku: product.sku,
          unit: 'pcs',
          purchasePrice: '50',
          salePrice: '75',
        }),
      'Duplicate product SKU should be rejected',
    );
  });

  // --------------------------------------------------------------------------
  // Warehouse service
  // --------------------------------------------------------------------------

  section('WAREHOUSE SERVICE');

  await test('getWarehousesByCompanyId', async () => {
    const warehouses = await getWarehousesByCompanyId(company.id);

    assert(
      warehouses.some((item) => item.id === warehouse.id),
      'Warehouse should exist in company list',
    );
  });

  await test('getWarehouseById', async () => {
    const warehouseById = await getWarehouseById(company.id, warehouse.id);

    assert(
      warehouseById?.id === warehouse.id,
      'Warehouse should be found by id',
    );
  });

  await test('findWarehouses', async () => {
    const foundWarehouses = await findWarehouses(company.id, warehouse.name);

    assert(
      foundWarehouses.some((item) => item.id === warehouse.id),
      'Warehouse search should find warehouse',
    );
  });

  await test('updateWarehouse', async () => {
    await updateWarehouse(company.id, warehouse.id, {
      address: 'Updated warehouse address',
    });

    const updatedWarehouse = await getWarehouseById(company.id, warehouse.id);

    assert(
      updatedWarehouse?.address === 'Updated warehouse address',
      'Warehouse address should be updated',
    );
  });

  await test('deleteWarehouse', async () => {
    await deleteWarehouse(company.id, deletedWarehouse.id);

    const deletedWarehouseById = await getWarehouseById(
      company.id,
      deletedWarehouse.id,
    );

    assert(
      deletedWarehouseById === null,
      'Deleted warehouse should not be returned by getWarehouseById',
    );
  });

  await test('duplicate warehouse name is rejected', async () => {
    await expectError(
      () =>
        createWarehouse(company.id, {
          name: warehouse.name,
          address: 'Duplicate',
        }),
      'Duplicate warehouse name should be rejected',
    );
  });

  // --------------------------------------------------------------------------
  // Warehouse stock
  // --------------------------------------------------------------------------

  section('WAREHOUSE STOCK');

  await test('createWarehouseStock', async () => {
    const initialStock = await createWarehouseStock(company.id, warehouse.id, {
      productId: product.id,
      quantity: '10',
    });

    assert(
      initialStock.quantity === '10',
      'Initial warehouse stock should be 10',
    );
  });

  await test('duplicate warehouse stock is rejected', async () => {
    await expectError(
      () =>
        createWarehouseStock(company.id, warehouse.id, {
          productId: product.id,
          quantity: '5',
        }),
      'Duplicate warehouse stock should be rejected',
    );
  });

  await test('getWarehouseStock', async () => {
    const stock = await getWarehouseStock(company.id, warehouse.id, product.id);

    assert(stock?.quantity === '10', 'Warehouse stock should be 10');
  });

  await test('getWarehouseStocksByWarehouseId', async () => {
    const warehouseStocks = await getWarehouseStocksByWarehouseId(
      company.id,
      warehouse.id,
    );

    assert(
      warehouseStocks.some((item) => item.productId === product.id),
      'Warehouse stock should be returned by warehouse',
    );
  });

  await test('getWarehouseStocksByCompanyId', async () => {
    const companyStocks = await getWarehouseStocksByCompanyId(company.id);

    assert(
      companyStocks.some((item) => item.productId === product.id),
      'Warehouse stock should be returned by company',
    );
  });

  await test('increaseWarehouseStock', async () => {
    const increasedStock = await increaseWarehouseStock(company.id, {
      warehouseId: warehouse.id,
      productId: product.id,
      quantity: '5',
    });

    assert(
      increasedStock?.quantity === '15',
      `Stock should be 15 after increase, got ${increasedStock?.quantity}`,
    );
  });

  await test('decreaseWarehouseStock', async () => {
    const decreasedStock = await decreaseWarehouseStock(company.id, {
      warehouseId: warehouse.id,
      productId: product.id,
      quantity: '3',
    });

    assert(
      decreasedStock?.quantity === '12',
      `Stock should be 12 after decrease, got ${decreasedStock?.quantity}`,
    );
  });

  await test('insufficient stock is rejected', async () => {
    await expectError(
      () =>
        decreaseWarehouseStock(company.id, {
          warehouseId: warehouse.id,
          productId: product.id,
          quantity: '1000',
        }),
      'Insufficient stock should be rejected',
    );
  });

  await test('zero stock increase is rejected', async () => {
    await expectError(
      () =>
        increaseWarehouseStock(company.id, {
          warehouseId: warehouse.id,
          productId: product.id,
          quantity: '0',
        }),
      'Zero stock increase should be rejected',
    );
  });

  await test('negative stock decrease is rejected', async () => {
    await expectError(
      () =>
        decreaseWarehouseStock(company.id, {
          warehouseId: warehouse.id,
          productId: product.id,
          quantity: '-1',
        }),
      'Negative stock decrease should be rejected',
    );
  });

  await test('increase stock creates missing warehouse stock', async () => {
    const secondWarehouseStock = await increaseWarehouseStock(company.id, {
      warehouseId: secondWarehouse.id,
      productId: product.id,
      quantity: '7',
    });

    assert(
      secondWarehouseStock?.quantity === '7',
      'Missing warehouse stock should be created by increase',
    );
  });

  // --------------------------------------------------------------------------
  // Purchase invoice validation
  // --------------------------------------------------------------------------

  section('PURCHASE INVOICE VALIDATION');

  const purchaseBase = {
    supplierId: supplier.id,
    warehouseId: warehouse.id,
    items: [
      {
        productId: product.id,
        quantity: '1',
        unitPrice: '100',
      },
    ],
  };

  await test('empty items are rejected', async () => {
    await expectError(
      () =>
        createPurchaseInvoice(company.id, {
          ...purchaseBase,
          items: [],
        }),
      'Purchase invoice should reject empty items',
    );
  });

  await test('negative discount is rejected', async () => {
    await expectError(
      () =>
        createPurchaseInvoice(company.id, {
          ...purchaseBase,
          discount: '-1',
        }),
      'Purchase invoice should reject negative discount',
    );
  });

  await test('negative tax is rejected', async () => {
    await expectError(
      () =>
        createPurchaseInvoice(company.id, {
          ...purchaseBase,
          tax: '-1',
        }),
      'Purchase invoice should reject negative tax',
    );
  });

  await test('zero quantity is rejected', async () => {
    await expectError(
      () =>
        createPurchaseInvoice(company.id, {
          ...purchaseBase,
          items: [
            {
              productId: product.id,
              quantity: '0',
              unitPrice: '100',
            },
          ],
        }),
      'Purchase invoice should reject zero quantity',
    );
  });

  await test('negative quantity is rejected', async () => {
    await expectError(
      () =>
        createPurchaseInvoice(company.id, {
          ...purchaseBase,
          items: [
            {
              productId: product.id,
              quantity: '-1',
              unitPrice: '100',
            },
          ],
        }),
      'Purchase invoice should reject negative quantity',
    );
  });

  await test('negative price is rejected', async () => {
    await expectError(
      () =>
        createPurchaseInvoice(company.id, {
          ...purchaseBase,
          items: [
            {
              productId: product.id,
              quantity: '1',
              unitPrice: '-100',
            },
          ],
        }),
      'Purchase invoice should reject negative price',
    );
  });

  await test('duplicate products are rejected', async () => {
    await expectError(
      () =>
        createPurchaseInvoice(company.id, {
          ...purchaseBase,
          items: [
            {
              productId: product.id,
              quantity: '1',
              unitPrice: '100',
            },
            {
              productId: product.id,
              quantity: '2',
              unitPrice: '100',
            },
          ],
        }),
      'Purchase invoice should reject duplicate products',
    );
  });

  await test('discount greater than subtotal is rejected', async () => {
    await expectError(
      () =>
        createPurchaseInvoice(company.id, {
          ...purchaseBase,
          discount: '101',
        }),
      'Purchase invoice should reject discount greater than subtotal',
    );
  });

  // --------------------------------------------------------------------------
  // Purchase invoice
  // --------------------------------------------------------------------------

  section('PURCHASE INVOICE');

  const purchaseInvoice = await createPurchaseInvoice(company.id, {
    supplierId: supplier.id,
    warehouseId: warehouse.id,
    discount: '50',
    tax: '20',
    items: [
      {
        productId: product.id,
        quantity: '20',
        unitPrice: '100',
      },
    ],
  });

  await test('createPurchaseInvoice', async () => {
    assert(
      purchaseInvoice.invoiceNumber === 'PURCH-INV-001',
      `Unexpected purchase invoice number: ${purchaseInvoice.invoiceNumber}`,
    );

    assert(
      purchaseInvoice.currency === 'AZN',
      `Unexpected purchase invoice currency: ${purchaseInvoice.currency}`,
    );

    assert(
      purchaseInvoice.status === 'ISSUED',
      'Purchase invoice should initially be ISSUED',
    );

    assert(
      purchaseInvoice.subtotal === '2000',
      `Unexpected purchase subtotal: ${purchaseInvoice.subtotal}`,
    );

    assert(
      purchaseInvoice.total === '1970',
      `Unexpected purchase total: ${purchaseInvoice.total}`,
    );
  });

  await test('getPurchaseInvoiceById', async () => {
    const purchaseById = await getPurchaseInvoiceById(
      company.id,
      purchaseInvoice.id,
    );

    assert(
      purchaseById?.id === purchaseInvoice.id,
      'Purchase invoice should be found by id',
    );
  });

  await test('getPurchaseInvoicesByCompanyId', async () => {
    const purchaseInvoices = await getPurchaseInvoicesByCompanyId(company.id);

    assert(
      purchaseInvoices.some((item) => item.id === purchaseInvoice.id),
      'Purchase invoice should exist in company list',
    );
  });

  let purchaseItem: Awaited<
    ReturnType<typeof getPurchaseInvoiceItemsByInvoiceId>
  >[number];

  await test('getPurchaseInvoiceItemsByInvoiceId', async () => {
    const purchaseItems = await getPurchaseInvoiceItemsByInvoiceId(
      company.id,
      purchaseInvoice.id,
    );

    assert(
      purchaseItems.length === 1,
      'Purchase invoice should contain one item',
    );

    purchaseItem = purchaseItems[0];

    assert(
      purchaseItem.productId === product.id,
      'Purchase item should reference correct product',
    );
  });

  await test('getPurchaseInvoiceItemById', async () => {
    const purchaseItemById = await getPurchaseInvoiceItemById(
      company.id,
      purchaseInvoice.id,
      purchaseItem.id,
    );

    assert(
      purchaseItemById?.id === purchaseItem.id,
      'Purchase invoice item should be found by id',
    );
  });

  await test('purchase invoice increases stock', async () => {
    const currentStock = await getWarehouseStock(
      company.id,
      warehouse.id,
      product.id,
    );

    assert(
      currentStock?.quantity === '32',
      `Expected stock 32 after purchase, got ${currentStock?.quantity}`,
    );
  });

  // --------------------------------------------------------------------------
  // Purchase stock movement
  // --------------------------------------------------------------------------

  section('PURCHASE STOCK MOVEMENT');

  let purchaseMovement: Awaited<
    ReturnType<typeof getStockMovementsByProduct>
  >[number];

  await test('purchase stock movement is created', async () => {
    const purchaseMovements = await getStockMovementsByProduct(
      company.id,
      product.id,
    );

    purchaseMovement = purchaseMovements.find(
      (movement) =>
        movement.type === 'PURCHASE' &&
        movement.purchaseInvoiceId === purchaseInvoice.id,
    )!;

    assert(purchaseMovement, 'Purchase stock movement should be created');
  });

  await test('getStockMovementById for purchase', async () => {
    const purchaseMovementById = await getStockMovementById(
      company.id,
      purchaseMovement.id,
    );

    assert(
      purchaseMovementById?.id === purchaseMovement.id,
      'Purchase stock movement should be found by id',
    );
  });

  await test('duplicate purchase stock movement is rejected', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: warehouse.id,
          productId: product.id,
          type: 'PURCHASE',
          quantity: '20',
          purchaseInvoiceId: purchaseInvoice.id,
        }),
      'Duplicate purchase stock movement should be rejected',
    );
  });

  // --------------------------------------------------------------------------
  // Purchase invoice status
  // --------------------------------------------------------------------------

  section('PURCHASE INVOICE STATUS');

  await test('purchase invoice can become PAID', async () => {
    const paidPurchase = await updatePurchaseInvoice(
      company.id,
      purchaseInvoice.id,
      {
        status: 'PAID',
      },
    );

    assert(
      paidPurchase?.status === 'PAID',
      'Purchase invoice should become PAID',
    );
  });

  await test('paid purchase invoice cannot be cancelled', async () => {
    await expectError(
      () =>
        updatePurchaseInvoice(company.id, purchaseInvoice.id, {
          status: 'CANCELLED',
        }),
      'Paid purchase invoice should not be changed',
    );
  });

  // --------------------------------------------------------------------------
  // Sales invoice validation
  // --------------------------------------------------------------------------

  section('SALES INVOICE VALIDATION');

  const salesBase = {
    customerId: activeCustomer.id,
    warehouseId: warehouse.id,
    items: [
      {
        productId: product.id,
        quantity: '1',
        unitPrice: '150',
      },
    ],
  };

  await test('empty items are rejected', async () => {
    await expectError(
      () =>
        createSalesInvoice(company.id, {
          ...salesBase,
          items: [],
        }),
      'Sales invoice should reject empty items',
    );
  });

  await test('negative discount is rejected', async () => {
    await expectError(
      () =>
        createSalesInvoice(company.id, {
          ...salesBase,
          discount: '-1',
        }),
      'Sales invoice should reject negative discount',
    );
  });

  await test('negative tax is rejected', async () => {
    await expectError(
      () =>
        createSalesInvoice(company.id, {
          ...salesBase,
          tax: '-1',
        }),
      'Sales invoice should reject negative tax',
    );
  });

  await test('zero quantity is rejected', async () => {
    await expectError(
      () =>
        createSalesInvoice(company.id, {
          ...salesBase,
          items: [
            {
              productId: product.id,
              quantity: '0',
              unitPrice: '150',
            },
          ],
        }),
      'Sales invoice should reject zero quantity',
    );
  });

  await test('negative quantity is rejected', async () => {
    await expectError(
      () =>
        createSalesInvoice(company.id, {
          ...salesBase,
          items: [
            {
              productId: product.id,
              quantity: '-1',
              unitPrice: '150',
            },
          ],
        }),
      'Sales invoice should reject negative quantity',
    );
  });

  await test('negative price is rejected', async () => {
    await expectError(
      () =>
        createSalesInvoice(company.id, {
          ...salesBase,
          items: [
            {
              productId: product.id,
              quantity: '1',
              unitPrice: '-150',
            },
          ],
        }),
      'Sales invoice should reject negative price',
    );
  });

  await test('duplicate products are rejected', async () => {
    await expectError(
      () =>
        createSalesInvoice(company.id, {
          ...salesBase,
          items: [
            {
              productId: product.id,
              quantity: '1',
              unitPrice: '150',
            },
            {
              productId: product.id,
              quantity: '2',
              unitPrice: '150',
            },
          ],
        }),
      'Sales invoice should reject duplicate products',
    );
  });

  await test('discount greater than subtotal is rejected', async () => {
    await expectError(
      () =>
        createSalesInvoice(company.id, {
          ...salesBase,
          discount: '151',
        }),
      'Sales invoice should reject discount greater than subtotal',
    );
  });

  await test('insufficient stock is rejected', async () => {
    await expectError(
      () =>
        createSalesInvoice(company.id, {
          ...salesBase,
          items: [
            {
              productId: product.id,
              quantity: '999999',
              unitPrice: '150',
            },
          ],
        }),
      'Sales invoice should reject insufficient stock',
    );
  });

  // --------------------------------------------------------------------------
  // Sales invoice
  // --------------------------------------------------------------------------

  section('SALES INVOICE');

  const salesInvoice = await createSalesInvoice(company.id, {
    customerId: activeCustomer.id,
    warehouseId: warehouse.id,
    discount: '50',
    tax: '20',
    items: [
      {
        productId: product.id,
        quantity: '10',
        unitPrice: '150',
      },
    ],
  });

  await test('createSalesInvoice', async () => {
    assert(
      salesInvoice.invoiceNumber === 'SALES-INV-001',
      `Unexpected sales invoice number: ${salesInvoice.invoiceNumber}`,
    );

    assert(
      salesInvoice.currency === 'AZN',
      `Unexpected sales invoice currency: ${salesInvoice.currency}`,
    );

    assert(
      salesInvoice.status === 'ISSUED',
      'Sales invoice should initially be ISSUED',
    );

    assert(
      salesInvoice.subtotal === '1500',
      `Unexpected sales subtotal: ${salesInvoice.subtotal}`,
    );

    assert(
      salesInvoice.total === '1470',
      `Unexpected sales total: ${salesInvoice.total}`,
    );
  });

  await test('getSalesInvoiceById', async () => {
    const salesById = await getSalesInvoiceById(company.id, salesInvoice.id);

    assert(
      salesById?.id === salesInvoice.id,
      'Sales invoice should be found by id',
    );
  });

  await test('getSalesInvoicesByCompanyId', async () => {
    const salesInvoices = await getSalesInvoicesByCompanyId(company.id);

    assert(
      salesInvoices.some((item) => item.id === salesInvoice.id),
      'Sales invoice should exist in company list',
    );
  });

  let salesItem: Awaited<
    ReturnType<typeof getSalesInvoiceItemsByInvoiceId>
  >[number];

  await test('getSalesInvoiceItemsByInvoiceId', async () => {
    const salesItems = await getSalesInvoiceItemsByInvoiceId(
      company.id,
      salesInvoice.id,
    );

    assert(salesItems.length === 1, 'Sales invoice should contain one item');

    salesItem = salesItems[0];

    assert(
      salesItem.productId === product.id,
      'Sales item should reference correct product',
    );
  });

  await test('getSalesInvoiceItemById', async () => {
    const salesItemById = await getSalesInvoiceItemById(
      company.id,
      salesInvoice.id,
      salesItem.id,
    );

    assert(
      salesItemById?.id === salesItem.id,
      'Sales invoice item should be found by id',
    );
  });

  await test('sales invoice decreases stock', async () => {
    const currentStock = await getWarehouseStock(
      company.id,
      warehouse.id,
      product.id,
    );

    assert(
      currentStock?.quantity === '22',
      `Expected stock 22 after sale, got ${currentStock?.quantity}`,
    );
  });

  // --------------------------------------------------------------------------
  // Sales stock movement
  // --------------------------------------------------------------------------

  section('SALES STOCK MOVEMENT');

  let salesMovement: Awaited<
    ReturnType<typeof getStockMovementsByProduct>
  >[number];

  await test('sales stock movement is created', async () => {
    const salesMovements = await getStockMovementsByProduct(
      company.id,
      product.id,
    );

    salesMovement = salesMovements.find(
      (movement) =>
        movement.type === 'SALE' && movement.salesInvoiceId === salesInvoice.id,
    )!;

    assert(salesMovement, 'Sales stock movement should be created');
  });

  await test('duplicate sales stock movement is rejected', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: warehouse.id,
          productId: product.id,
          type: 'SALE',
          quantity: '10',
          salesInvoiceId: salesInvoice.id,
        }),
      'Duplicate sales stock movement should be rejected',
    );
  });

  // --------------------------------------------------------------------------
  // Sales invoice status
  // --------------------------------------------------------------------------

  section('SALES INVOICE STATUS');

  await test('sales invoice can become PAID', async () => {
    const paidSales = await updateSalesInvoice(company.id, salesInvoice.id, {
      status: 'PAID',
    });

    assert(paidSales?.status === 'PAID', 'Sales invoice should become PAID');
  });

  await test('paid sales invoice cannot be cancelled', async () => {
    await expectError(
      () =>
        updateSalesInvoice(company.id, salesInvoice.id, {
          status: 'CANCELLED',
        }),
      'Paid sales invoice should not be changed',
    );
  });

  // --------------------------------------------------------------------------
  // Stock movement getters
  // --------------------------------------------------------------------------

  section('STOCK MOVEMENT GETTERS');

  await test('getStockMovementsByWarehouse', async () => {
    const warehouseMovements = await getStockMovementsByWarehouse(
      company.id,
      warehouse.id,
    );

    assert(
      warehouseMovements.some(
        (movement) => movement.id === purchaseMovement.id,
      ),
      'Purchase movement should be found by warehouse',
    );

    assert(
      warehouseMovements.some((movement) => movement.id === salesMovement.id),
      'Sales movement should be found by warehouse',
    );
  });

  await test('getStockMovementsByType → PURCHASE', async () => {
    const purchaseTypeMovements = await getStockMovementsByType(
      company.id,
      'PURCHASE',
    );

    assert(
      purchaseTypeMovements.some(
        (movement) => movement.id === purchaseMovement.id,
      ),
      'Purchase movement should be found by type',
    );
  });

  await test('getStockMovementsByType → SALE', async () => {
    const salesTypeMovements = await getStockMovementsByType(
      company.id,
      'SALE',
    );

    assert(
      salesTypeMovements.some((movement) => movement.id === salesMovement.id),
      'Sales movement should be found by type',
    );
  });

  // --------------------------------------------------------------------------
  // Stock movement validation
  // --------------------------------------------------------------------------

  section('STOCK MOVEMENT VALIDATION');

  await test('PURCHASE without invoice is rejected', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: warehouse.id,
          productId: product.id,
          type: 'PURCHASE',
          quantity: '1',
        }),
      'Purchase movement without invoice should be rejected',
    );
  });

  await test('SALE without invoice is rejected', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: warehouse.id,
          productId: product.id,
          type: 'SALE',
          quantity: '1',
        }),
      'Sale movement without invoice should be rejected',
    );
  });

  await test('ADJUSTMENT_IN with invoice is rejected', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: warehouse.id,
          productId: product.id,
          type: 'ADJUSTMENT_IN',
          quantity: '1',
          purchaseInvoiceId: purchaseInvoice.id,
        }),
      'Adjustment movement with invoice should be rejected',
    );
  });

  await test('ADJUSTMENT_OUT with invoice is rejected', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: warehouse.id,
          productId: product.id,
          type: 'ADJUSTMENT_OUT',
          quantity: '1',
          salesInvoiceId: salesInvoice.id,
        }),
      'Adjustment movement with invoice should be rejected',
    );
  });

  await test('movement with both invoices is rejected', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: warehouse.id,
          productId: product.id,
          type: 'PURCHASE',
          quantity: '1',
          purchaseInvoiceId: purchaseInvoice.id,
          salesInvoiceId: salesInvoice.id,
        }),
      'Movement with both invoices should be rejected',
    );
  });

  await test('zero movement quantity is rejected', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: warehouse.id,
          productId: product.id,
          type: 'ADJUSTMENT_IN',
          quantity: '0',
        }),
      'Zero movement quantity should be rejected',
    );
  });

  await test('negative movement quantity is rejected', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: warehouse.id,
          productId: product.id,
          type: 'ADJUSTMENT_IN',
          quantity: '-1',
        }),
      'Negative movement quantity should be rejected',
    );
  });

  await test('wrong product for purchase is rejected', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: warehouse.id,
          productId: secondProduct.id,
          type: 'PURCHASE',
          quantity: '20',
          purchaseInvoiceId: purchaseInvoice.id,
        }),
      'Purchase movement with wrong product should be rejected',
    );
  });

  await test('wrong product for sale is rejected', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: warehouse.id,
          productId: secondProduct.id,
          type: 'SALE',
          quantity: '10',
          salesInvoiceId: salesInvoice.id,
        }),
      'Sales movement with wrong product should be rejected',
    );
  });

  await test('wrong warehouse for purchase is rejected', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: secondWarehouse.id,
          productId: product.id,
          type: 'PURCHASE',
          quantity: '20',
          purchaseInvoiceId: purchaseInvoice.id,
        }),
      'Purchase movement with wrong warehouse should be rejected',
    );
  });

  await test('wrong warehouse for sale is rejected', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: secondWarehouse.id,
          productId: product.id,
          type: 'SALE',
          quantity: '10',
          salesInvoiceId: salesInvoice.id,
        }),
      'Sales movement with wrong warehouse should be rejected',
    );
  });

  // --------------------------------------------------------------------------
  // Stock adjustments
  // --------------------------------------------------------------------------

  section('STOCK ADJUSTMENTS');

  await test('ADJUSTMENT_IN increases stock', async () => {
    await createStockMovement(company.id, {
      warehouseId: warehouse.id,
      productId: product.id,
      type: 'ADJUSTMENT_IN',
      quantity: '5',
    });

    const currentStock = await getWarehouseStock(
      company.id,
      warehouse.id,
      product.id,
    );

    assert(
      currentStock?.quantity === '27',
      `Expected stock 27 after adjustment in, got ${currentStock?.quantity}`,
    );
  });

  await test('ADJUSTMENT_OUT decreases stock', async () => {
    await createStockMovement(company.id, {
      warehouseId: warehouse.id,
      productId: product.id,
      type: 'ADJUSTMENT_OUT',
      quantity: '2',
    });

    const currentStock = await getWarehouseStock(
      company.id,
      warehouse.id,
      product.id,
    );

    assert(
      currentStock?.quantity === '25',
      `Expected stock 25 after adjustment out, got ${currentStock?.quantity}`,
    );
  });

  // --------------------------------------------------------------------------
  // Cross-company isolation
  // --------------------------------------------------------------------------

  section('CROSS-COMPANY ISOLATION');

  await test('Company A cannot access Company B customer', async () => {
    const foreignCustomerFromCompany = await getCustomerById(
      company.id,
      foreignCustomer.id,
    );

    assert(
      foreignCustomerFromCompany === null,
      'Company A should not access Company B customer',
    );
  });

  await test('Company A cannot access Company B supplier', async () => {
    const foreignSupplierFromCompany = await getSupplierById(
      company.id,
      foreignSupplier.id,
    );

    assert(
      foreignSupplierFromCompany === null,
      'Company A should not access Company B supplier',
    );
  });

  await test('Company A cannot access Company B product', async () => {
    const foreignProductFromCompany = await getProductById(
      company.id,
      secondCompanyProduct.id,
    );

    assert(
      foreignProductFromCompany === null,
      'Company A should not access Company B product',
    );
  });

  await test('Company A cannot access Company B warehouse', async () => {
    const foreignWarehouseFromCompany = await getWarehouseById(
      company.id,
      secondCompanyWarehouse.id,
    );

    assert(
      foreignWarehouseFromCompany === null,
      'Company A should not access Company B warehouse',
    );
  });

  await test('Company A cannot update Company B product', async () => {
    await expectNoResult(
      () =>
        updateProduct(company.id, secondCompanyProduct.id, {
          salePrice: '999',
        }),
      'Company A should not update Company B product',
    );
  });

  await test('Company A cannot update Company B warehouse', async () => {
    await expectNoResult(
      () =>
        updateWarehouse(company.id, secondCompanyWarehouse.id, {
          address: 'Hacked',
        }),
      'Company A should not update Company B warehouse',
    );
  });

  await test('Company A cannot update Company B customer', async () => {
    await expectNoResult(
      () =>
        updateCustomer(company.id, foreignCustomer.id, {
          name: 'Hacked Customer',
        }),
      'Company A should not update Company B customer',
    );
  });

  await test('Company A cannot update Company B supplier', async () => {
    await expectNoResult(
      () =>
        updateSupplier(company.id, foreignSupplier.id, {
          name: 'Hacked Supplier',
        }),
      'Company A should not update Company B supplier',
    );
  });

  await test('Company A cannot create stock in Company B warehouse', async () => {
    await expectError(
      () =>
        createWarehouseStock(company.id, secondCompanyWarehouse.id, {
          productId: product.id,
          quantity: '1',
        }),
      'Company A should not create stock in Company B warehouse',
    );
  });

  await test('Company A cannot create stock for Company B product', async () => {
    await expectError(
      () =>
        createWarehouseStock(company.id, warehouse.id, {
          productId: secondCompanyProduct.id,
          quantity: '1',
        }),
      'Company A should not create stock for Company B product',
    );
  });

  await test('Company A cannot create movement in Company B warehouse', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: secondCompanyWarehouse.id,
          productId: product.id,
          type: 'ADJUSTMENT_IN',
          quantity: '1',
        }),
      'Company A should not create movement in Company B warehouse',
    );
  });

  await test('Company A cannot create movement for Company B product', async () => {
    await expectError(
      () =>
        createStockMovement(company.id, {
          warehouseId: warehouse.id,
          productId: secondCompanyProduct.id,
          type: 'ADJUSTMENT_IN',
          quantity: '1',
        }),
      'Company A should not create movement for Company B product',
    );
  });

  await test('Company A cannot create purchase invoice with Company B supplier', async () => {
    await expectError(
      () =>
        createPurchaseInvoice(company.id, {
          supplierId: foreignSupplier.id,
          warehouseId: warehouse.id,
          items: [
            {
              productId: product.id,
              quantity: '1',
              unitPrice: '100',
            },
          ],
        }),
      'Company A should not create purchase invoice with Company B supplier',
    );
  });

  await test('Company A cannot create sales invoice with Company B customer', async () => {
    await expectError(
      () =>
        createSalesInvoice(company.id, {
          customerId: foreignCustomer.id,
          warehouseId: warehouse.id,
          items: [
            {
              productId: product.id,
              quantity: '1',
              unitPrice: '100',
            },
          ],
        }),
      'Company A should not create sales invoice with Company B customer',
    );
  });

  // --------------------------------------------------------------------------
  // Transaction rollback — direct DB transaction
  // --------------------------------------------------------------------------

  section('TRANSACTION ROLLBACK — DIRECT DB TRANSACTION');

  await test('stock is 25 before direct rollback', async () => {
    const stockBeforeDirectRollback = await getWarehouseStock(
      company.id,
      warehouse.id,
      product.id,
    );

    assert(
      stockBeforeDirectRollback?.quantity === '25',
      'Stock should be 25 before direct rollback test',
    );
  });

  const movementsBeforeDirectRollback = await getStockMovementsByProduct(
    company.id,
    product.id,
  );

  const movementCountBeforeDirectRollback =
    movementsBeforeDirectRollback.length;

  await test('direct transaction rolls back after error', async () => {
    await expectError(async () => {
      await db.transaction(async (tx) => {
        await tx.orm.public.StockMovement.create({
          companyId: company.id,
          warehouseId: warehouse.id,
          productId: product.id,
          type: 'ADJUSTMENT_IN',
          quantity: '100',
        });

        await tx.orm.public.WarehouseStock.where({
          companyId: company.id,
          warehouseId: warehouse.id,
          productId: product.id,
        }).update({
          quantity: '125',
        });

        throw new Error('Intentional rollback');
      });
    }, 'Direct transaction should rollback after error');
  });

  await test('stock remains unchanged after direct rollback', async () => {
    const stockAfterDirectRollback = await getWarehouseStock(
      company.id,
      warehouse.id,
      product.id,
    );

    assert(
      stockAfterDirectRollback?.quantity === '25',
      'Stock should remain 25 after direct transaction rollback',
    );
  });

  await test('stock movement is rolled back with transaction', async () => {
    const movementsAfterDirectRollback = await getStockMovementsByProduct(
      company.id,
      product.id,
    );

    assert(
      movementsAfterDirectRollback.length === movementCountBeforeDirectRollback,
      'Stock movement should be rolled back',
    );
  });

  // --------------------------------------------------------------------------
  // Transaction rollback — real sales invoice
  // --------------------------------------------------------------------------

  section('TRANSACTION ROLLBACK — SALES INVOICE');

  const salesInvoicesBeforeRollback = await getSalesInvoicesByCompanyId(
    company.id,
  );

  const productStockBeforeSalesRollback = await getWarehouseStock(
    company.id,
    warehouse.id,
    product.id,
  );

  const movementsBeforeSalesRollback = await getStockMovementsByProduct(
    company.id,
    product.id,
  );

  const productMovementCountBeforeSalesRollback =
    movementsBeforeSalesRollback.length;

  await test('failed sales invoice is rejected', async () => {
    assert(
      productStockBeforeSalesRollback?.quantity === '25',
      'Product stock should be 25 before sales rollback test',
    );

    await expectError(
      () =>
        createSalesInvoice(company.id, {
          customerId: activeCustomer.id,
          warehouseId: warehouse.id,
          items: [
            {
              productId: product.id,
              quantity: '1',
              unitPrice: '100',
            },
            {
              productId: secondProduct.id,
              quantity: '999999',
              unitPrice: '50',
            },
          ],
        }),
      'Sales invoice should rollback when a later item fails due to insufficient stock',
    );
  });

  await test('failed sales invoice is not persisted', async () => {
    const salesInvoicesAfterRollback = await getSalesInvoicesByCompanyId(
      company.id,
    );

    assert(
      salesInvoicesAfterRollback.length === salesInvoicesBeforeRollback.length,
      'Failed sales invoice should not persist',
    );
  });

  await test('failed sales invoice stock change is rolled back', async () => {
    const productStockAfterSalesRollback = await getWarehouseStock(
      company.id,
      warehouse.id,
      product.id,
    );

    assert(
      productStockAfterSalesRollback?.quantity === '25',
      'First stock decrease should be rolled back',
    );
  });

  await test('failed sales invoice movement is rolled back', async () => {
    const movementsAfterSalesRollback = await getStockMovementsByProduct(
      company.id,
      product.id,
    );

    assert(
      movementsAfterSalesRollback.length ===
        productMovementCountBeforeSalesRollback,
      'Stock movement from failed sales invoice should be rolled back',
    );
  });

  // --------------------------------------------------------------------------
  // Final consistency checks
  // --------------------------------------------------------------------------

  section('FINAL CONSISTENCY CHECKS');

  await test('final product stock is correct', async () => {
    const finalStock = await getWarehouseStock(
      company.id,
      warehouse.id,
      product.id,
    );

    assert(
      finalStock?.quantity === '25',
      `Final product stock should be 25, got ${finalStock?.quantity}`,
    );
  });

  await test('final product movements are consistent', async () => {
    const finalMovements = await getStockMovementsByProduct(
      company.id,
      product.id,
    );

    assert(
      finalMovements.length >= 4,
      'Expected purchase, sale and adjustment movements',
    );

    assert(
      finalMovements.every((movement) => movement.productId === product.id),
      'All product movements should reference the correct product',
    );
  });

  await test('final warehouse movements are consistent', async () => {
    const finalWarehouseMovements = await getStockMovementsByWarehouse(
      company.id,
      warehouse.id,
    );

    assert(
      finalWarehouseMovements.every(
        (movement) => movement.warehouseId === warehouse.id,
      ),
      'All warehouse movements should reference the correct warehouse',
    );
  });

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------

  console.log('\n');
  console.log('════════════════════════════════════════════════════════════');
  console.log('                       TEST SUMMARY');
  console.log('════════════════════════════════════════════════════════════');

  console.log(`✅ PASSED: ${passed}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log(`📊 TOTAL:  ${passed + failed}`);

  if (failed > 0) {
    console.log('\n❌ FUNCTIONAL TESTS FAILED');
    process.exitCode = 1;
  } else {
    console.log('\n🎉 ALL FUNCTIONAL TESTS PASSED');
  }

  console.log('════════════════════════════════════════════════════════════');
}

main().catch((error) => {
  console.error('\n💥 FATAL TEST ERROR');

  if (error instanceof Error) {
    console.error(error.message);

    if (error.stack) {
      console.error(error.stack);
    }
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});
