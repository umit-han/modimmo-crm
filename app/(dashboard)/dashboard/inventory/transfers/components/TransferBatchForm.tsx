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
import { createBatchTransfer } from "@/actions/stock-transfer";
import { SearchableSelect } from "@/components/ui/searchable-select";

// Define types for items and locations

type Location = {
  id: string;
  name: string;
};

// Define the form schema
const transferLineSchema = z.object({
  id: z.string(),
  itemId: z.string({
    required_error: "Item is required",
  }),
  fromLocationId: z.string({
    required_error: "Source location is required",
  }),
  toLocationId: z.string({
    required_error: "Destination location is required",
  }),
  quantity: z.coerce
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .positive("Quantity must be greater than 0"),
});

const formSchema = z
  .object({
    lines: z
      .array(transferLineSchema)
      .min(1, "Add at least one item to transfer"),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // Check that each line has different from and to locations
      return data.lines.every(
        (line) => line.fromLocationId !== line.toLocationId
      );
    },
    {
      message:
        "Source and destination locations must be different for each item",
      path: ["lines"],
    }
  );

interface BatchTransferFormProps {
  items: Item[];
  locations: Location[];
  userId: string;
  orgId: string;
}

export function BatchTransferForm({
  items,
  locations,
  userId,
  orgId,
}: BatchTransferFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lines: [
        {
          id: uuidv4(),
          itemId: "",
          fromLocationId: "",
          toLocationId: "",
          quantity: 1,
        },
      ],
      notes: "",
    },
  });

  // Set up field array for dynamic lines
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Get the watch function to track form values
  const watchedLines = form.watch("lines");

  // Function to get available quantity for an item at a location
  const getAvailableQuantity = (itemId: string, locationId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return 0;

    const inventory = item.inventories.find(
      (inv) => inv.locationId === locationId
    );
    if (!inventory) return 0;

    return Math.max(0, inventory.quantity - inventory.reservedQuantity);
  };

  // Function to add a new line
  const addLine = () => {
    append({
      id: uuidv4(),
      itemId: "",
      fromLocationId: "",
      toLocationId: "",
      quantity: 1,
    });
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Additional validation
    for (const line of values.lines) {
      const availableQuantity = getAvailableQuantity(
        line.itemId,
        line.fromLocationId
      );
      if (line.quantity > availableQuantity) {
        form.setError(`lines.${values.lines.indexOf(line)}.quantity`, {
          type: "manual",
          message: `Only ${availableQuantity} units available at this location`,
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const result = await createBatchTransfer({
        lines: values.lines,
        notes: values.notes || "",
        userId,
        orgId,
      });

      if (result.success) {
        toast.success("Batch transfer created successfully");
        router.push("/dashboard/inventory/transfers");
      } else {
        toast.error(result.error || "Failed to create batch transfer");
      }
    } catch (error) {
      console.error("Error creating batch transfer:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  const itemOptions = items.map((item) => ({
    value: item.id,
    label: `${item.name}(${item.sku})`,
  }));
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Transfer Items</h2>
            <Button
              type="button"
              onClick={addLine}
              variant="outline"
              disabled={isSubmitting}
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
                  <TableHead>From Location</TableHead>
                  <TableHead>To Location</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No items added. Click "Add Item" to start.
                    </TableCell>
                  </TableRow>
                ) : (
                  fields.map((field, index) => {
                    const watchedLine = watchedLines[index];
                    const availableQuantity =
                      watchedLine?.itemId && watchedLine?.fromLocationId
                        ? getAvailableQuantity(
                            watchedLine.itemId,
                            watchedLine.fromLocationId
                          )
                        : 0;

                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.itemId`}
                            render={({ field }) => (
                              <FormItem>
                                {/* <FormLabel>Item</FormLabel> */}
                                <FormControl>
                                  <SearchableSelect
                                    options={itemOptions}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Search and select an item"
                                    emptyMessage="No items found"
                                    clearable
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* <FormField
                            control={form.control}
                            name={`lines.${index}.itemId`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={isSubmitting}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Select item" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {items.map((item) => (
                                      <SelectItem key={item.id} value={item.id}>
                                        {item.name} ({item.sku})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          /> */}
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.fromLocationId`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={
                                    isSubmitting || !watchedLine?.itemId
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Source location" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {locations
                                      .filter((location) => {
                                        if (!watchedLine?.itemId) return true;
                                        // Only show locations that have stock for this item
                                        const item = items.find(
                                          (i) => i.id === watchedLine.itemId
                                        );
                                        if (!item) return false;
                                        const inventory = item.inventories.find(
                                          (inv) =>
                                            inv.locationId === location.id
                                        );
                                        return (
                                          inventory && inventory.quantity > 0
                                        );
                                      })
                                      .map((location) => {
                                        const available = watchedLine?.itemId
                                          ? getAvailableQuantity(
                                              watchedLine.itemId,
                                              location.id
                                            )
                                          : 0;
                                        return (
                                          <SelectItem
                                            key={location.id}
                                            value={location.id}
                                          >
                                            {location.name} ({available}{" "}
                                            available)
                                          </SelectItem>
                                        );
                                      })}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.toLocationId`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={
                                    isSubmitting || !watchedLine?.fromLocationId
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Destination" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {locations
                                      .filter(
                                        (location) =>
                                          location.id !==
                                          watchedLine?.fromLocationId
                                      )
                                      .map((location) => (
                                        <SelectItem
                                          key={location.id}
                                          value={location.id}
                                        >
                                          {location.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={availableQuantity}
                                    {...field}
                                    disabled={
                                      isSubmitting ||
                                      !watchedLine?.fromLocationId
                                    }
                                    className="w-[100px]"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  {watchedLine?.itemId &&
                                    watchedLine?.fromLocationId && (
                                      <>Max: {availableQuantity}</>
                                    )}
                                </FormDescription>
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
                  placeholder="Add any notes about this batch transfer"
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
            onClick={() => router.push("/transfers")}
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
              "Create Transfer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
