"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Supplier = {
  id: string;
  name: string;
};

type ItemSupplier = {
  id: string;
  supplierId: string;
  supplier: Supplier;
  unitCost: number | null;
};

type Item = {
  id: string;
  name: string;
  sku: string;
  itemSuppliers: ItemSupplier[];
};

interface ItemSelectorProps {
  items: Item[];
  supplierId: string;
  onItemSelect: (item: Item) => void;
}

export function ItemSelector({
  items,
  supplierId,
  onItemSelect,
}: ItemSelectorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  // Filter items that are available from this supplier or have no supplier restrictions
  const filteredItems = items.filter((item) => {
    // If the item has supplier associations, check if this supplier is included
    if (item.itemSuppliers.length > 0) {
      return item.itemSuppliers.some((is) => is.supplierId === supplierId);
    }
    // If no supplier associations, show all items
    return true;
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between md:w-[300px]"
        >
          <span className="truncate">
            {value
              ? filteredItems.find((item) => item.id === value)?.name
              : "Select an item..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 md:w-[300px]">
        <Command>
          <CommandInput placeholder="Search items..." />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={(currentValue) => {
                    const selectedItem = filteredItems.find(
                      (item) => item.id === currentValue
                    );
                    if (selectedItem) {
                      onItemSelect(selectedItem);
                      setValue("");
                      setOpen(false);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.sku}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
