// app/dashboard/customers/[id]/components/customer-order-history.tsx
import Link from "next/link";
import { format } from "date-fns";
import { Search, Calendar, MapPin, Package, ChevronRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderHistoryProps {
  orders: Array<{
    id: string;
    orderNumber: string;
    date: Date;
    status: string;
    paymentStatus: string;
    total: number;
    location: {
      id: string;
      name: string;
    };
    lines: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      total: number;
      item: {
        id: string;
        name: string;
        sku: string;
      };
    }>;
  }>;
  getOrderStatusBadge: (status: string) => React.ReactElement;
  getPaymentStatusBadge: (status: string) => React.ReactElement;
  formatCurrency: (amount: number) => string;
}

export default function CustomerOrderHistory({
  orders,
  getOrderStatusBadge,
  getPaymentStatusBadge,
  formatCurrency,
}: OrderHistoryProps) {
  // Format date function
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMM dd, yyyy");
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            This customer doesn't have any orders yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No orders found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This customer hasn't placed any orders yet.
            </p>
            <Button className="mt-4" asChild>
              <Link
                href={`/dashboard/sales/orders/new?customerId=${orders[0]?.id}`}
              >
                Create New Order
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0">Order History</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8 w-[250px]"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/sales/orders/${order.id}`}
                      className="text-primary hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(order.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                      {order.location.name}
                    </div>
                  </TableCell>
                  <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {order.lines.length}{" "}
                      {order.lines.length === 1 ? "item" : "items"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/sales/orders/${order.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
