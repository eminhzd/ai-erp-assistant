import { tool } from 'ai';
import * as z from 'zod';

import {
  createCustomer,
  getCustomerById,
  getCustomersByCompanyId,
  updateCustomer,
  deleteCustomer,
  findCustomers,
} from '@/server/customers/customer.service';

import { runTool } from '@/lib/utils';

export function createCustomerTools(companyId: number) {
  return {
    listCustomers: tool({
      description:
        'List all active customers for the current company. Use this tool when the user explicitly asks to list or show the customers available in the company.',
      inputSchema: z.object({}),
      execute: () =>
        runTool(
          'listCustomers',
          'Customers could not be retrieved.',
          async () => {
            const customers = await getCustomersByCompanyId(companyId);

            return customers.map((customer) => ({
              id: customer.id,
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
              taxId: customer.taxId,
            }));
          },
        ),
    }),

    getCustomer: tool({
      description:
        'Get one active customer by numeric customer ID. Use this tool when the user wants to inspect a specific customer and the customer ID is known or has been resolved from a current customer search. Do not guess the ID.',
      inputSchema: z.object({
        customerId: z.number().int().positive(),
      }),
      execute: ({ customerId }) =>
        runTool('getCustomer', 'Customer could not be retrieved.', async () => {
          const customer = await getCustomerById(companyId, customerId);

          if (!customer) {
            return { found: false };
          }

          return {
            found: true,
            customer: {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
              taxId: customer.taxId,
            },
          };
        }),
    }),

    createCustomer: tool({
      description:
        'Create a new customer for the current company. Use this tool only when the user explicitly asks to create a customer. The customer name is required; email, phone, address, and tax ID are optional. Do not call this tool if required information is missing. Do not create a customer based only on a suggestion or mention in conversation.',
      inputSchema: z.object({
        name: z.string().trim().min(1).max(100),
        email: z.email().trim().max(100).optional(),
        phone: z.string().trim().min(5).max(15).optional(),
        address: z.string().trim().min(1).max(100).optional(),
        taxId: z.string().trim().min(1).max(100).optional(),
      }),
      execute: (customerData) =>
        runTool(
          'createCustomer',
          'Customer could not be created. A customer with this name may already exist.',
          async () => {
            const customer = await createCustomer(companyId, customerData);

            return {
              customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
              },
            };
          },
        ),
    }),

    updateCustomer: tool({
      description:
        'Update an existing active customer. Use this tool only when the user explicitly asks to change customer data. The customer ID must identify the intended customer. Only update fields explicitly provided by the user; do not overwrite unspecified fields or invent new values.',
      inputSchema: z
        .object({
          customerId: z.number().int().positive(),
          name: z.string().trim().min(1).max(100).optional(),
          email: z.email().trim().max(100).optional(),
          phone: z.string().trim().min(5).max(15).optional(),
          address: z.string().trim().min(1).max(100).optional(),
          taxId: z.string().trim().min(1).max(100).optional(),
        })
        .refine(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ customerId: _, ...customerData }) =>
            Object.values(customerData).some((value) => value !== undefined),
          { message: 'At least one customer field must be provided' },
        ),
      execute: ({ customerId, ...customerData }) =>
        runTool(
          'updateCustomer',
          'Customer could not be updated.',
          async () => {
            const customer = await updateCustomer(
              companyId,
              customerId,
              customerData,
            );

            if (!customer) {
              return {
                updated: false,
                reason: 'Customer not found.',
              };
            }

            return {
              customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                taxId: customer.taxId,
              },
            };
          },
        ),
    }),

    deleteCustomer: tool({
      description:
        'Soft-delete an active customer. Use this tool only when the user explicitly and clearly asks to delete a customer. The customer ID must identify the intended customer. This operation is destructive and should not be performed based on an indirect request, suggestion, or old conversation context.',
      inputSchema: z.object({
        customerId: z.number().int().positive(),
      }),
      execute: ({ customerId }) =>
        runTool(
          'deleteCustomer',
          'Customer could not be deleted.',
          async () => {
            const customer = await deleteCustomer(companyId, customerId);

            if (!customer) {
              return {
                deleted: false,
                reason: 'Customer not found.',
              };
            }

            return {
              deleted: true,
              customer: {
                id: customer.id,
                name: customer.name,
                isActive: customer.isActive,
              },
            };
          },
        ),
    }),

    findCustomers: tool({
      description:
        'Find active customers by name in the current company. Use this tool when the user refers to a customer by name instead of numeric ID, especially before creating or updating invoices or when another tool requires a customer ID. The search is case-insensitive and may return multiple matches. If multiple customers match, do not guess which one the user means; use the available results to clarify the intended customer.',
      inputSchema: z.object({
        query: z.string().trim().min(1).max(100),
      }),
      execute: ({ query }) =>
        runTool('findCustomers', 'Customers could not be found.', async () => {
          const customers = await findCustomers(companyId, query);

          return customers.map((customer) => ({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            taxId: customer.taxId,
          }));
        }),
    }),
  };
}
