"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PurchaseOrderList } from "./purchase-order-list";
import { PurchaseOrderDetail } from "./purchase-order-detail";

// Define types based on your Prisma schema
type PurchaseOrder = {
  id: string;
  poNumber: string;
  date: Date;
  supplierId: string;
  deliveryLocationId: string;
  supplierName?: string | null;
  supplier: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "APPROVED"
    | "PARTIALLY_RECEIVED"
    | "RECEIVED"
    | "CANCELLED"
    | "CLOSED";
  subtotal: number;
  taxAmount: number;
  shippingCost?: number | null;
  discount?: number | null;
  total: number;
  notes?: string | null;
  paymentTerms?: string | null;
  expectedDeliveryDate?: Date | null;
  createdBy: {
    name: string | null;
  };
  createdAt: Date;
};

interface PurchaseOrderLayoutProps {
  purchaseOrders: PurchaseOrder[];
}

export function PurchaseOrderLayout({
  purchaseOrders,
}: PurchaseOrderLayoutProps) {
  const [selectedPOId, setSelectedPOId] = useState<string | null>(
    purchaseOrders.length > 0 ? purchaseOrders[0].id : null
  );
  const [isMobileDetailVisible, setIsMobileDetailVisible] = useState(false);

  const selectedPO = purchaseOrders.find((po) => po.id === selectedPOId);

  const handlePOSelect = (id: string) => {
    setSelectedPOId(id);
    setIsMobileDetailVisible(true);
  };

  const handleBackToList = () => {
    setIsMobileDetailVisible(false);
  };

  return (
    <div className="grid md:grid-cols-[250px_1fr] gap-6 h-[calc(100vh-180px)] min-h-[600px]">
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
        className={`${isMobileDetailVisible ? "hidden md:block" : "block"} border rounded-lg overflow-hidden`}
      >
        <PurchaseOrderList
          purchaseOrders={purchaseOrders}
          selectedPOId={selectedPOId}
          onSelect={handlePOSelect}
        />
      </div>

      {/* Detail column - only visible when a PO is selected */}
      <div
        className={`${!isMobileDetailVisible && !selectedPOId ? "hidden md:block" : "block"} border rounded-lg overflow-hidden`}
      >
        {selectedPO ? (
          <PurchaseOrderDetail purchaseOrder={selectedPO} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground p-6">
            Select a purchase order to view details
          </div>
        )}
      </div>
    </div>
  );
}
