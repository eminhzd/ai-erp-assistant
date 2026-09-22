import { auth } from '@/auth';
import { redirect } from 'next/navigation';

import { getSuppliersByCompanyId } from '@/server/suppliers/supplier.service';

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

export default async function SuppliersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const companyId = session.user.companyId;
  const suppliers = await getSuppliersByCompanyId(companyId);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>

            <p className="text-muted-foreground text-sm">
              Manage your suppliers and their information.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suppliers</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Invoices</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">
                          {supplier.name}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {supplier.email}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {supplier.phone}
                        </TableCell>

                        <TableCell>{supplier.invoices}</TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              supplier.isActive === true
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {supplier.isActive ? 'Active' : 'Inactive'}
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
