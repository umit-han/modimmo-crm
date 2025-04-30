"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Define types based on your Prisma schema
type PurchaseOrder = {
  id: string;
  poNumber: string;
  date: Date;
  supplier: {
    name: string;
  };
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "APPROVED"
    | "PARTIALLY_RECEIVED"
    | "RECEIVED"
    | "CANCELLED"
    | "CLOSED";
  total: number;
};

interface PurchaseOrderListProps {
  purchaseOrders: PurchaseOrder[];
  selectedPOId: string | null;
  onSelect: (id: string) => void;
}

export function PurchaseOrderList({
  purchaseOrders,
  selectedPOId,
  onSelect,
}: PurchaseOrderListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPOs = purchaseOrders.filter(
    (po) =>
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to get status badge styling
  const getStatusBadge = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "SUBMITTED":
        return <Badge variant="secondary">Submitted</Badge>;
      case "APPROVED":
        return <Badge variant="default">Approved</Badge>;
      case "PARTIALLY_RECEIVED":
        return <Badge className="bg-amber-500">Partially Received</Badge>;
      case "RECEIVED":
        return <Badge className="bg-green-600">Received</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "CLOSED":
        return (
          <Badge variant="default" className="bg-gray-500">
            Closed
          </Badge>
        );
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
            placeholder="Search PO number or supplier..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredPOs.length > 0 ? (
          <div className="divide-y">
            {filteredPOs.map((po) => (
              <button
                key={po.id}
                onClick={() => onSelect(po.id)}
                className={cn(
                  "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
                  "focus:outline-none focus:bg-muted/50",
                  selectedPOId === po.id && "bg-muted"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-primary">{po.poNumber}</div>
                  <div className="text-sm font-medium">
                    {formatCurrency(po.total)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {po.supplier.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(po.date), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  {getStatusBadge(po.status)}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
            No purchase orders found
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
