import { registerUser } from '@/server/users/user.service';
import { createCustomer } from '@/server/customers/customer.service';
import { createSupplier } from '@/server/suppliers/supplier.service';
import { createProduct } from '@/server/products/product.service';
import { createWarehouse } from '@/server/warehouses/warehouse.service';
import { createPurchaseInvoice } from '@/server/purchase-invoice/purchase-invoice.service';
import { createSalesInvoice } from '@/server/sales-invoice/sales-invoice.service';
import { createStockMovement } from '@/server/stock-movements/stock-movements.service';

async function main() {
  console.log('🌱 Starting demo seed...\n');

  // --------------------------------------------------
  // Company + User
  // --------------------------------------------------

  const { user, company } = await registerUser({
    name: 'Alex Morgan',
    email: 'demo@example.com',
    password: 'Demo1234!',
    companyName: 'Northbridge Beverages Ltd.',
  });

  console.log(`✅ Company created: ${company.name}`);
  console.log(`✅ User created: ${user.email}\n`);

  // --------------------------------------------------
  // Customers
  // --------------------------------------------------

  const customers = await Promise.all([
    createCustomer(company.id, {
      name: 'The Corner Kitchen',
      email: 'hello@cornerkitchen.example',
      phone: '+44 20 7946 0101',
      address: '14 King Street',
    }),

    createCustomer(company.id, {
      name: 'Oak & Stone Café',
      email: 'contact@oakandstone.example',
      phone: '+44 20 7946 0102',
      address: '27 High Street',
    }),

    createCustomer(company.id, {
      name: 'Westfield Market',
      email: 'orders@westfieldmarket.example',
      phone: '+44 20 7946 0103',
      address: '82 West Road',
    }),

    createCustomer(company.id, {
      name: 'Riverside Bistro',
      email: 'hello@riversidebistro.example',
      phone: '+44 20 7946 0104',
      address: '5 Riverside Lane',
    }),
  ]);

  console.log(`✅ Customers created: ${customers.length}`);

  // --------------------------------------------------
  // Suppliers
  // --------------------------------------------------

  const suppliers = await Promise.all([
    createSupplier(company.id, {
      name: 'Coca-Cola Europacific Partners',
      email: 'orders@ccep.example',
      phone: '+44 20 7946 0201',
      address: '1 Distribution Way',
    }),

    createSupplier(company.id, {
      name: 'PepsiCo',
      email: 'orders@pepsico.example',
      phone: '+44 20 7946 0202',
      address: '10 Industrial Park',
    }),

    createSupplier(company.id, {
      name: 'Fritz-Kola',
      email: 'sales@fritz-kola.example',
      phone: '+49 40 5555 0203',
      address: '12 Hafenstraße',
    }),

    createSupplier(company.id, {
      name: 'Beverage Logistics Group',
      email: 'orders@beveragelogistics.example',
      phone: '+44 20 7946 0204',
      address: '45 Commerce Road',
    }),
  ]);

  console.log(`✅ Suppliers created: ${suppliers.length}`);

  // --------------------------------------------------
  // Products
  // --------------------------------------------------

  const products = await Promise.all([
    createProduct(company.id, {
      name: 'Coca-Cola 0.5L',
      sku: 'CC-05',
      purchasePrice: '0.65',
      salePrice: '1.20',
    }),

    createProduct(company.id, {
      name: 'Coca-Cola 1L',
      sku: 'CC-1L',
      purchasePrice: '0.95',
      salePrice: '1.70',
    }),

    createProduct(company.id, {
      name: 'Pepsi 0.5L',
      sku: 'PEP-05',
      purchasePrice: '0.60',
      salePrice: '1.10',
    }),

    createProduct(company.id, {
      name: 'Pepsi 1L',
      sku: 'PEP-1L',
      purchasePrice: '0.90',
      salePrice: '1.60',
    }),

    createProduct(company.id, {
      name: 'Fritz-Kola 0.33L',
      sku: 'FRITZ-033',
      purchasePrice: '0.75',
      salePrice: '1.50',
    }),

    createProduct(company.id, {
      name: 'San Pellegrino 0.5L',
      sku: 'SP-05',
      purchasePrice: '0.55',
      salePrice: '1.20',
    }),

    createProduct(company.id, {
      name: 'Red Bull 0.25L',
      sku: 'RB-025',
      purchasePrice: '1.25',
      salePrice: '2.40',
    }),
  ]);

  console.log(`✅ Products created: ${products.length}`);

  // --------------------------------------------------
  // Warehouses
  // --------------------------------------------------

  const warehouses = await Promise.all([
    createWarehouse(company.id, {
      name: 'Main Warehouse',
      address: '100 Commerce Road',
    }),

    createWarehouse(company.id, {
      name: 'West Distribution Center',
      address: '250 Industrial Estate',
    }),

    createWarehouse(company.id, {
      name: 'Reserve Warehouse',
      address: '18 Storage Park',
    }),
  ]);

  console.log(`✅ Warehouses created: ${warehouses.length}`);

  const [mainWarehouse, westWarehouse, reserveWarehouse] = warehouses;

  // --------------------------------------------------
  // Initial purchase
  // --------------------------------------------------

  const purchaseInvoice = await createPurchaseInvoice(company.id, {
    supplierId: suppliers[0].id,
    warehouseId: mainWarehouse.id,
    items: [
      {
        productId: products[0].id,
        quantity: '22',
        unitPrice: '0.65',
      },
      {
        productId: products[1].id,
        quantity: '10',
        unitPrice: '0.95',
      },
      {
        productId: products[2].id,
        quantity: '15',
        unitPrice: '0.60',
      },
      {
        productId: products[3].id,
        quantity: '8',
        unitPrice: '0.90',
      },
      {
        productId: products[4].id,
        quantity: '20',
        unitPrice: '0.75',
      },
      {
        productId: products[5].id,
        quantity: '80',
        unitPrice: '0.55',
      },
      {
        productId: products[6].id,
        quantity: '11',
        unitPrice: '1.25',
      },
    ],
  });

  console.log(`✅ Initial purchase invoice created: #${purchaseInvoice.id}`);

  // --------------------------------------------------
  // Historical sales
  // --------------------------------------------------

  await createSalesInvoice(company.id, {
    customerId: customers[0].id,
    warehouseId: mainWarehouse.id,
    items: [
      {
        productId: products[0].id,
        quantity: '5',
        unitPrice: '1.20',
      },
    ],
  });

  await createSalesInvoice(company.id, {
    customerId: customers[1].id,
    warehouseId: mainWarehouse.id,
    items: [
      {
        productId: products[2].id,
        quantity: '3',
        unitPrice: '1.10',
      },
    ],
  });

  await createSalesInvoice(company.id, {
    customerId: customers[2].id,
    warehouseId: mainWarehouse.id,
    items: [
      {
        productId: products[5].id,
        quantity: '10',
        unitPrice: '1.20',
      },
    ],
  });

  console.log('✅ Historical sales invoices created');

  // --------------------------------------------------
  // Stock adjustments
  // --------------------------------------------------

  await createStockMovement(company.id, {
    warehouseId: westWarehouse.id,
    productId: products[0].id,
    type: 'ADJUSTMENT_IN',
    quantity: '50',
  });

  await createStockMovement(company.id, {
    warehouseId: westWarehouse.id,
    productId: products[2].id,
    type: 'ADJUSTMENT_IN',
    quantity: '30',
  });

  await createStockMovement(company.id, {
    warehouseId: reserveWarehouse.id,
    productId: products[1].id,
    type: 'ADJUSTMENT_IN',
    quantity: '20',
  });

  console.log('✅ Stock adjustments created');

  // --------------------------------------------------
  // Expected stock
  // --------------------------------------------------

  console.log('\n📦 Expected Main Warehouse stock:');
  console.log('Coca-Cola 0.5L:', 17);
  console.log('Coca-Cola 1L:', 10);
  console.log('Pepsi 0.5L:', 12);
  console.log('Pepsi 1L:', 8);
  console.log('Fritz-Kola 0.33L:', 20);
  console.log('San Pellegrino 0.5L:', 70);
  console.log('Red Bull 0.25L:', 11);

  console.log('\n📦 Expected West Distribution Center stock:');
  console.log('Coca-Cola 0.5L:', 50);
  console.log('Pepsi 0.5L:', 30);

  console.log('\n📦 Expected Reserve Warehouse stock:');
  console.log('Coca-Cola 1L:', 20);

  // --------------------------------------------------
  // AI test examples
  // --------------------------------------------------

  console.log('\n🤖 Suggested AI tests:');

  console.log('- "Show me all customers"');
  console.log('- "Create a customer called North Star Café"');
  console.log('- "Find the customer Westfield Market"');
  console.log('- "Show me all products"');
  console.log('- "How much Coca-Cola 0.5L do we have?"');
  console.log('- "Show stock in the Main Warehouse"');
  console.log('- "Which products are low in stock?"');
  console.log('- "Show me all suppliers"');
  console.log('- "Create a sales invoice for The Corner Kitchen"');
  console.log('- "Create a purchase invoice from PepsiCo"');
  console.log('- "What is the total value of our current stock?"');

  console.log('\n🎉 Demo seed completed successfully!');
}

main().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
