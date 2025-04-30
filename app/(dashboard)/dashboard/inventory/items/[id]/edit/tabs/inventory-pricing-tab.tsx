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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ProductData } from "@/types/item";
import { updateItemById } from "@/actions/items";
import { Option } from "../item-update-form";
import FormSelectInput from "@/components/FormInputs/FormSelectInput";

// This would be a server action in a real application
async function updateItem(id: string, data: Partial<ProductData>) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("Updating item:", id, data);
  return { success: true };
}

export function InventoryPricingTab({
  item,
  taxOptions,
  unitOptions,
}: {
  item: ProductData;
  taxOptions: Option[];
  unitOptions: Option[];
}) {
  return (
    <div className="grid gap-6 mt-6">
      <PricingCard item={item} />
      <StockLevelsCard item={item} />
      <StatusCard item={item} />
      {/* <TaxCard item={item} /> */}
      <UnitTaxCard
        taxOptions={taxOptions}
        unitOptions={unitOptions}
        item={item}
      />
    </div>
  );
}

function PricingCard({ item }: { item: ProductData }) {
  const [costPrice, setCostPrice] = useState(item.costPrice.toString());
  const [sellingPrice, setSellingPrice] = useState(
    item.sellingPrice.toString()
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!costPrice.trim() || !sellingPrice.trim()) {
      toast.error("Both prices are required");
      return;
    }

    setIsUpdating(true);

    try {
      const data = {
        costPrice: Number.parseFloat(costPrice),
        sellingPrice: Number.parseFloat(sellingPrice),
      };
      await updateItemById(item.id, data);
      toast.success("Prices updated successfully");
    } catch (error) {
      toast.error("Failed to update prices");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="costPrice">Cost Price</Label>
          <Input
            id="costPrice"
            type="number"
            step="0.01"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="sellingPrice">Selling Price</Label>
          <Input
            id="sellingPrice"
            type="number"
            step="0.01"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Pricing"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function StockLevelsCard({ item }: { item: ProductData }) {
  const [minStockLevel, setMinStockLevel] = useState(
    item.minStockLevel.toString()
  );
  const [maxStockLevel, setMaxStockLevel] = useState(
    item.maxStockLevel?.toString() || ""
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!minStockLevel.trim()) {
      toast.error("Minimum stock level is required");
      return;
    }

    setIsUpdating(true);

    try {
      const data = {
        minStockLevel: Number.parseInt(minStockLevel),
        maxStockLevel: maxStockLevel
          ? Number.parseInt(maxStockLevel)
          : undefined,
      };
      await updateItemById(item.id, data);
      toast.success("Stock levels updated successfully");
    } catch (error) {
      toast.error("Failed to update stock levels");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Levels</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
          <Input
            id="minStockLevel"
            type="number"
            value={minStockLevel}
            onChange={(e) => setMinStockLevel(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="maxStockLevel">Maximum Stock Level</Label>
          <Input
            id="maxStockLevel"
            type="number"
            value={maxStockLevel}
            onChange={(e) => setMaxStockLevel(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Stock Levels"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function StatusCard({ item }: { item: ProductData }) {
  const [isActive, setIsActive] = useState(item.isActive);
  const [isSerialTracked, setIsSerialTracked] = useState(item.isSerialTracked);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const data = { isActive, isSerialTracked };
      await updateItemById(item.id, data);
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Status</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="isActive" className="cursor-pointer">
            Active Item
          </Label>
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="isSerialTracked" className="cursor-pointer">
            Serial Number Tracking
          </Label>
          <Switch
            id="isSerialTracked"
            checked={isSerialTracked}
            onCheckedChange={setIsSerialTracked}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Status"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function TaxCard({ item }: { item: ProductData }) {
  const [tax, setTax] = useState(item.tax?.toString() || "0");
  const [taxRateId, setTaxRateId] = useState(item.taxRateId || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const data = {
        tax: Number.parseFloat(tax),
        taxRateId: taxRateId || undefined,
      };
      await updateItem(item.id, data);
      toast.success("Tax information updated successfully");
    } catch (error) {
      toast.error("Failed to update tax information");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="tax">Tax Rate (%)</Label>
          <Input
            id="tax"
            type="number"
            step="0.01"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="taxRateId">Tax Rate</Label>
          <Input
            id="taxRateId"
            value={taxRateId}
            onChange={(e) => setTaxRateId(e.target.value)}
            placeholder="Select tax rate"
          />
          {/* In a real app, this would be a select dropdown with tax rates */}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Tax Information"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function UnitTaxCard({
  item,
  unitOptions,
  taxOptions,
}: {
  item: ProductData;
  unitOptions: Option[];
  taxOptions: Option[];
}) {
  const [taxId, setTaxId] = useState(item.taxRateId || "");

  const initialTax = taxOptions.find((item) => item.value === taxId);
  const [selectedTax, setSelectedTax] = useState<Option | undefined>(
    initialTax
  );
  const [unitId, setUnitId] = useState(item.unitId || "");
  const initialUnit = unitOptions.find((item) => item.value === unitId);
  const [selectedUnit, setSelectedUnit] = useState<Option | undefined>(
    initialUnit
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const tax = selectedTax?.label.split("-")[0] ?? "";
      const unit = selectedUnit?.label.split("-")[0] ?? "";
      const data = {
        taxRateId: selectedTax?.value || undefined,
        unitId: selectedUnit?.value || undefined,
        unitOfMeasure: unit,
        tax: Number.parseFloat(tax),
      };
      await updateItemById(item.id, data);
      toast.success("Category and brand updated successfully");
    } catch (error) {
      toast.error("Failed to update category and brand");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category & Brand</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <FormSelectInput
            label="Units"
            options={unitOptions}
            option={selectedUnit as Option}
            setOption={setSelectedUnit}
            toolTipText="Add New Unit"
            href="/dashboard/inventory/units"
          />
          {/* In a real app, this would be a select dropdown with categories */}
        </div>
        <div className="grid gap-3">
          <FormSelectInput
            label="Tax Rates"
            options={taxOptions}
            option={selectedTax as Option}
            setOption={setSelectedTax}
            toolTipText="Add New Tax"
            href="/dashboard/inventory/settings/tax"
          />
          {/* In a real app, this would be a select dropdown with brands */}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Category & Brand"}
        </Button>
      </CardFooter>
    </Card>
  );
}
