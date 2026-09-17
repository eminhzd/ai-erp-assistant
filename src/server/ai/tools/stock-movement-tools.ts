import { tool } from 'ai';

import * as z from 'zod';

import {
  createStockMovement,
  getStockMovementById,
  getStockMovementsByProduct,
  getStockMovementsByType,
  getStockMovementsByWarehouse,
} from '@/server/stock-movements/stock-movements.service';

import { decimalStringSchema, runTool } from '@/lib/utils';

const stockMovementTypeSchema = z.enum([
  'PURCHASE',
  'SALE',
  'ADJUSTMENT_IN',
  'ADJUSTMENT_OUT',
]);

export function createStockMovementTools(companyId: number) {
  return {
    listStockMovementsByWarehouse: tool({
      description:
        'List stock movements for a specific warehouse in the current company. Use this tool when the user asks about stock movement history for a warehouse. The warehouse ID must be known or resolved from current warehouse results. Do not guess the ID.',
      inputSchema: z.object({
        warehouseId: z.number().int().positive(),
      }),
      execute: ({ warehouseId }) =>
        runTool(
          'listStockMovementsByWarehouse',
          'Stock movements could not be retrieved.',
          async () => {
            const movements = await getStockMovementsByWarehouse(
              companyId,
              warehouseId,
            );

            return movements.map((movement) => ({
              id: movement.id,
              warehouseId: movement.warehouseId,
              productId: movement.productId,
              type: movement.type,
              quantity: movement.quantity,
              salesInvoiceId: movement.salesInvoiceId,
              purchaseInvoiceId: movement.purchaseInvoiceId,
            }));
          },
        ),
    }),

    listStockMovementsByProduct: tool({
      description:
        'List stock movements for a specific product in the current company. Use this tool when the user asks about the movement history of a product. The product ID must be known or resolved from current product results. Do not guess the ID.',
      inputSchema: z.object({
        productId: z.number().int().positive(),
      }),
      execute: ({ productId }) =>
        runTool(
          'listStockMovementsByProduct',
          'Stock movements could not be retrieved.',
          async () => {
            const movements = await getStockMovementsByProduct(
              companyId,
              productId,
            );

            return movements.map((movement) => ({
              id: movement.id,
              warehouseId: movement.warehouseId,
              productId: movement.productId,
              type: movement.type,
              quantity: movement.quantity,
              salesInvoiceId: movement.salesInvoiceId,
              purchaseInvoiceId: movement.purchaseInvoiceId,
            }));
          },
        ),
    }),

    listStockMovementsByType: tool({
      description:
        'List stock movements of a specific type for the current company. Use this tool when the user asks for purchase, sale, incoming adjustment, or outgoing adjustment movements. PURCHASE and SALE movements are normally created automatically by invoice creation; this tool only reads their history.',
      inputSchema: z.object({
        type: stockMovementTypeSchema,
      }),
      execute: ({ type }) =>
        runTool(
          'listStockMovementsByType',
          'Stock movements could not be retrieved.',
          async () => {
            const movements = await getStockMovementsByType(companyId, type);

            return movements.map((movement) => ({
              id: movement.id,
              warehouseId: movement.warehouseId,
              productId: movement.productId,
              type: movement.type,
              quantity: movement.quantity,
              salesInvoiceId: movement.salesInvoiceId,
              purchaseInvoiceId: movement.purchaseInvoiceId,
            }));
          },
        ),
    }),

    getStockMovement: tool({
      description:
        'Get one stock movement by numeric movement ID. Use this tool when the user wants to inspect a specific stock movement and its ID is known or has been resolved from current movement results. Do not guess the ID.',
      inputSchema: z.object({
        movementId: z.number().int().positive(),
      }),
      execute: ({ movementId }) =>
        runTool(
          'getStockMovement',
          'Stock movement could not be retrieved.',
          async () => {
            const movement = await getStockMovementById(companyId, movementId);

            if (!movement) {
              return {
                found: false,
              };
            }

            return {
              found: true,
              movement: {
                id: movement.id,
                warehouseId: movement.warehouseId,
                productId: movement.productId,
                type: movement.type,
                quantity: movement.quantity,
                salesInvoiceId: movement.salesInvoiceId,
                purchaseInvoiceId: movement.purchaseInvoiceId,
              },
            };
          },
        ),
    }),

    createStockAdjustment: tool({
      description:
        'Create a stock adjustment for the current company. Use this tool only when the user explicitly asks to manually increase or decrease stock outside of a purchase or sales invoice. Only ADJUSTMENT_IN and ADJUSTMENT_OUT are allowed. The warehouse ID, product ID, adjustment type, and positive quantity are required. Do not use this tool for purchases or sales, because purchase and sales invoices create their own stock movements automatically. Do not invent IDs or quantities.',
      inputSchema: z.object({
        warehouseId: z.number().int().positive(),
        productId: z.number().int().positive(),
        type: z.enum(['ADJUSTMENT_IN', 'ADJUSTMENT_OUT']),
        quantity: decimalStringSchema,
      }),
      execute: ({ warehouseId, productId, type, quantity }) =>
        runTool(
          'createStockAdjustment',
          'Stock adjustment could not be created.',
          async () => {
            const movement = await createStockMovement(companyId, {
              warehouseId,
              productId,
              type,
              quantity,
            });

            return {
              movement: {
                id: movement.id,
                warehouseId: movement.warehouseId,
                productId: movement.productId,
                type: movement.type,
                quantity: movement.quantity,
              },
            };
          },
        ),
    }),
  };
}
