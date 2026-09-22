import { auth } from '@/auth';
import { redirect } from 'next/navigation';

import { getWarehouseStocksByCompanyId } from '@/server/warehouse-stock/warehouse-stock.service';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function InventoryPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const companyId = session.user.companyId;
  const stocks = await getWarehouseStocksByCompanyId(companyId);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>

          <p className="text-muted-foreground text-sm">
            Current stock levels across your warehouses.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {stocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No inventory found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stocks.map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell className="font-medium">
                          {stock.product.name}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {stock.product.sku}
                        </TableCell>

                        <TableCell>{stock.warehouse.name}</TableCell>

                        <TableCell>{stock.quantity}</TableCell>

                        <TableCell className="text-muted-foreground">
                          {stock.product.unit}
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
