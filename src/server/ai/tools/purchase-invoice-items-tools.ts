import { tool } from 'ai';
import * as z from 'zod';

import { getPurchaseInvoiceItemsByInvoiceId } from '@/server/purchase-invoice-items/purchase-invoice-items.service';

import { runTool } from '@/lib/utils';

export function createPurchaseInvoiceItemTools(companyId: number) {
  return {
    getPurchaseInvoiceItems: tool({
      description:
        'Get all items belonging to a specific purchase invoice. Use this when the user asks what products, quantities, or prices are included in a purchase invoice. The invoice ID must be known from current tool results. Do not guess the ID.',

      inputSchema: z.object({
        invoiceId: z.number().int().positive(),
      }),

      execute: ({ invoiceId }) =>
        runTool(
          'getPurchaseInvoiceItems',
          'Purchase invoice items could not be retrieved.',
          async () => {
            const items = await getPurchaseInvoiceItemsByInvoiceId(
              companyId,
              invoiceId,
            );

            return items.map((item) => ({
              id: item.id,
              invoiceId: item.invoiceId,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            }));
          },
        ),
    }),
  };
}
