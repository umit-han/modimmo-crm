"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoTab } from "./tabs/basic-info-tab";
import { cn } from "@/lib/utils";
import { Supplier } from "@prisma/client";
export interface Option {
  label: string;
  value: string;
}
export function SupplierUpdateForm({ supplier }: { supplier: Supplier }) {
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
      </TabsList>

      <TabsContent value="basic-info">
        <BasicInfoTab supplier={supplier} />
      </TabsContent>
    </Tabs>
  );
}
