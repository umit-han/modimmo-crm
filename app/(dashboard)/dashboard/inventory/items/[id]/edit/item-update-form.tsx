"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoTab } from "./tabs/basic-info-tab";
import { InventoryPricingTab } from "./tabs/inventory-pricing-tab";
import { AdditionalDetailsTab } from "./tabs/additional-details-tab";
import { ProductData } from "@/types/item";
import { cn } from "@/lib/utils";
export interface Option {
  label: string;
  value: string;
}
export function ItemUpdateForm({
  item,
  brandOptions,
  categoryOptions,
  taxOptions,
  unitOptions,
}: {
  item: ProductData;
  categoryOptions: Option[];
  taxOptions: Option[];
  unitOptions: Option[];
  brandOptions: Option[];
}) {
  const [activeTab, setActiveTab] = useState("basic-info");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full p-0 bg-transparent border-b rounded-none mb-6 relative">
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted"></div>
        <TabsTrigger
          value="basic-info"
          className={cn(
            "py-3 px-6 rounded-none data-[state=active]:shadow-none relative",
            "data-[state=active]:text-primary data-[state=active]:font-medium",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
          )}
        >
          Basic Information
        </TabsTrigger>
        <TabsTrigger
          value="inventory-pricing"
          className={cn(
            "py-3 px-6 rounded-none data-[state=active]:shadow-none relative",
            "data-[state=active]:text-primary data-[state=active]:font-medium",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
          )}
        >
          Inventory & Pricing
        </TabsTrigger>
        <TabsTrigger
          value="additional-details"
          className={cn(
            "py-3 px-6 rounded-none data-[state=active]:shadow-none relative",
            "data-[state=active]:text-primary data-[state=active]:font-medium",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
          )}
        >
          Additional Details
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic-info">
        <BasicInfoTab
          brandOptions={brandOptions}
          categoryOptions={categoryOptions}
          item={item}
        />
      </TabsContent>

      <TabsContent value="inventory-pricing">
        <InventoryPricingTab
          unitOptions={unitOptions}
          taxOptions={taxOptions}
          item={item}
        />
      </TabsContent>

      <TabsContent value="additional-details">
        <AdditionalDetailsTab item={item} />
      </TabsContent>
    </Tabs>
  );
}
