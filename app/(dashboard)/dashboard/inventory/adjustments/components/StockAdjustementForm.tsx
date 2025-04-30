"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { Item } from "@/types/inventory";

import { SearchableSelect } from "@/components/ui/searchable-select";
import { createStockAdjustment } from "@/actions/stock-adjustments";

// Define types for items and locations
type Location = {
  id: string;
  name: string;
};

// Define the form schema
const adjustmentLineSchema = z.object({
  id: z.string(),
  itemId: z.string({
    required_error: "Item is required",
  }),
  beforeQuantity: z.coerce
    .number({
      required_error: "Current quantity is required",
      invalid_type_error: "Current quantity must be a number",
    })
    .min(0, "Current quantity cannot be negative"),
  afterQuantity: z.coerce
    .number({
      required_error: "New quantity is required",
      invalid_type_error: "New quantity must be a number",
    })
    .min(0, "New quantity cannot be negative"),
  notes: z.string().optional(),
  serialNumbers: z.array(z.string()).optional(),
});

const formSchema = z.object({
  locationId: z.string({
    required_error: "Location is required",
  }),
  adjustmentType: z.string({
    required_error: "Adjustment type is required",
  }),
  reason: z
    .string({
      required_error: "Reason is required",
    })
    .min(3, "Reason must be at least 3 characters"),
  notes: z.string().optional(),
  lines: z
    .array(adjustmentLineSchema)
    .min(1, "Add at least one item to adjust"),
});

interface StockAdjustmentFormProps {
  items: Item[];
  locations: Location[];
  userId: string;
  orgId: string;
}

export function StockAdjustmentForm({
  items,
  locations,
  userId,
  orgId,
}: StockAdjustmentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationId: "",
      adjustmentType: "",
      reason: "",
      notes: "",
      lines: [
        {
          id: uuidv4(),
          itemId: "",
          beforeQuantity: 0,
          afterQuantity: 0,
          notes: "",
          serialNumbers: [],
        },
      ],
    },
  });

  // Set up field array for dynamic lines
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Get the watch function to track form values
  const watchedLines = form.watch("lines");
  const watchedLocationId = form.watch("locationId");

  // Function to get current quantity for an item at selected location
  const getCurrentQuantity = (itemId: string) => {
    if (!watchedLocationId) return 0;

    const item = items.find((i) => i.id === itemId);
    if (!item) return 0;

    const inventory = item.inventories.find(
      (inv) => inv.locationId === watchedLocationId
    );
    if (!inventory) return 0;

    return inventory.quantity;
  };

  // Function to add a new line
  const addLine = () => {
    append({
      id: uuidv4(),
      itemId: "",
      beforeQuantity: 0,
      afterQuantity: 0,
      notes: "",
      serialNumbers: [],
    });
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const result = await createStockAdjustment({
        locationId: values.locationId,
        adjustmentType: values.adjustmentType,
        reason: values.reason,
        notes: values.notes,
        lines: values.lines.map((line) => ({
          itemId: line.itemId,
          beforeQuantity: line.beforeQuantity,
          afterQuantity: line.afterQuantity,
          notes: line.notes,
          serialNumbers: line.serialNumbers,
        })),
        userId,
        orgId,
      });

      if (result.success) {
        toast.success("Stock adjustment created successfully");
        router.push("/dashboard/inventory/adjustments");
      } else {
        toast.error(result.error || "Failed to create stock adjustment");
      }
    } catch (error) {
      console.error("Error creating stock adjustment:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update before quantity when item or location changes
  const handleItemChange = (value: string, index: number) => {
    form.setValue(`lines.${index}.itemId`, value);
    const currentQty = getCurrentQuantity(value);
    form.setValue(`lines.${index}.beforeQuantity`, currentQty);
    form.setValue(`lines.${index}.afterQuantity`, currentQty);
  };

  const itemOptions = items.map((item) => ({
    value: item.id,
    label: `${item.name} (${item.sku})`,
  }));

  const adjustmentTypes = [
    { value: "STOCK_COUNT", label: "Stock Count" },
    { value: "DAMAGE", label: "Damage" },
    { value: "THEFT", label: "Theft" },
    { value: "EXPIRED", label: "Expired" },
    { value: "WRITE_OFF", label: "Write Off" },
    { value: "CORRECTION", label: "Correction" },
    { value: "OTHER", label: "Other" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adjustmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adjustment Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select adjustment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {adjustmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter reason for adjustment"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Adjustment Items</h2>
            <Button
              type="button"
              onClick={addLine}
              variant="outline"
              disabled={isSubmitting || !watchedLocationId}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Current Quantity</TableHead>
                  <TableHead>New Quantity</TableHead>
                  <TableHead>Difference</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No items added. Click "Add Item" to start.
                    </TableCell>
                  </TableRow>
                ) : (
                  fields.map((field, index) => {
                    const watchedLine = watchedLines[index];
                    const difference =
                      watchedLine?.beforeQuantity !== undefined &&
                      watchedLine?.afterQuantity !== undefined
                        ? watchedLine.afterQuantity - watchedLine.beforeQuantity
                        : 0;

                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.itemId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <SearchableSelect
                                    options={itemOptions}
                                    value={field.value}
                                    onValueChange={(value) =>
                                      handleItemChange(value, index)
                                    }
                                    placeholder="Search and select an item"
                                    emptyMessage="No items found"
                                    clearable
                                    disabled={
                                      isSubmitting || !watchedLocationId
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.beforeQuantity`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    {...field}
                                    disabled={true}
                                    className="w-[100px]"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.afterQuantity`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    {...field}
                                    disabled={
                                      isSubmitting || !watchedLine?.itemId
                                    }
                                    className="w-[100px]"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <div
                            className={`font-medium ${difference > 0 ? "text-green-600" : difference < 0 ? "text-red-600" : ""}`}
                          >
                            {difference > 0 ? "+" : ""}
                            {difference}
                          </div>
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.notes`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input
                                    placeholder="Optional notes"
                                    {...field}
                                    disabled={
                                      isSubmitting || !watchedLine?.itemId
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={isSubmitting || fields.length <= 1}
                            className="text-destructive hover:text-destructive/90"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about this stock adjustment"
                  className="min-h-[100px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/inventory/adjustments")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Create Adjustment"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
