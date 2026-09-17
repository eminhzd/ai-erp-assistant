import { tool } from 'ai';

import * as z from 'zod';

import {
  createProduct,
  getProductById,
  getProductsByCompanyId,
  updateProduct,
  deleteProduct,
  findProducts,
} from '@/server/products/product.service';

import { decimalStringSchema, runTool } from '@/lib/utils';

export function createProductTools(companyId: number) {
  return {
    listProducts: tool({
      description:
        'List all active products for the current company. Use this tool when the user explicitly asks to list or show the products available in the company.',
      inputSchema: z.object({}),
      execute: () =>
        runTool(
          'listProducts',
          'Products could not be retrieved.',
          async () => {
            const products = await getProductsByCompanyId(companyId);

            return products.map((product) => ({
              id: product.id,
              name: product.name,
              description: product.description,
              sku: product.sku,
              unit: product.unit,
              salePrice: product.salePrice,
              purchasePrice: product.purchasePrice,
            }));
          },
        ),
    }),

    getProduct: tool({
      description:
        'Get one active product by numeric product ID. Use this tool when the user wants to inspect a specific product and the product ID is known or has been resolved from a current product search. Do not guess the ID.',
      inputSchema: z.object({
        productId: z.number().int().positive(),
      }),
      execute: ({ productId }) =>
        runTool('getProduct', 'Product could not be retrieved.', async () => {
          const product = await getProductById(companyId, productId);

          if (!product) {
            return { found: false };
          }

          return {
            found: true,
            product: {
              id: product.id,
              name: product.name,
              description: product.description,
              sku: product.sku,
              unit: product.unit,
              salePrice: product.salePrice,
              purchasePrice: product.purchasePrice,
            },
          };
        }),
    }),

    createProduct: tool({
      description:
        'Create a new product for the current company. Use this tool only when the user explicitly asks to create a product. The name, SKU, sale price, and purchase price are required. Description and unit are optional. Do not invent the SKU, prices, or other missing product information.',
      inputSchema: z.object({
        name: z.string().trim().min(1).max(100),
        description: z.string().trim().max(500).optional(),
        sku: z.string().trim().min(1).max(100),
        unit: z.string().trim().min(1).max(50).optional(),
        salePrice: decimalStringSchema,
        purchasePrice: decimalStringSchema,
      }),
      execute: (productData) =>
        runTool(
          'createProduct',
          'Product could not be created. A product with this SKU may already exist.',
          async () => {
            const product = await createProduct(companyId, productData);

            return {
              product: {
                id: product.id,
                name: product.name,
                sku: product.sku,
                unit: product.unit,
                salePrice: product.salePrice,
                purchasePrice: product.purchasePrice,
              },
            };
          },
        ),
    }),

    updateProduct: tool({
      description:
        'Update an existing active product. Use this tool only when the user explicitly asks to change product data. The product ID must identify the intended product. Only update fields explicitly provided by the user; do not overwrite unspecified fields or invent values such as SKU, prices, or unit.',
      inputSchema: z
        .object({
          productId: z.number().int().positive(),
          name: z.string().trim().min(1).max(100).optional(),
          description: z.string().trim().max(500).optional(),
          sku: z.string().trim().min(1).max(100).optional(),
          unit: z.string().trim().min(1).max(50).optional(),
          salePrice: decimalStringSchema.optional(),
          purchasePrice: decimalStringSchema.optional(),
        })
        .refine(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ productId: _, ...productData }) =>
            Object.values(productData).some((value) => value !== undefined),
          { message: 'At least one product field must be provided' },
        ),
      execute: ({ productId, ...productData }) =>
        runTool('updateProduct', 'Product could not be updated.', async () => {
          const product = await updateProduct(
            companyId,
            productId,
            productData,
          );

          if (!product) {
            return {
              updated: false,
              reason: 'Product not found.',
            };
          }

          return {
            product: {
              id: product.id,
              name: product.name,
              description: product.description,
              sku: product.sku,
              unit: product.unit,
              salePrice: product.salePrice,
              purchasePrice: product.purchasePrice,
            },
          };
        }),
    }),

    deleteProduct: tool({
      description:
        'Soft-delete an active product. Use this tool only when the user explicitly and clearly asks to delete a product. The product ID must identify the intended product. This operation is destructive and should not be performed based on an indirect request, suggestion, or old conversation context.',
      inputSchema: z.object({
        productId: z.number().int().positive(),
      }),
      execute: ({ productId }) =>
        runTool('deleteProduct', 'Product could not be deleted.', async () => {
          const product = await deleteProduct(companyId, productId);

          if (!product) {
            return {
              deleted: false,
              reason: 'Product not found.',
            };
          }

          return {
            deleted: true,
            product: {
              id: product.id,
              name: product.name,
              sku: product.sku,
              isActive: product.isActive,
            },
          };
        }),
    }),

    findProducts: tool({
      description:
        'Find active products by name or SKU in the current company. Use this tool when the user refers to a product by name or SKU instead of numeric ID, especially before creating invoices, checking stock, or creating stock adjustments. The search is case-insensitive and may return multiple matches. If multiple products match, do not guess which one the user means; use the available results to clarify the intended product.',
      inputSchema: z.object({
        query: z.string().trim().min(1).max(100),
      }),
      execute: ({ query }) =>
        runTool('findProducts', 'Products could not be found.', async () => {
          const products = await findProducts(companyId, query);

          return products.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            sku: product.sku,
            unit: product.unit,
            salePrice: product.salePrice,
            purchasePrice: product.purchasePrice,
          }));
        }),
    }),
  };
}
