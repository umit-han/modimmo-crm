"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { formatNumber } from "@/lib/utils";
import { Package, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getInventoryItems } from "@/actions/inventory";
import { Item } from "@/types/inventory";

interface InventoryItemListProps {
  orgId: string;
  selectedItemId: string;
}

export function InventoryItemList({
  orgId,
  selectedItemId,
}: InventoryItemListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all items on component mount
  useEffect(() => {
    async function fetchItems() {
      try {
        const data = await getInventoryItems(orgId);
        setItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchItems();
  }, [orgId]);

  // Filter items when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredItems(items);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowercaseSearch) ||
          item.sku.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items by name or SKU"
            className="pl-8"
            disabled
          />
        </div>
        <div className="space-y-2 border rounded-lg p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2 py-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items by name or SKU"
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No items found</h3>
          <p className="text-muted-foreground">
            You don't have any items in your inventory yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items by name or SKU"
          className="pl-8"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No items found</h3>
          <p className="text-muted-foreground">No items match "{searchTerm}"</p>
        </div>
      ) : (
        <div className="border rounded-lg divide-y overflow-hidden max-h-[calc(100vh-220px)] overflow-y-auto">
          {filteredItems.map((item) => {
            // Calculate total quantity across all locations
            const totalQuantity = item.inventories.reduce(
              (sum, inv) => sum + inv.quantity,
              0
            );
            const totalReserved = item.inventories.reduce(
              (sum, inv) => sum + inv.reservedQuantity,
              0
            );
            const availableQuantity = totalQuantity - totalReserved;

            // Determine stock status
            let stockStatus = "In Stock";
            let statusColor = "bg-green-500";

            if (availableQuantity <= 0) {
              stockStatus = "Out of Stock";
              statusColor = "bg-red-500";
            } else if (availableQuantity < 10) {
              stockStatus = "Low Stock";
              statusColor = "bg-orange-500";
            }

            return (
              <Link
                key={item.id}
                href={`${pathname}?itemId=${item.id}`}
                className={`flex items-center p-4 hover:bg-muted/50 transition-colors ${
                  selectedItemId === item.id ? "bg-muted" : ""
                }`}
              >
                <div className="h-10 w-10 bg-muted/50 rounded-md flex items-center justify-center mr-3">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.sku}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatNumber(totalQuantity)}
                  </div>
                  <Badge
                    variant="outline"
                    className={statusColor + " border-none text-white"}
                  >
                    {stockStatus}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
