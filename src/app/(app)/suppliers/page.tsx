import { MoreHorizontal, Plus, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const suppliers = [
  {
    id: 1,
    name: 'Food Supplier LLC',
    email: 'info@foodsupplier.az',
    phone: '+994 50 111 22 33',
    invoices: 32,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Coca-Cola Azerbaijan',
    email: 'sales@coca-cola.az',
    phone: '+994 51 222 33 44',
    invoices: 21,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Baku Beverage',
    email: 'contact@bakubeverage.az',
    phone: '+994 55 333 44 55',
    invoices: 16,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Azerbaijan Food Import',
    email: 'info@afi.az',
    phone: '+994 70 444 55 66',
    invoices: 9,
    status: 'Inactive',
  },
  {
    id: 5,
    name: 'Fresh Distribution',
    email: 'hello@freshdistribution.az',
    phone: '+994 77 555 66 77',
    invoices: 14,
    status: 'Active',
  },
];

export default function SuppliersPage() {
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

          <Button>
            <Plus />
            Add Supplier
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suppliers</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

                  <Input placeholder="Search suppliers..." className="pl-9" />
                </div>

                <Button variant="outline">Filters</Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Invoices</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {suppliers.map((supplier) => (
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
                              supplier.status === 'Active'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {supplier.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontal />
                            <span className="sr-only">Supplier actions</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
