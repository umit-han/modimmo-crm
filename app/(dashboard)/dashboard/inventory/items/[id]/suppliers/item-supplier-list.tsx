"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
// import { ItemSupplier } from "@prisma/client";

type Supplier = {
  id: string;
  name: string;
};

type ItemSupplier = {
  id: string;
  supplier: Supplier;
  isPreferred: boolean;
  supplierSku: string | null;
};

interface ItemSuppliersListProps {
  itemSuppliers: ItemSupplier[];
  selectedSupplierId: string | null;
  onSelect: (id: string) => void;
}

export function ItemSuppliersList({
  itemSuppliers,
  selectedSupplierId,
  onSelect,
}: ItemSuppliersListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSuppliers = itemSuppliers.filter((itemSupplier) =>
    itemSupplier.supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search suppliers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredSuppliers.length > 0 ? (
          <div className="divide-y">
            {filteredSuppliers.map((itemSupplier) => (
              <button
                key={itemSupplier.id}
                onClick={() => onSelect(itemSupplier.id)}
                className={cn(
                  "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
                  "focus:outline-none focus:bg-muted/50",
                  selectedSupplierId === itemSupplier.id && "bg-muted"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{itemSupplier.supplier.name}</p>
                    {itemSupplier.supplierSku && (
                      <p className="text-sm text-muted-foreground">
                        SKU: {itemSupplier.supplierSku}
                      </p>
                    )}
                  </div>
                  {itemSupplier.isPreferred && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Preferred
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
            No suppliers found
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
