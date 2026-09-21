import { tool } from 'ai';

import * as z from 'zod';

import {
  createWarehouse,
  getWarehouseById,
  getWarehousesByCompanyId,
  updateWarehouse,
  deleteWarehouse,
  findWarehouses,
} from '@/server/warehouses/warehouse.service';

import { runTool } from '@/lib/utils';

export function createWarehouseTools(companyId: number) {
  return {
    listWarehouses: tool({
      description:
        'List all active warehouses for the current company. Use this tool when the user explicitly asks to list or show the warehouses available in the company.',
      inputSchema: z.object({}),
      execute: () =>
        runTool(
          'listWarehouses',
          'Warehouses could not be retrieved.',
          async () => {
            const warehouses = await getWarehousesByCompanyId(companyId);

            return warehouses.map((warehouse) => ({
              id: warehouse.id,
              name: warehouse.name,
              address: warehouse.address,
            }));
          },
        ),
    }),

    getWarehouse: tool({
      description:
        'Get one active warehouse by numeric warehouse ID. Use this tool when the user wants to inspect a specific warehouse and the warehouse ID is known or has been resolved from a current warehouse search. Do not guess the ID.',
      inputSchema: z.object({
        warehouseId: z.number().int().positive(),
      }),
      execute: ({ warehouseId }) =>
        runTool(
          'getWarehouse',
          'Warehouse could not be retrieved.',
          async () => {
            const warehouse = await getWarehouseById(companyId, warehouseId);

            if (!warehouse) {
              return { found: false };
            }

            return {
              found: true,
              warehouse: {
                id: warehouse.id,
                name: warehouse.name,
                address: warehouse.address,
              },
            };
          },
        ),
    }),

    createWarehouse: tool({
      description:
        'Create a new warehouse for the current company. Use this tool only when the user explicitly asks to create a warehouse. The name is required and the address is optional. Do not call this tool if the required name is missing. Do not invent the warehouse name or address.',
      inputSchema: z.object({
        name: z.string().trim().min(1).max(100),
        address: z.string().trim().max(255).optional(),
      }),
      execute: (warehouseData) =>
        runTool(
          'createWarehouse',
          'Warehouse could not be created.',
          async () => {
            const warehouse = await createWarehouse(companyId, warehouseData);

            return {
              warehouse: {
                id: warehouse.id,
                name: warehouse.name,
                address: warehouse.address,
              },
            };
          },
        ),
    }),

    updateWarehouse: tool({
      description:
        'Update an existing active warehouse. Use this tool only when the user explicitly asks to change warehouse data. The warehouse ID must identify the intended warehouse. Only update fields explicitly provided by the user; do not overwrite unspecified fields or invent values.',
      inputSchema: z
        .object({
          warehouseId: z.number().int().positive(),
          name: z.string().trim().min(1).max(100).optional(),
          address: z.string().trim().max(255).optional(),
        })
        .refine(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ warehouseId: _, ...warehouseData }) =>
            Object.values(warehouseData).some((value) => value !== undefined),
          { message: 'At least one warehouse field must be provided' },
        ),
      execute: ({ warehouseId, ...warehouseData }) =>
        runTool(
          'updateWarehouse',
          'Warehouse could not be updated.',
          async () => {
            const warehouse = await updateWarehouse(
              companyId,
              warehouseId,
              warehouseData,
            );

            if (!warehouse) {
              return {
                updated: false,
                reason: 'Warehouse not found.',
              };
            }

            return {
              warehouse: {
                id: warehouse.id,
                name: warehouse.name,
                address: warehouse.address,
              },
            };
          },
        ),
    }),

    deleteWarehouse: tool({
      description:
        'Soft-delete an active warehouse. Use this tool only when the user explicitly and clearly asks to delete a warehouse. The warehouse ID must identify the intended warehouse. This operation is destructive and requires user confirmation.',
      inputSchema: z.object({
        warehouseId: z.number().int().positive(),
      }),
      needsApproval: true,
      execute: ({ warehouseId }) =>
        runTool(
          'deleteWarehouse',
          'Warehouse could not be deleted.',
          async () => {
            const warehouse = await deleteWarehouse(companyId, warehouseId);

            if (!warehouse) {
              return {
                deleted: false,
                reason: 'Warehouse not found.',
              };
            }

            return {
              deleted: true,
              warehouse: {
                id: warehouse.id,
                name: warehouse.name,
                isActive: warehouse.isActive,
              },
            };
          },
        ),
    }),

    findWarehouses: tool({
      description:
        'Find active warehouses by name in the current company. Use this tool when the user refers to a warehouse by name instead of numeric ID, especially before checking stock, creating invoices, or creating stock adjustments. The search is case-insensitive and may return multiple matches. If multiple warehouses match, do not guess which one the user means; use the available results to clarify the intended warehouse.',
      inputSchema: z.object({
        query: z.string().trim().min(1).max(100),
      }),
      execute: ({ query }) =>
        runTool(
          'findWarehouses',
          'Warehouses could not be found.',
          async () => {
            const warehouses = await findWarehouses(companyId, query);

            return warehouses.map((warehouse) => ({
              id: warehouse.id,
              name: warehouse.name,
              address: warehouse.address,
            }));
          },
        ),
    }),
  };
}
