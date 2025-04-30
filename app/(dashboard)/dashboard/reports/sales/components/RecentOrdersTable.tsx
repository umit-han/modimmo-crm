// components/reports/sales/RecentOrdersTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { SalesOrderStatus, PaymentStatus } from "@prisma/client";

interface RecentOrdersTableProps {
  orders: Array<{
    id: string;
    orderNumber: string;
    date: Date;
    total: number;
    status: SalesOrderStatus;
    paymentStatus: PaymentStatus;
    customer: {
      id: string;
      name: string;
    } | null;
  }>;
}

// Map status to badge variants
const statusVariants: Record<string, string> = {
  DRAFT: "secondary",
  CONFIRMED: "primary",
  PROCESSING: "primary",
  SHIPPED: "warning",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "destructive",
  RETURNED: "destructive",
};

// Map payment status to badge variants
const paymentStatusVariants: Record<string, string> = {
  PENDING: "warning",
  PARTIAL: "warning",
  PAID: "success",
  REFUNDED: "destructive",
};

// Map status to human-readable labels
const statusLabels: Record<SalesOrderStatus, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

// Map payment status to human-readable labels
const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PARTIAL: "Partial",
  PAID: "Paid",
  REFUNDED: "Refunded",
};

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-4 text-muted-foreground"
              >
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.orderNumber}
                </TableCell>
                <TableCell>
                  {format(new Date(order.date), "dd MMM yyyy")}
                </TableCell>
                <TableCell>{order.customer?.name || "N/A"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      statusVariants[order.status] as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                        | "success"
                        | "warning"
                    }
                  >
                    {statusLabels[order.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      paymentStatusVariants[order.paymentStatus] as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                        | "success"
                        | "warning"
                    }
                  >
                    {paymentStatusLabels[order.paymentStatus]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(order.total)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
