// components/reports/sales/SalesSummaryCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid } from "@/components/ui/grid";
import { DollarSign, ShoppingBag, Package, CreditCard } from "lucide-react";
import { SalesOrderStatus, PaymentStatus } from "@/types/enums";

interface SalesSummaryCardsProps {
  stats: {
    totalSalesRevenue: number;
    totalOrders: number;
    totalItemsSold: number;
    orderCounts: Array<{
      status: SalesOrderStatus;
      _count: { id: number };
    }>;
    paymentStatusDistribution: Array<{
      paymentStatus: PaymentStatus;
      _count: { id: number };
      _sum: { total: number | null };
    }>;
  };
}

export function SalesSummaryCards({ stats }: SalesSummaryCardsProps) {
  // Calculate paid orders and amount
  const paidOrders = stats.paymentStatusDistribution.find(
    (p) => p.paymentStatus === PaymentStatus.PAID
  );

  const paidAmount = paidOrders?._sum.total || 0;
  const paidOrdersCount = paidOrders?._count.id || 0;

  // Calculate payment rate
  const paymentRate =
    stats.totalOrders > 0
      ? ((paidOrdersCount / stats.totalOrders) * 100).toFixed(1)
      : "0";

  // Get completed orders
  const completedOrders =
    stats.orderCounts.find((o) => o.status === SalesOrderStatus.COMPLETED)
      ?._count.id || 0;

  // Calculate completion rate
  const completionRate =
    stats.totalOrders > 0
      ? ((completedOrders / stats.totalOrders) * 100).toFixed(1)
      : "0";

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Grid columns={4} gap={6} className="mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(stats.totalSalesRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {paymentRate}% payment rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {stats.totalItemsSold.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Avg.{" "}
            {stats.totalOrders > 0
              ? (stats.totalItemsSold / stats.totalOrders).toFixed(1)
              : 0}{" "}
            items per order
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Order Value
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(
              stats.totalOrders > 0
                ? stats.totalSalesRevenue / stats.totalOrders
                : 0
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Per completed order
          </p>
        </CardContent>
      </Card>
    </Grid>
  );
}
