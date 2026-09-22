import { auth } from '@/auth';
import { redirect } from 'next/navigation';

import { getSalesInvoicesByCompanyId } from '@/server/sales-invoice/sales-invoice.service';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function SalesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const companyId = session.user.companyId;
  const invoices = await getSalesInvoicesByCompanyId(companyId);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales</h1>

          <p className="text-muted-foreground text-sm">
            Sales invoices and customer transactions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Invoices</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No sales invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>

                        <TableCell>{invoice.customer.name}</TableCell>

                        <TableCell className="text-muted-foreground">
                          {invoice.createdAt.toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </TableCell>

                        <TableCell>{invoice.itemsCount}</TableCell>

                        <TableCell>
                          {invoice.total} {invoice.currency}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === 'PAID'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
