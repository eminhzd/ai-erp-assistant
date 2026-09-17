import { tool } from 'ai';
import * as z from 'zod';

import { getSalesInvoiceItemsByInvoiceId } from '@/server/sales-invoice-items/sales-invoice-items.service';

import { runTool } from '@/lib/utils';

export function createSalesInvoiceItemTools(companyId: number) {
  return {
    getSalesInvoiceItems: tool({
      description:
        'Get all items belonging to a specific sales invoice. Use this when the user asks what products, quantities, or prices are included in a sales invoice. The invoice ID must be known from current tool results. Do not guess the ID.',

      inputSchema: z.object({
        invoiceId: z.number().int().positive(),
      }),

      execute: ({ invoiceId }) =>
        runTool(
          'getSalesInvoiceItems',
          'Sales invoice items could not be retrieved.',
          async () => {
            const items = await getSalesInvoiceItemsByInvoiceId(
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
