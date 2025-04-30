"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns";

import { Button } from "@/components/ui/button";
import { SalesOrderList } from "./SalesOrderListing";
import { SalesOrderDetail } from "./SalesOrderDetail";

// Define types based on your Prisma schema
type SalesOrder = {
  id: string;
  orderNumber: string;
  date: Date;
  customerId: string | null;
  locationId: string;
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  } | null;
  location: {
    id: string;
    name: string;
  };
  source?: string;
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
  paymentMethod: string | null;
  subtotal: number;
  taxAmount: number;
  shippingCost: number | null;
  discount: number | null;
  total: number;
  notes: string | null;
  createdBy: {
    name: string | null;
  };
  createdAt: Date;
};

interface SalesOrderLayoutProps {
  salesOrders: SalesOrder[];
}

export function SalesOrderLayout({ salesOrders }: SalesOrderLayoutProps) {
  const searchParams = useSearchParams();
  const [filteredOrders, setFilteredOrders] =
    useState<SalesOrder[]>(salesOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    salesOrders.length > 0 ? salesOrders[0].id : null
  );
  const [isMobileDetailVisible, setIsMobileDetailVisible] = useState(false);

  const selectedOrder = filteredOrders.find(
    (order) => order.id === selectedOrderId
  );

  const handleOrderSelect = (id: string) => {
    setSelectedOrderId(id);
    setIsMobileDetailVisible(true);
  };

  const handleBackToList = () => {
    setIsMobileDetailVisible(false);
  };

  // Apply filters when search params change
  useEffect(() => {
    // Get filter values from URL
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const dateRange = searchParams.get("dateRange");

    // Filter orders based on URL params
    let filtered = [...salesOrders];

    // Filter by status
    if (status && status !== "all") {
      filtered = filtered.filter((order) => order.status === status);
    }

    // Filter by payment status
    if (paymentStatus && paymentStatus !== "all") {
      filtered = filtered.filter(
        (order) => order.paymentStatus === paymentStatus
      );
    }

    // Filter by date range
    if (fromDate && toDate) {
      const from = parseISO(fromDate);
      // For "today" filter, we need to set the time to the end of day
      // to include all sales from today
      let to = parseISO(toDate);
      if (dateRange === "today") {
        // Set the end time to 23:59:59.999 for "today" filter
        to = new Date(to);
        to.setHours(23, 59, 59, 999);
      }

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.date);
        return (
          (isAfter(orderDate, from) || isEqual(orderDate, from)) &&
          (isBefore(orderDate, to) || isEqual(orderDate, to))
        );
      });
    }

    setFilteredOrders(filtered);

    // Select first order after filtering
    if (
      filtered.length > 0 &&
      !filtered.some((order) => order.id === selectedOrderId)
    ) {
      setSelectedOrderId(filtered[0].id);
    } else if (filtered.length === 0) {
      setSelectedOrderId(null);
    }
  }, [searchParams, salesOrders]);

  return (
    <div className="grid md:grid-cols-[250px_1fr] gap-6 h-[calc(100vh-280px)] min-h-[600px]">
      {/* Mobile back button - only shown when detail is visible on mobile */}
      {isMobileDetailVisible && (
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
            className="mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to list
          </Button>
        </div>
      )}

      {/* List column - hidden on mobile when detail is visible */}
      <div
        className={`${
          isMobileDetailVisible ? "hidden md:block" : "block"
        } border rounded-lg overflow-hidden`}
      >
        <SalesOrderList
          salesOrders={filteredOrders}
          selectedOrderId={selectedOrderId}
          onSelect={handleOrderSelect}
        />
      </div>

      {/* Detail column - only visible when an order is selected */}
      <div
        className={`${
          !isMobileDetailVisible && !selectedOrderId
            ? "hidden md:block"
            : "block"
        } border rounded-lg overflow-hidden`}
      >
        {selectedOrder ? (
          <SalesOrderDetail salesOrder={selectedOrder} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground p-6">
            {filteredOrders.length === 0
              ? "No sales orders match the current filters"
              : "Select a sales order to view details"}
          </div>
        )}
      </div>
    </div>
  );
}
