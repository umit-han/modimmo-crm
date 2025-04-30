"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ProductData } from "@/types/item";
import { updateItemById } from "@/actions/items";

// This would be a server action in a real application
async function updateItem(id: string, data: Partial<ProductData>) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("Updating item:", id, data);
  return { success: true };
}

export function AdditionalDetailsTab({ item }: { item: ProductData }) {
  return (
    <div className="grid gap-6 mt-6">
      <UpcEanCard item={item} />
      <MpnIsbnCard item={item} />
      <SalesInfoCard item={item} />
    </div>
  );
}

function UpcEanCard({ item }: { item: ProductData }) {
  const [upc, setUpc] = useState(item.upc || "");
  const [ean, setEan] = useState(item.ean || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const data = {
        upc: upc || undefined,
        ean: ean || undefined,
      };
      await updateItemById(item.id, data);
      toast.success("UPC and EAN updated successfully");
    } catch (error) {
      toast.error("Failed to update UPC and EAN");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>UPC & EAN</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="upc">UPC (Universal Product Code)</Label>
          <Input
            id="upc"
            value={upc}
            onChange={(e) => setUpc(e.target.value)}
            placeholder="123456789012"
            maxLength={12}
          />
          <p className="text-xs text-muted-foreground">
            12-digit unique number associated with the barcode
          </p>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="ean">EAN (International Article Number)</Label>
          <Input
            id="ean"
            value={ean}
            onChange={(e) => setEan(e.target.value)}
            placeholder="1234567890123"
            maxLength={13}
          />
          <p className="text-xs text-muted-foreground">
            13-digit unique number
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update UPC & EAN"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function MpnIsbnCard({ item }: { item: ProductData }) {
  const [mpn, setMpn] = useState(item.mpn || "");
  const [isbn, setIsbn] = useState(item.isbn || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const data = {
        mpn: mpn || undefined,
        isbn: isbn || undefined,
      };
      await updateItemById(item.id, data);
      toast.success("MPN and ISBN updated successfully");
    } catch (error) {
      toast.error("Failed to update MPN and ISBN");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>MPN & ISBN</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="mpn">MPN (Manufacturing Part Number)</Label>
          <Input
            id="mpn"
            value={mpn}
            onChange={(e) => setMpn(e.target.value)}
            placeholder="MPN123456"
          />
          <p className="text-xs text-muted-foreground">
            Unambiguously identifies a part design
          </p>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="isbn">
            ISBN (International Standard Book Number)
          </Label>
          <Input
            id="isbn"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="9781234567897"
            maxLength={13}
          />
          <p className="text-xs text-muted-foreground">
            13-digit unique commercial book identifier
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update MPN & ISBN"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function SalesInfoCard({ item }: { item: ProductData }) {
  // These fields are typically read-only as they're calculated from sales data
  const [salesCount, setSalesCount] = useState(item.salesCount.toString());
  const [salesTotal, setSalesTotal] = useState(item.salesTotal.toString());
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const data = {
        salesCount: Number.parseInt(salesCount),
        salesTotal: Number.parseFloat(salesTotal),
      };
      await updateItem(item.id, data);
      toast.success("Sales information updated successfully");
    } catch (error) {
      toast.error("Failed to update sales information");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="salesCount">Sales Count</Label>
          <Input
            id="salesCount"
            type="number"
            value={salesCount}
            onChange={(e) => setSalesCount(e.target.value)}
            placeholder="0"
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Total number of units sold
          </p>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="salesTotal">Sales Total</Label>
          <Input
            id="salesTotal"
            type="number"
            step="0.01"
            value={salesTotal}
            onChange={(e) => setSalesTotal(e.target.value)}
            placeholder="0.00"
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Total revenue from this item
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={true}>
          Update Sales Information
        </Button>
        <p className="text-xs text-muted-foreground ml-4">
          Sales information is read-only
        </p>
      </CardFooter>
    </Card>
  );
}
