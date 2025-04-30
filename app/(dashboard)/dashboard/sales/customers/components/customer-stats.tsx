// app/dashboard/customers/[id]/components/customer-stats.tsx
import { DollarSign, ShoppingBag, CreditCard, AlertCircle } from "lucide-react";

interface CustomerStatsProps {
  stats: {
    totalOrders: number;
    totalSpent: number;
    completedOrders: number;
    cancelledOrders: number;
    pendingPayment: number;
  };
  statusCounts: {
    statusCounts: Record<string, number>;
    paymentStatusCounts: Record<string, number>;
  };
}

export default function CustomerStats({
  stats,
  statusCounts,
}: CustomerStatsProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center text-muted-foreground">
            <ShoppingBag className="h-4 w-4 mr-1" />
            Total Orders
          </span>
          <span className="font-medium text-lg">{stats.totalOrders}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-1" />
            Total Spent
          </span>
          <span className="font-medium text-lg">
            {formatCurrency(stats.totalSpent)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-muted-foreground">
            <CreditCard className="h-4 w-4 mr-1" />
            Pending Payment
          </span>
          <span className="font-medium text-lg text-amber-600">
            {formatCurrency(stats.pendingPayment)}
          </span>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-3">Order Status Breakdown</h3>
        <div className="space-y-2">
          {Object.entries(statusCounts.statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}

          {Object.keys(statusCounts.statusCounts).length === 0 && (
            <div className="text-sm text-muted-foreground">
              No order status data available
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-3">Payment Status Breakdown</h3>
        <div className="space-y-2">
          {Object.entries(statusCounts.paymentStatusCounts).map(
            ([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </span>
                <span className="text-sm font-medium">{count}</span>
              </div>
            )
          )}

          {Object.keys(statusCounts.paymentStatusCounts).length === 0 && (
            <div className="text-sm text-muted-foreground">
              No payment status data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
