"use client";

import { useState, useEffect } from "react";
import { Check, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { addItemSuppliers } from "@/actions/item-suppliers";
import { toast } from "sonner";

type Supplier = {
  id: string;
  name: string;
};

interface AddItemSuppliersModalProps {
  itemId: string;
  suppliers: Supplier[];
  existingSupplierIds?: string[];
}

export function AddItemSuppliersModal({
  itemId,
  suppliers,
  existingSupplierIds = [],
}: AddItemSuppliersModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset selections when modal opens
  useEffect(() => {
    if (open) {
      setSelectedSuppliers([]);
      setSearchQuery("");
    }
  }, [open]);

  // Toggle supplier selection
  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (selectedSuppliers.length === 0) return;

    setIsSubmitting(true);
    try {
      await addItemSuppliers(itemId, selectedSuppliers);
      toast.success("New Item Suppliers Added");
      setOpen(false);
      router.refresh(); // Refresh the page to show new suppliers
    } catch (error) {
      toast.error("Failed to add Item Suppliers ");
      console.error("Failed to add suppliers:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Item Suppliers</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Suppliers</DialogTitle>
          <DialogDescription>
            Select suppliers to associate with this item.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search suppliers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[300px] mt-2 rounded-md border p-2">
          {filteredSuppliers.length > 0 ? (
            <div className="space-y-2">
              {filteredSuppliers.map((supplier) => {
                const isExisting = existingSupplierIds.includes(supplier.id);

                return (
                  <div
                    key={supplier.id}
                    className={`flex items-center space-x-2 p-2 rounded-md ${
                      isExisting ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                  >
                    {isExisting ? (
                      <div className="h-4 w-4 flex items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : (
                      <Checkbox
                        id={`supplier-${supplier.id}`}
                        checked={selectedSuppliers.includes(supplier.id)}
                        onCheckedChange={() => toggleSupplier(supplier.id)}
                        disabled={isExisting}
                      />
                    )}
                    <label
                      htmlFor={`supplier-${supplier.id}`}
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 ${
                        isExisting ? "text-muted-foreground" : ""
                      }`}
                    >
                      {supplier.name}
                      {isExisting && (
                        <span className="ml-2 text-xs">(Already added)</span>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No suppliers found
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedSuppliers.length} supplier
            {selectedSuppliers.length !== 1 ? "s" : ""} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedSuppliers.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Selected"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
