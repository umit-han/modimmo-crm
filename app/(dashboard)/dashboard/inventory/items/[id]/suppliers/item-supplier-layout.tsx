"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ItemSuppliersList } from "./item-supplier-list";
import { ItemSupplierForm } from "./item-supplier-form";

// Define the types based on your Prisma schema
type Supplier = {
  id: string;
  name: string;
};

type ItemSupplier = {
  id: string;
  itemId: string;
  supplierId: string;
  supplier: Supplier;
  isPreferred: boolean;
  supplierSku: string | null;
  leadTime: number | null;
  minOrderQty: number | null;
  unitCost: number | null;
  lastPurchaseDate: Date | null;
  notes: string | null;
};

interface ItemSuppliersLayoutProps {
  itemId: string;
  itemSuppliers: ItemSupplier[];
}

export function ItemSuppliersLayout({
  itemId,
  itemSuppliers,
}: ItemSuppliersLayoutProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    itemSuppliers.length > 0 ? itemSuppliers[0].id : null
  );
  const [isMobileFormVisible, setIsMobileFormVisible] = useState(false);

  const selectedSupplier = itemSuppliers.find(
    (supplier) => supplier.id === selectedSupplierId
  );

  const handleSupplierSelect = (id: string) => {
    setSelectedSupplierId(id);
    setIsMobileFormVisible(true);
  };

  const handleBackToList = () => {
    setIsMobileFormVisible(false);
  };

  return (
    <div className="grid md:grid-cols-[350px_1fr] gap-6 h-[calc(100vh-180px)] min-h-[500px]">
      {/* Mobile back button - only shown when form is visible on mobile */}
      {isMobileFormVisible && (
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

      {/* List column - hidden on mobile when form is visible */}
      <div
        className={`${isMobileFormVisible ? "hidden md:block" : "block"} border rounded-lg overflow-hidden`}
      >
        <ItemSuppliersList
          itemSuppliers={itemSuppliers}
          selectedSupplierId={selectedSupplierId}
          onSelect={handleSupplierSelect}
        />
      </div>

      {/* Form column - only visible when a supplier is selected */}
      <div
        className={`${!isMobileFormVisible && !selectedSupplierId ? "hidden md:block" : "block"} border rounded-lg p-4 md:p-6`}
      >
        {selectedSupplier ? (
          <ItemSupplierForm itemSupplier={selectedSupplier} itemId={itemId} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a supplier to edit details
          </div>
        )}
      </div>
    </div>
  );
}
