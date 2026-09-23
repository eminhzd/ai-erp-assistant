import { db } from '@/prisma/db';

import type { DbTransaction } from '@/prisma/types';
type InvoiceSequenceType = 'SALES' | 'PURCHASE';

export async function reserveInvoiceNumber(
  companyId: number,
  type: InvoiceSequenceType,
  tx: DbTransaction,
): Promise<number> {
  const query = db.raw.sql`
      UPDATE "invoiceSequence"
      SET "nextNumber" = "nextNumber" + 1
      WHERE "companyId" = ${companyId}
        AND "type" = ${type}
      RETURNING "nextNumber" - 1 AS "number"
    `
    .returnsRow({
      number: db.sql.public.invoiceSequence.columns.nextNumber,
    })
    .build();

  const [row] = await tx.query(query);

  if (!row) {
    throw new Error(
      `Invoice sequence not found for company ${companyId} and type ${type}`,
    );
  }

  return row.number;
}
