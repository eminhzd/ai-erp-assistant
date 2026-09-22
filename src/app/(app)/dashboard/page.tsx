// src/app/(app)/dashboard/page.tsx

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  CircleDollarSign,
  Package,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  {
    title: 'Total Sales',
    value: '$24,580',
    description: '12% from last month',
    icon: CircleDollarSign,
  },
  {
    title: 'Purchases',
    value: '$18,320',
    description: '8% from last month',
    icon: ArrowDownToLine,
  },
  {
    title: 'Products',
    value: '128',
    description: '6 low in stock',
    icon: Package,
  },
  {
    title: 'Customers',
    value: '46',
    description: '4 new this month',
    icon: Users,
  },
];

const lowStockProducts = [
  {
    name: 'Coca-Cola 0.5L',
    sku: 'CC-05',
    stock: 3,
  },
  {
    name: 'Pepsi 0.5L',
    sku: 'PP-05',
    stock: 5,
  },
  {
    name: 'Red Bull 250ml',
    sku: 'RB-25',
    stock: 7,
  },
  {
    name: 'Fanta Orange 0.5L',
    sku: 'FA-05',
    stock: 8,
  },
];

const recentInvoices = [
  {
    id: '#1042',
    customer: 'Baku Market',
    amount: '$1,250',
    status: 'ISSUED',
  },
  {
    id: '#1041',
    customer: 'Fresh Foods',
    amount: '$830',
    status: 'PAID',
  },
  {
    id: '#1040',
    customer: 'City Store',
    amount: '$420',
    status: 'ISSUED',
  },
  {
    id: '#1039',
    customer: 'Green Market',
    amount: '$1,840',
    status: 'PAID',
  },
];

const recentActivity = [
  {
    title: 'Sale invoice #1042 created',
    description: 'Baku Market · $1,250',
    time: '10 min ago',
    icon: ArrowUpFromLine,
  },
  {
    title: 'Purchase invoice #823 created',
    description: 'Food Supplier LLC · $2,400',
    time: '32 min ago',
    icon: ArrowDownToLine,
  },
  {
    title: 'Stock adjusted',
    description: 'Coca-Cola 0.5L · +20',
    time: '1 hour ago',
    icon: Boxes,
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Overview of your ERP activity.
          </p>
        </div>

        {/* Stats */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    {stat.title}
                  </CardTitle>

                  <Icon className="text-muted-foreground size-4" />
                </CardHeader>

                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>

                  <p className="text-muted-foreground mt-1 text-xs">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main content */}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Low stock */}

          <Card>
            <CardHeader>
              <CardTitle>Low Stock</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.sku}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {product.name}
                      </p>

                      <p className="text-muted-foreground text-xs">
                        SKU: {product.sku}
                      </p>
                    </div>

                    <Badge variant="destructive">{product.stock} left</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent activity */}

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-5">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;

                  return (
                    <div
                      key={activity.title}
                      className="flex items-start gap-3"
                    >
                      <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full">
                        <Icon className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>

                        <p className="text-muted-foreground text-xs">
                          {activity.description}
                        </p>
                      </div>

                      <span className="text-muted-foreground shrink-0 text-xs">
                        {activity.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent invoices */}

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="text-sm font-medium">{invoice.id}</span>

                    <span className="text-muted-foreground truncate text-sm">
                      {invoice.customer}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-medium">
                      {invoice.amount}
                    </span>

                    <Badge
                      variant={
                        invoice.status === 'PAID' ? 'default' : 'secondary'
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
