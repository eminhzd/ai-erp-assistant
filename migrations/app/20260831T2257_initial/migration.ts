#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0dc7353e539a0d3f32952224602ee003d68b1a94fb00bde902247b8972556fba/contract';
import endContract from '../../snapshots/0dc7353e539a0d3f32952224602ee003d68b1a94fb00bde902247b8972556fba/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'chats',
        columns: [
          col('companyId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('title', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'company',
        columns: [
          col('address', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('currency', 'text', {
            notNull: true,
            default: lit('AZN'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('taxId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'company_currency_check_645607a3',
            "\"currency\" IN ('USD', 'EUR', 'AZN')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'customer',
        columns: [
          col('address', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('companyId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('taxId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'messages',
        columns: [
          col('chatId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('companyId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('content', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('role', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'product',
        columns: [
          col('companyId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('purchasePrice', 'numeric', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('salePrice', 'numeric', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('sku', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('unit', 'text', {
            notNull: true,
            default: lit('pcs'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'purchaseInvoice',
        columns: [
          col('companyId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('currency', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('discount', 'numeric', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('dueDate', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('invoiceNumber', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('issueDate', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('ISSUED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('subtotal', 'numeric', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('supplierId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('tax', 'numeric', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('total', 'numeric', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('warehouseId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'purchaseInvoice_currency_check_645607a3',
            "\"currency\" IN ('USD', 'EUR', 'AZN')",
          ),
          checkExpression(
            'purchaseInvoice_status_check_41b49830',
            "\"status\" IN ('ISSUED', 'PAID', 'CANCELLED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'purchaseInvoiceItem',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('invoiceId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('lineTotal', 'numeric', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('productId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('quantity', 'numeric', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('unitPrice', 'numeric', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'salesInvoice',
        columns: [
          col('companyId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('currency', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('customerId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('discount', 'numeric', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('dueDate', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('invoiceNumber', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('issueDate', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('ISSUED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('subtotal', 'numeric', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('tax', 'numeric', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('total', 'numeric', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('warehouseId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'salesInvoice_currency_check_645607a3',
            "\"currency\" IN ('USD', 'EUR', 'AZN')",
          ),
          checkExpression(
            'salesInvoice_status_check_41b49830',
            "\"status\" IN ('ISSUED', 'PAID', 'CANCELLED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'salesInvoiceItem',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('invoiceId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('lineTotal', 'numeric', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('productId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('quantity', 'numeric', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('unitPrice', 'numeric', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'stockMovement',
        columns: [
          col('companyId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('productId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('purchaseInvoiceId', 'int4', {
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('quantity', 'numeric', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('salesInvoiceId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('type', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('warehouseId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'stockMovement_type_check_d544519b',
            "\"type\" IN ('PURCHASE', 'SALE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'supplier',
        columns: [
          col('address', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('companyId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('taxId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'warehouse',
        columns: [
          col('address', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('companyId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'warehouseStock',
        columns: [
          col('companyId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('productId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('quantity', 'numeric', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('warehouseId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'customer',
        constraint: 'customer_companyId_name_key',
        columns: ['companyId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'product',
        constraint: 'product_companyId_sku_key',
        columns: ['companyId', 'sku'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'purchaseInvoice',
        constraint: 'purchaseInvoice_companyId_invoiceNumber_key',
        columns: ['companyId', 'invoiceNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'salesInvoice',
        constraint: 'salesInvoice_companyId_invoiceNumber_key',
        columns: ['companyId', 'invoiceNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'supplier',
        constraint: 'supplier_companyId_name_key',
        columns: ['companyId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'warehouse',
        constraint: 'warehouse_companyId_name_key',
        columns: ['companyId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'warehouseStock',
        constraint: 'warehouseStock_companyId_warehouseId_productId_key',
        columns: ['companyId', 'warehouseId', 'productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'chats',
        index: 'chats_companyId_idx_33acc5ed',
        columns: ['companyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'company',
        index: 'company_name_idx_ce87e6ba',
        columns: ['name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'company',
        index: 'company_taxId_idx_c4d51a67',
        columns: ['taxId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'customer',
        index: 'customer_companyId_idx_33acc5ed',
        columns: ['companyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'customer',
        index: 'customer_companyId_isActive_idx_6f8da694',
        columns: ['companyId', 'isActive'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'customer',
        index: 'customer_companyId_taxId_idx_ce946cc0',
        columns: ['companyId', 'taxId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'messages',
        index: 'messages_chatId_idx_53965835',
        columns: ['chatId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'messages',
        index: 'messages_companyId_chatId_idx_0ac66d6f',
        columns: ['companyId', 'chatId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'messages',
        index: 'messages_companyId_idx_33acc5ed',
        columns: ['companyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'product',
        index: 'product_companyId_idx_33acc5ed',
        columns: ['companyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'product',
        index: 'product_companyId_isActive_idx_6f8da694',
        columns: ['companyId', 'isActive'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'product',
        index: 'product_companyId_name_idx_4b7916d1',
        columns: ['companyId', 'name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'purchaseInvoice',
        index: 'purchaseInvoice_companyId_idx_33acc5ed',
        columns: ['companyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'purchaseInvoice',
        index: 'purchaseInvoice_companyId_issueDate_idx_ee8e6ade',
        columns: ['companyId', 'issueDate'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'purchaseInvoice',
        index: 'purchaseInvoice_companyId_status_idx_86f6fb02',
        columns: ['companyId', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'purchaseInvoice',
        index: 'purchaseInvoice_supplierId_idx_c4d9a8b9',
        columns: ['supplierId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'purchaseInvoice',
        index: 'purchaseInvoice_warehouseId_idx_8ff93e70',
        columns: ['warehouseId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'purchaseInvoiceItem',
        index: 'purchaseInvoiceItem_invoiceId_idx_d5c4f70e',
        columns: ['invoiceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'purchaseInvoiceItem',
        index: 'purchaseInvoiceItem_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'salesInvoice',
        index: 'salesInvoice_companyId_idx_33acc5ed',
        columns: ['companyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'salesInvoice',
        index: 'salesInvoice_companyId_issueDate_idx_ee8e6ade',
        columns: ['companyId', 'issueDate'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'salesInvoice',
        index: 'salesInvoice_companyId_status_idx_86f6fb02',
        columns: ['companyId', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'salesInvoice',
        index: 'salesInvoice_customerId_idx_b2a8a46c',
        columns: ['customerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'salesInvoice',
        index: 'salesInvoice_warehouseId_idx_8ff93e70',
        columns: ['warehouseId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'salesInvoiceItem',
        index: 'salesInvoiceItem_invoiceId_idx_d5c4f70e',
        columns: ['invoiceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'salesInvoiceItem',
        index: 'salesInvoiceItem_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'stockMovement',
        index: 'stockMovement_companyId_idx_33acc5ed',
        columns: ['companyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'stockMovement',
        index: 'stockMovement_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'stockMovement',
        index: 'stockMovement_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'stockMovement',
        index: 'stockMovement_purchaseInvoiceId_idx_c03aafe7',
        columns: ['purchaseInvoiceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'stockMovement',
        index: 'stockMovement_salesInvoiceId_idx_9ae0d28c',
        columns: ['salesInvoiceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'stockMovement',
        index: 'stockMovement_warehouseId_idx_8ff93e70',
        columns: ['warehouseId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'stockMovement',
        index: 'stockMovement_warehouseId_productId_idx_a01f08fa',
        columns: ['warehouseId', 'productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'supplier',
        index: 'supplier_companyId_idx_33acc5ed',
        columns: ['companyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'supplier',
        index: 'supplier_companyId_isActive_idx_6f8da694',
        columns: ['companyId', 'isActive'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'supplier',
        index: 'supplier_companyId_taxId_idx_ce946cc0',
        columns: ['companyId', 'taxId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'warehouse',
        index: 'warehouse_companyId_idx_33acc5ed',
        columns: ['companyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'warehouse',
        index: 'warehouse_companyId_isActive_idx_6f8da694',
        columns: ['companyId', 'isActive'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'warehouseStock',
        index: 'warehouseStock_companyId_idx_33acc5ed',
        columns: ['companyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'warehouseStock',
        index: 'warehouseStock_companyId_warehouseId_idx_0cd2ac22',
        columns: ['companyId', 'warehouseId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'warehouseStock',
        index: 'warehouseStock_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'warehouseStock',
        index: 'warehouseStock_warehouseId_idx_8ff93e70',
        columns: ['warehouseId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'chats',
        foreignKey: {
          name: 'chats_companyId_fkey',
          columns: ['companyId'],
          references: { schema: 'public', table: 'company', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'customer',
        foreignKey: {
          name: 'customer_companyId_fkey',
          columns: ['companyId'],
          references: { schema: 'public', table: 'company', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'messages',
        foreignKey: {
          name: 'messages_companyId_fkey',
          columns: ['companyId'],
          references: { schema: 'public', table: 'company', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'messages',
        foreignKey: {
          name: 'messages_chatId_fkey',
          columns: ['chatId'],
          references: { schema: 'public', table: 'chats', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'product',
        foreignKey: {
          name: 'product_companyId_fkey',
          columns: ['companyId'],
          references: { schema: 'public', table: 'company', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'purchaseInvoice',
        foreignKey: {
          name: 'purchaseInvoice_companyId_fkey',
          columns: ['companyId'],
          references: { schema: 'public', table: 'company', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'purchaseInvoice',
        foreignKey: {
          name: 'purchaseInvoice_supplierId_fkey',
          columns: ['supplierId'],
          references: { schema: 'public', table: 'supplier', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'purchaseInvoice',
        foreignKey: {
          name: 'purchaseInvoice_warehouseId_fkey',
          columns: ['warehouseId'],
          references: { schema: 'public', table: 'warehouse', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'purchaseInvoiceItem',
        foreignKey: {
          name: 'purchaseInvoiceItem_invoiceId_fkey',
          columns: ['invoiceId'],
          references: {
            schema: 'public',
            table: 'purchaseInvoice',
            columns: ['id'],
          },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'purchaseInvoiceItem',
        foreignKey: {
          name: 'purchaseInvoiceItem_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'product', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'salesInvoice',
        foreignKey: {
          name: 'salesInvoice_companyId_fkey',
          columns: ['companyId'],
          references: { schema: 'public', table: 'company', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'salesInvoice',
        foreignKey: {
          name: 'salesInvoice_customerId_fkey',
          columns: ['customerId'],
          references: { schema: 'public', table: 'customer', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'salesInvoice',
        foreignKey: {
          name: 'salesInvoice_warehouseId_fkey',
          columns: ['warehouseId'],
          references: { schema: 'public', table: 'warehouse', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'salesInvoiceItem',
        foreignKey: {
          name: 'salesInvoiceItem_invoiceId_fkey',
          columns: ['invoiceId'],
          references: {
            schema: 'public',
            table: 'salesInvoice',
            columns: ['id'],
          },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'salesInvoiceItem',
        foreignKey: {
          name: 'salesInvoiceItem_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'product', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'stockMovement',
        foreignKey: {
          name: 'stockMovement_companyId_fkey',
          columns: ['companyId'],
          references: { schema: 'public', table: 'company', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'stockMovement',
        foreignKey: {
          name: 'stockMovement_warehouseId_fkey',
          columns: ['warehouseId'],
          references: { schema: 'public', table: 'warehouse', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'stockMovement',
        foreignKey: {
          name: 'stockMovement_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'product', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'stockMovement',
        foreignKey: {
          name: 'stockMovement_salesInvoiceId_fkey',
          columns: ['salesInvoiceId'],
          references: {
            schema: 'public',
            table: 'salesInvoice',
            columns: ['id'],
          },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'stockMovement',
        foreignKey: {
          name: 'stockMovement_purchaseInvoiceId_fkey',
          columns: ['purchaseInvoiceId'],
          references: {
            schema: 'public',
            table: 'purchaseInvoice',
            columns: ['id'],
          },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'supplier',
        foreignKey: {
          name: 'supplier_companyId_fkey',
          columns: ['companyId'],
          references: { schema: 'public', table: 'company', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'warehouse',
        foreignKey: {
          name: 'warehouse_companyId_fkey',
          columns: ['companyId'],
          references: { schema: 'public', table: 'company', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'warehouseStock',
        foreignKey: {
          name: 'warehouseStock_companyId_fkey',
          columns: ['companyId'],
          references: { schema: 'public', table: 'company', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'warehouseStock',
        foreignKey: {
          name: 'warehouseStock_warehouseId_fkey',
          columns: ['warehouseId'],
          references: { schema: 'public', table: 'warehouse', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'warehouseStock',
        foreignKey: {
          name: 'warehouseStock_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'product', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
