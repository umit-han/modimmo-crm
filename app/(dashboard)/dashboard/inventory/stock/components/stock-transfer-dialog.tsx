"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeftRight, Loader2 } from "lucide-react";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTransfer } from "@/actions/stock-transfer";
import { InventoryItem, Item } from "@/types/inventory";

// Define the form schema
const formSchema = z
  .object({
    fromLocationId: z.string({
      required_error: "Please select a source location",
    }),
    toLocationId: z.string({
      required_error: "Please select a destination location",
    }),
    quantity: z.coerce
      .number({
        required_error: "Please enter a quantity",
        invalid_type_error: "Quantity must be a number",
      })
      .positive("Quantity must be greater than 0"),
    notes: z.string().optional(),
  })
  .refine((data) => data.fromLocationId !== data.toLocationId, {
    message: "Source and destination locations must be different",
    path: ["toLocationId"],
  });

type Location = {
  id: string;
  name: string;
};

interface StockTransferDialogProps {
  item: InventoryItem;
  locations: Location[];
}

export function StockTransferDialog({
  item,
  locations,
}: StockTransferDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromLocationId: "",
      toLocationId: "",
      quantity: 1,
      notes: "",
    },
  });

  // Get the selected source location's available quantity
  const fromLocationId = form.watch("fromLocationId");
  const selectedInventory = item.inventories.find(
    (inv) => inv.locationId === fromLocationId
  );
  const availableQuantity = selectedInventory
    ? selectedInventory.quantity - selectedInventory.reservedQuantity
    : 0;

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.quantity > availableQuantity) {
      form.setError("quantity", {
        type: "manual",
        message: `Only ${availableQuantity} units available at this location`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createTransfer({
        itemId: item.id,
        fromLocationId: values.fromLocationId,
        toLocationId: values.toLocationId,
        quantity: values.quantity,
        notes: values.notes || "",
      });

      if (result.success) {
        toast.success("Transfer created successfully");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create transfer");
      }
    } catch (error) {
      console.error("Error creating transfer:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          Transfer Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Stock Transfer</DialogTitle>
          <DialogDescription>
            Create a transfer request for {item.name} ({item.sku}) between
            locations
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="fromLocationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations
                        .filter((location) => {
                          // Only show locations that have stock
                          const inventory = item.inventories.find(
                            (inv) => inv.locationId === location.id
                          );
                          return inventory && inventory.quantity > 0;
                        })
                        .map((location) => {
                          const inventory = item.inventories.find(
                            (inv) => inv.locationId === location.id
                          );
                          const available = inventory
                            ? inventory.quantity - inventory.reservedQuantity
                            : 0;
                          return (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name} ({available} available)
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {fromLocationId &&
                      `Available: ${availableQuantity} ${availableQuantity === 1 ? "unit" : "units"}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toLocationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations
                        .filter((location) => location.id !== fromLocationId)
                        .map((location) => (
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
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={availableQuantity}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this transfer"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
