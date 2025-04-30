"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PackageCheck } from "lucide-react";
import { ReceiveInventoryModal } from "./receive-inventory-modal";

interface ReceiveInventoryButtonProps {
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  locationId: string;
}

export function ReceiveInventoryButton({
  purchaseOrderId,
  purchaseOrderNumber,
  locationId,
}: ReceiveInventoryButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="default"
        className="h-9"
        size="sm"
      >
        <PackageCheck className="mr-2 h-4 w-4" />
        Receive Inventory
      </Button>

      <ReceiveInventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        purchaseOrderId={purchaseOrderId}
        purchaseOrderNumber={purchaseOrderNumber}
        locationId={locationId}
      />
    </>
  );
}
