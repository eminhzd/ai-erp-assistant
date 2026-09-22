import { auth } from '@/auth';
import { redirect } from 'next/navigation';

import { getProductsByCompanyId } from '@/server/products/product.service';

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

export default async function ProductsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const companyId = session.user.companyId;
  const products = await getProductsByCompanyId(companyId);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>

          <p className="text-muted-foreground text-sm">
            Manage your products, pricing, and inventory.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {product.sku}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {product.unit}
                        </TableCell>

                        <TableCell>{product.salePrice}</TableCell>

                        <TableCell>{product.purchasePrice}</TableCell>

                        <TableCell>
                          <Badge
                            variant={product.isActive ? 'default' : 'secondary'}
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
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
