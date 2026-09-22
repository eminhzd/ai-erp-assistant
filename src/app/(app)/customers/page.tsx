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

const customers = [
  {
    id: 1,
    name: 'Baku Market',
    email: 'contact@bakumarket.az',
    phone: '+994 50 123 45 67',
    invoices: 24,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Fresh Foods',
    email: 'info@freshfoods.az',
    phone: '+994 51 234 56 78',
    invoices: 18,
    status: 'Active',
  },
  {
    id: 3,
    name: 'City Store',
    email: 'hello@citystore.az',
    phone: '+994 55 345 67 89',
    invoices: 11,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Green Market',
    email: 'contact@greenmarket.az',
    phone: '+994 70 456 78 90',
    invoices: 7,
    status: 'Inactive',
  },
  {
    id: 5,
    name: 'Food Corner',
    email: 'info@foodcorner.az',
    phone: '+994 77 567 89 01',
    invoices: 15,
    status: 'Active',
  },
];

export default function CustomersPage() {
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

          <Button>
            <Plus />
            Add Customer
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

                  <Input placeholder="Search customers..." className="pl-9" />
                </div>

                <Button variant="outline">Filters</Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Invoices</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {customers.map((customer) => (
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
                              customer.status === 'Active'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {customer.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontal />
                            <span className="sr-only">Customer actions</span>
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
