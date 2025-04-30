"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Define types based on your Prisma schema
type SalesOrder = {
  id: string;
  orderNumber: string;
  date: Date;
  customer: {
    name: string;
  } | null;
  status:
    | "DRAFT"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "RETURNED";
  paymentStatus: "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";
  total: number;
};

interface SalesOrderListProps {
  salesOrders: SalesOrder[];
  selectedOrderId: string | null;
  onSelect: (id: string) => void;
}

export function SalesOrderList({
  salesOrders,
  selectedOrderId,
  onSelect,
}: SalesOrderListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = salesOrders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer?.name &&
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Function to get status badge styling
  const getStatusBadge = (status: SalesOrder["status"]) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "CONFIRMED":
        return <Badge variant="info">Confirmed</Badge>;
      case "PROCESSING":
        return <Badge variant="warning">Processing</Badge>;
      case "SHIPPED":
        return <Badge variant="secondary">Shipped</Badge>;
      case "DELIVERED":
        return <Badge variant="default">Delivered</Badge>;
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "RETURNED":
        return <Badge variant="destructive">Returned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Function to get payment status badge
  const getPaymentStatusBadge = (status: SalesOrder["paymentStatus"]) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      case "PARTIAL":
        return <Badge variant="warning">Partial</Badge>;
      case "PAID":
        return <Badge variant="success">Paid</Badge>;
      case "REFUNDED":
        return <Badge variant="info">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search order # or customer..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredOrders.length > 0 ? (
          <div className="divide-y">
            {filteredOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => onSelect(order.id)}
                className={cn(
                  "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
                  "focus:outline-none focus:bg-muted/50",
                  selectedOrderId === order.id && "bg-muted"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-primary">
                    {order.orderNumber}
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(order.total)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {order.customer?.name || "No Customer"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(order.date), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div>{getStatusBadge(order.status)}</div>
                  {/* <div>{getPaymentStatusBadge(order.paymentStatus)}</div> */}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
            No sales orders found
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
