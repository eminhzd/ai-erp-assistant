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

const products = [
  {
    id: 1,
    name: 'Coca-Cola 0.5L',
    sku: 'CC-05',
    category: 'Drinks',
    price: '$1.20',
    stock: 124,
    status: 'In Stock',
  },
  {
    id: 2,
    name: 'Pepsi 0.5L',
    sku: 'PP-05',
    category: 'Drinks',
    price: '$1.10',
    stock: 86,
    status: 'In Stock',
  },
  {
    id: 3,
    name: 'Red Bull 250ml',
    sku: 'RB-25',
    category: 'Energy Drinks',
    price: '$2.40',
    stock: 7,
    status: 'Low Stock',
  },
  {
    id: 4,
    name: 'Fanta Orange 0.5L',
    sku: 'FA-05',
    category: 'Drinks',
    price: '$1.15',
    stock: 8,
    status: 'Low Stock',
  },
  {
    id: 5,
    name: 'Lay’s Classic 150g',
    sku: 'LY-15',
    category: 'Snacks',
    price: '$2.10',
    stock: 52,
    status: 'In Stock',
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Products</h1>

            <p className="text-muted-foreground text-sm">
              Manage your products, pricing, and inventory.
            </p>
          </div>

          <Button>
            <Plus />
            Add Product
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

                  <Input placeholder="Search products..." className="pl-9" />
                </div>

                <Button variant="outline">Filters</Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {product.sku}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {product.category}
                        </TableCell>

                        <TableCell>{product.price}</TableCell>

                        <TableCell>{product.stock}</TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              product.status === 'Low Stock'
                                ? 'destructive'
                                : 'default'
                            }
                          >
                            {product.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontal />
                            <span className="sr-only">Product actions</span>
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
