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

const sales = [
  {
    id: 1,
    invoice: 'INV-1001',
    customer: 'Baku Market',
    date: 'Sep 22, 2026',
    items: 8,
    total: '$1,248.50',
    status: 'Issued',
  },
  {
    id: 2,
    invoice: 'INV-1000',
    customer: 'Fresh Foods',
    date: 'Sep 21, 2026',
    items: 5,
    total: '$842.00',
    status: 'Paid',
  },
  {
    id: 3,
    invoice: 'INV-0999',
    customer: 'City Store',
    date: 'Sep 20, 2026',
    items: 12,
    total: '$2,156.75',
    status: 'Paid',
  },
  {
    id: 4,
    invoice: 'INV-0998',
    customer: 'Green Market',
    date: 'Sep 19, 2026',
    items: 4,
    total: '$436.20',
    status: 'Issued',
  },
  {
    id: 5,
    invoice: 'INV-0997',
    customer: 'Food Corner',
    date: 'Sep 18, 2026',
    items: 9,
    total: '$1,524.00',
    status: 'Paid',
  },
];

export default function SalesPage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Sales</h1>
            <p className="text-muted-foreground text-sm">
              Manage sales invoices and customer transactions.
            </p>
          </div>

          <Button>
            <Plus />
            New Sale
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Invoices</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search invoices or customers..."
                    className="pl-9"
                  />
                </div>

                <Button variant="outline">Filters</Button>
              </div>

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
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">
                          {sale.invoice}
                        </TableCell>

                        <TableCell>{sale.customer}</TableCell>

                        <TableCell className="text-muted-foreground">
                          {sale.date}
                        </TableCell>

                        <TableCell>{sale.items}</TableCell>

                        <TableCell>{sale.total}</TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              sale.status === 'Paid' ? 'default' : 'secondary'
                            }
                          >
                            {sale.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontal />
                            <span className="sr-only">Sale actions</span>
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
