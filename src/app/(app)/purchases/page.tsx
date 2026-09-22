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

const purchases = [
  {
    id: 1,
    invoice: 'PUR-1001',
    supplier: 'Food Supplier LLC',
    date: 'Sep 22, 2026',
    items: 14,
    total: '$2,840.00',
    status: 'Issued',
  },
  {
    id: 2,
    invoice: 'PUR-1000',
    supplier: 'Coca-Cola Azerbaijan',
    date: 'Sep 21, 2026',
    items: 8,
    total: '$1,460.50',
    status: 'Paid',
  },
  {
    id: 3,
    invoice: 'PUR-0999',
    supplier: 'Baku Beverage',
    date: 'Sep 20, 2026',
    items: 11,
    total: '$2,175.00',
    status: 'Paid',
  },
  {
    id: 4,
    invoice: 'PUR-0998',
    supplier: 'Azerbaijan Food Import',
    date: 'Sep 19, 2026',
    items: 6,
    total: '$980.25',
    status: 'Issued',
  },
  {
    id: 5,
    invoice: 'PUR-0997',
    supplier: 'Fresh Distribution',
    date: 'Sep 18, 2026',
    items: 10,
    total: '$1,735.00',
    status: 'Paid',
  },
];

export default function PurchasesPage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Purchases</h1>
            <p className="text-muted-foreground text-sm">
              Manage purchase invoices and supplier transactions.
            </p>
          </div>

          <Button>
            <Plus />
            New Purchase
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Invoices</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search invoices or suppliers..."
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
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">
                          {purchase.invoice}
                        </TableCell>

                        <TableCell>{purchase.supplier}</TableCell>

                        <TableCell className="text-muted-foreground">
                          {purchase.date}
                        </TableCell>

                        <TableCell>{purchase.items}</TableCell>

                        <TableCell>{purchase.total}</TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              purchase.status === 'Paid'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {purchase.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontal />
                            <span className="sr-only">Purchase actions</span>
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
