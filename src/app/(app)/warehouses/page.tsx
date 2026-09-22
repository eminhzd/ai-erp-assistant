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

const warehouses = [
  {
    id: 1,
    name: 'Main Warehouse',
    location: 'Baku, Azerbaijan',
    products: 128,
    units: 4820,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Central Storage',
    location: 'Baku, Azerbaijan',
    products: 86,
    units: 2740,
    status: 'Active',
  },
  {
    id: 3,
    name: 'North Warehouse',
    location: 'Sumqayit, Azerbaijan',
    products: 54,
    units: 1680,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Backup Warehouse',
    location: 'Baku, Azerbaijan',
    products: 31,
    units: 920,
    status: 'Inactive',
  },
  {
    id: 5,
    name: 'Small Storage',
    location: 'Baku, Azerbaijan',
    products: 18,
    units: 340,
    status: 'Active',
  },
];

export default function WarehousesPage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Warehouses
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your warehouses and inventory locations.
            </p>
          </div>

          <Button>
            <Plus />
            Add Warehouse
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Warehouses</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input placeholder="Search warehouses..." className="pl-9" />
                </div>

                <Button variant="outline">Filters</Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {warehouses.map((warehouse) => (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">
                          {warehouse.name}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {warehouse.location}
                        </TableCell>

                        <TableCell>{warehouse.products}</TableCell>

                        <TableCell>
                          {warehouse.units.toLocaleString()}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              warehouse.status === 'Active'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {warehouse.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontal />
                            <span className="sr-only">Warehouse actions</span>
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
