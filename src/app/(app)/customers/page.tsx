import { auth } from '@/auth';
import { redirect } from 'next/navigation';

import { getCustomersByCompanyId } from '@/server/customers/customer.service';

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

export default async function CustomersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const companyId = session.user.companyId;
  const customers = await getCustomersByCompanyId(companyId);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>

            <p className="text-muted-foreground text-sm">
              Manage your customers and their information.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Invoices</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.name}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {customer.email}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {customer.phone}
                        </TableCell>

                        <TableCell>{customer.invoices}</TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              customer.isActive === true
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {customer.isActive ? 'Active' : 'Inactive'}
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
