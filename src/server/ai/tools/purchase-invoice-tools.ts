import { tool } from 'ai';
import * as z from 'zod';

import {
  createPurchaseInvoice,
  getPurchaseInvoiceById,
  getPurchaseInvoicesByCompanyId,
  updatePurchaseInvoice,
} from '@/server/purchase-invoice/purchase-invoice.service';

import { decimalStringSchema, runTool } from '@/lib/utils';

const purchaseInvoiceItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: decimalStringSchema,
  unitPrice: decimalStringSchema,
});

export function createPurchaseInvoiceTools(companyId: number) {
  return {
    listPurchaseInvoices: tool({
      description:
        'List purchase invoices for the current company. Use this tool when the user asks to list or inspect purchase invoices. Use current tool results to identify a specific invoice. Do not guess invoice IDs.',
      inputSchema: z.object({}),
      execute: () =>
        runTool(
          'listPurchaseInvoices',
          'Purchase invoices could not be retrieved.',
          async () => {
            const invoices = await getPurchaseInvoicesByCompanyId(companyId);

            return invoices.map((invoice) => ({
              id: invoice.id,
              supplierId: invoice.supplierId,
              warehouseId: invoice.warehouseId,
              invoiceNumber: invoice.invoiceNumber,
              currency: invoice.currency,
              status: invoice.status,
              subtotal: invoice.subtotal,
              discount: invoice.discount,
              tax: invoice.tax,
              total: invoice.total,
              issueDate: invoice.issueDate?.toISOString(),
              dueDate: invoice.dueDate?.toISOString(),
              notes: invoice.notes,
            }));
          },
        ),
    }),

    getPurchaseInvoice: tool({
      description:
        'Get one purchase invoice by numeric invoice ID. Use this tool when the user wants to inspect a specific purchase invoice and its ID is known or has been resolved from current invoice results. Do not guess the ID.',
      inputSchema: z.object({
        invoiceId: z.number().int().positive(),
      }),
      execute: ({ invoiceId }) =>
        runTool(
          'getPurchaseInvoice',
          'Purchase invoice could not be retrieved.',
          async () => {
            const invoice = await getPurchaseInvoiceById(companyId, invoiceId);

            if (!invoice) {
              return {
                found: false,
              };
            }

            return {
              found: true,
              invoice: {
                id: invoice.id,
                supplierId: invoice.supplierId,
                warehouseId: invoice.warehouseId,
                invoiceNumber: invoice.invoiceNumber,
                currency: invoice.currency,
                status: invoice.status,
                subtotal: invoice.subtotal,
                discount: invoice.discount,
                tax: invoice.tax,
                total: invoice.total,
                issueDate: invoice.issueDate?.toISOString(),
                dueDate: invoice.dueDate?.toISOString(),
                notes: invoice.notes,
              },
            };
          },
        ),
    }),

    createPurchaseInvoice: tool({
      description:
        'Create a purchase invoice for the current company. Use this tool only when the user explicitly asks to create a purchase invoice. The intended supplier MUST be explicitly provided by the user or resolved from a current supplier lookup that uniquely matches the user reference. If the current request does not specify a supplier, STOP and ask the user which supplier to use. NEVER select a supplier because it was used in a previous invoice, appeared earlier in the conversation, is the first search result, is the only available supplier, or seems likely. The warehouse and every product must also be explicitly provided or uniquely resolved. Use IDs only after the corresponding entity has been explicitly identified or uniquely resolved. Each item requires a product ID, quantity, and unit price. Invoice number and currency are generated automatically by the system and must not be provided by the model. Discount, tax, due date, issue date, and notes are optional. Do not invent suppliers, warehouses, products, quantities, prices, or other missing business information. Creating the invoice also creates its purchase stock movements, so do not separately increase warehouse stock for the same purchase.',
      inputSchema: z.object({
        supplierId: z.number().int().positive(),

        warehouseId: z.number().int().positive(),

        discount: decimalStringSchema.optional(),

        tax: decimalStringSchema.optional(),

        issueDate: z.iso.datetime().optional(),

        dueDate: z.iso.datetime().optional(),

        notes: z.string().trim().max(1000).optional(),

        items: z.array(purchaseInvoiceItemSchema).min(1).max(100),
      }),
      execute: (invoiceData) =>
        runTool(
          'createPurchaseInvoice',
          'Purchase invoice could not be created.',
          async () => {
            const invoice = await createPurchaseInvoice(companyId, {
              ...invoiceData,
              issueDate: invoiceData.issueDate
                ? new Date(invoiceData.issueDate)
                : undefined,
              dueDate: invoiceData.dueDate
                ? new Date(invoiceData.dueDate)
                : undefined,
            });

            return {
              invoice: {
                id: invoice.id,
                supplierId: invoice.supplierId,
                warehouseId: invoice.warehouseId,
                invoiceNumber: invoice.invoiceNumber,
                currency: invoice.currency,
                status: invoice.status,
                subtotal: invoice.subtotal,
                discount: invoice.discount,
                tax: invoice.tax,
                total: invoice.total,
                issueDate: invoice.issueDate?.toISOString(),
                dueDate: invoice.dueDate?.toISOString(),
              },
            };
          },
        ),
    }),

    markPurchaseInvoiceAsPaid: tool({
      description:
        'Mark an existing purchase invoice as paid. Use this tool only when the user explicitly asks to mark a purchase invoice as paid. The invoice ID must identify the intended invoice. Cancelled invoices cannot be modified, and a paid invoice cannot be paid again. Do not use this tool to cancel an invoice.',
      inputSchema: z.object({
        invoiceId: z.number().int().positive(),
      }),
      execute: ({ invoiceId }) =>
        runTool(
          'markPurchaseInvoiceAsPaid',
          'Purchase invoice could not be marked as paid.',
          async () => {
            const invoice = await updatePurchaseInvoice(companyId, invoiceId, {
              status: 'PAID',
            });

            if (!invoice) {
              return {
                updated: false,
                reason: 'Purchase invoice not found.',
              };
            }

            return {
              invoice: {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                status: invoice.status,
                total: invoice.total,
                currency: invoice.currency,
              },
            };
          },
        ),
    }),
  };
}
