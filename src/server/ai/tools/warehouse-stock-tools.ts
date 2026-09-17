import { tool } from 'ai';

import * as z from 'zod';

import {
  getWarehouseStock,
  getWarehouseStocksByWarehouseId,
} from '@/server/warehouse-stock/warehouse-stock.service';

import { runTool } from '@/lib/utils';

export function createWarehouseStockTools(companyId: number) {
  return {
    listWarehouseStock: tool({
      description:
        'List all stock quantities for a specific warehouse in the current company. Use this tool when the user asks what products or quantities are available in a warehouse. The warehouse ID must be known or resolved from a current warehouse search. Do not guess the ID.',
      inputSchema: z.object({
        warehouseId: z.number().int().positive(),
      }),
      execute: ({ warehouseId }) =>
        runTool(
          'listWarehouseStock',
          'Warehouse stock could not be retrieved.',
          async () => {
            const stocks = await getWarehouseStocksByWarehouseId(
              companyId,
              warehouseId,
            );

            return stocks.map((stock) => ({
              warehouseId: stock.warehouseId,
              productId: stock.productId,
              quantity: stock.quantity,
            }));
          },
        ),
    }),

    getWarehouseStock: tool({
      description:
        'Get the stock quantity of one specific product in one specific warehouse. Use this tool when the user asks how much of a product is available in a warehouse. Both the warehouse ID and product ID must be known or resolved from current tool results. Do not guess IDs.',
      inputSchema: z.object({
        warehouseId: z.number().int().positive(),
        productId: z.number().int().positive(),
      }),
      execute: ({ warehouseId, productId }) =>
        runTool(
          'getWarehouseStock',
          'Warehouse stock could not be retrieved.',
          async () => {
            const stock = await getWarehouseStock(
              companyId,
              warehouseId,
              productId,
            );

            if (!stock) {
              return {
                found: false,
                warehouseId,
                productId,
              };
            }

            return {
              found: true,
              stock: {
                warehouseId: stock.warehouseId,
                productId: stock.productId,
                quantity: stock.quantity,
              },
            };
          },
        ),
    }),
  };
}
