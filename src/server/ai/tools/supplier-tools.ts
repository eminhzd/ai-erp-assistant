import { tool } from 'ai';

import * as z from 'zod';

import {
  createSupplier,
  getSupplierById,
  getSuppliersByCompanyId,
  updateSupplier,
  deleteSupplier,
  findSuppliers,
} from '@/server/suppliers/supplier.service';

import { runTool } from '@/lib/utils';

export function createSupplierTools(companyId: number) {
  return {
    listSuppliers: tool({
      description:
        'List all active suppliers for the current company. Use this tool when the user explicitly asks to list or show the suppliers available in the company.',
      inputSchema: z.object({}),
      execute: () =>
        runTool(
          'listSuppliers',
          'Suppliers could not be retrieved.',
          async () => {
            const suppliers = await getSuppliersByCompanyId(companyId);

            return suppliers.map((supplier) => ({
              id: supplier.id,
              name: supplier.name,
              email: supplier.email,
              phone: supplier.phone,
              address: supplier.address,
              taxId: supplier.taxId,
            }));
          },
        ),
    }),

    getSupplier: tool({
      description:
        'Get one active supplier by numeric supplier ID. Use this tool when the user wants to inspect a specific supplier and the supplier ID is known or has been resolved from a current supplier search. Do not guess the ID.',
      inputSchema: z.object({
        supplierId: z.number().int().positive(),
      }),
      execute: ({ supplierId }) =>
        runTool('getSupplier', 'Supplier could not be retrieved.', async () => {
          const supplier = await getSupplierById(companyId, supplierId);

          if (!supplier) {
            return { found: false };
          }

          return {
            found: true,
            supplier: {
              id: supplier.id,
              name: supplier.name,
              email: supplier.email,
              phone: supplier.phone,
              address: supplier.address,
              taxId: supplier.taxId,
            },
          };
        }),
    }),

    createSupplier: tool({
      description:
        'Create a new supplier for the current company. Use this tool only when the user explicitly asks to create a supplier. The supplier name is required; email, phone, address, and tax ID are optional. Do not call this tool if required information is missing. Do not create a supplier based only on a suggestion or mention in conversation.',
      inputSchema: z.object({
        name: z.string().trim().min(1).max(100),
        email: z.email().trim().max(100).optional(),
        phone: z.string().trim().min(5).max(15).optional(),
        address: z.string().trim().min(1).max(100).optional(),
        taxId: z.string().trim().min(1).max(100).optional(),
      }),
      execute: (supplierData) =>
        runTool(
          'createSupplier',
          'Supplier could not be created. A supplier with this name may already exist.',
          async () => {
            const supplier = await createSupplier(companyId, supplierData);

            return {
              supplier: {
                id: supplier.id,
                name: supplier.name,
                email: supplier.email,
                phone: supplier.phone,
              },
            };
          },
        ),
    }),

    updateSupplier: tool({
      description:
        'Update an existing active supplier. Use this tool only when the user explicitly asks to change supplier data. The supplier ID must identify the intended supplier. Only update fields explicitly provided by the user; do not overwrite unspecified fields or invent new values.',
      inputSchema: z
        .object({
          supplierId: z.number().int().positive(),
          name: z.string().trim().min(1).max(100).optional(),
          email: z.email().trim().max(100).optional(),
          phone: z.string().trim().min(5).max(15).optional(),
          address: z.string().trim().min(1).max(100).optional(),
          taxId: z.string().trim().min(1).max(100).optional(),
        })
        .refine(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ supplierId: _, ...supplierData }) =>
            Object.values(supplierData).some((value) => value !== undefined),
          { message: 'At least one supplier field must be provided' },
        ),
      execute: ({ supplierId, ...supplierData }) =>
        runTool(
          'updateSupplier',
          'Supplier could not be updated.',
          async () => {
            const supplier = await updateSupplier(
              companyId,
              supplierId,
              supplierData,
            );

            if (!supplier) {
              return {
                updated: false,
                reason: 'Supplier not found.',
              };
            }

            return {
              supplier: {
                id: supplier.id,
                name: supplier.name,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
                taxId: supplier.taxId,
              },
            };
          },
        ),
    }),

    deleteSupplier: tool({
      description:
        'Soft-delete an active supplier. Use this tool only when the user explicitly and clearly asks to delete a supplier. The supplier ID must identify the intended supplier. This operation is destructive and requires user confirmation.',
      inputSchema: z.object({
        supplierId: z.number().int().positive(),
      }),
      needsApproval: true,
      execute: ({ supplierId }) =>
        runTool(
          'deleteSupplier',
          'Supplier could not be deleted.',
          async () => {
            const supplier = await deleteSupplier(companyId, supplierId);

            if (!supplier) {
              return {
                deleted: false,
                reason: 'Supplier not found.',
              };
            }

            return {
              deleted: true,
              supplier: {
                id: supplier.id,
                name: supplier.name,
                isActive: supplier.isActive,
              },
            };
          },
        ),
    }),

    findSuppliers: tool({
      description:
        'Find active suppliers by name in the current company. Use this tool when the user refers to a supplier by name instead of numeric ID, especially before creating a purchase invoice or when another tool requires a supplier ID. The search is case-insensitive and may return multiple matches. If multiple suppliers match, do not guess which one the user means; use the available results to clarify the intended supplier.',
      inputSchema: z.object({
        query: z.string().trim().min(1).max(100),
      }),
      execute: ({ query }) =>
        runTool('findSuppliers', 'Suppliers could not be found.', async () => {
          const suppliers = await findSuppliers(companyId, query);

          return suppliers.map((supplier) => ({
            id: supplier.id,
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            taxId: supplier.taxId,
          }));
        }),
    }),
  };
}
