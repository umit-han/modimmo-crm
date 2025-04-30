"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { updateItemSupplier } from "@/actions/item-suppliers";
import { toast } from "sonner";

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

// Create a schema for form validation
const formSchema = z.object({
  isPreferred: z.boolean().default(false),
  supplierSku: z.string().nullable(),
  leadTime: z.coerce.number().int().min(0).nullable(),
  minOrderQty: z.coerce.number().int().min(0).nullable(),
  unitCost: z.coerce.number().min(0).nullable(),
  lastPurchaseDate: z.date().nullable(),
  notes: z.string().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface ItemSupplierFormProps {
  itemSupplier: ItemSupplier;
  itemId: string;
}

export function ItemSupplierForm({
  itemSupplier,
  itemId,
}: ItemSupplierFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with current values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPreferred: itemSupplier.isPreferred,
      supplierSku: itemSupplier.supplierSku || "",
      leadTime: itemSupplier.leadTime,
      minOrderQty: itemSupplier.minOrderQty,
      unitCost: itemSupplier.unitCost,
      lastPurchaseDate: itemSupplier.lastPurchaseDate,
      notes: itemSupplier.notes || "",
    },
  });

  // This will reset the form with new values when the selected itemSupplier changes
  useEffect(() => {
    // Reset form with the new supplier's values when selected supplier changes
    form.reset({
      isPreferred: itemSupplier.isPreferred,
      supplierSku: itemSupplier.supplierSku || "",
      leadTime: itemSupplier.leadTime,
      minOrderQty: itemSupplier.minOrderQty,
      unitCost: itemSupplier.unitCost,
      lastPurchaseDate: itemSupplier.lastPurchaseDate,
      notes: itemSupplier.notes || "",
    });
  }, [itemSupplier.id, form, itemSupplier]);

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      // Convert empty strings to null
      const formattedData = {
        ...data,
        supplierSku: data.supplierSku === "" ? null : data.supplierSku,
        notes: data.notes === "" ? null : data.notes,
      };

      await updateItemSupplier(itemSupplier.id, formattedData);
      toast.success("Updated Item Supplier Successfully");
      router.refresh();
    } catch (error) {
      console.error("Failed to update item supplier:", error);
      toast.error("Failed to Update");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{itemSupplier.supplier.name}</h2>
        <p className="text-sm text-muted-foreground">Update supplier details</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="isPreferred"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Preferred Supplier</FormLabel>
                  <FormDescription>
                    Mark this supplier as preferred for this item
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="supplierSku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier SKU</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Supplier's SKU for this item"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unitCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Cost</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leadTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Time (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minOrderQty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Order Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="lastPurchaseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Last Purchase Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={(date) => field.onChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes about this supplier"
                    className="min-h-[100px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
