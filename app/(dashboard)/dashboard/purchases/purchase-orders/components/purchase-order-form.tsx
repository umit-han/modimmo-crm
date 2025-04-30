"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Loader2, Plus, Trash } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SearchableSelect } from "@/components/ui/searchable-select";
import { toast } from "sonner";
import { createPurchaseOrder } from "@/actions/purchase-orders";

// Define types based on your Prisma schema
type Supplier = {
  id: string;
  name: string;
};

type Location = {
  id: string;
  name: string;
};

type Item = {
  id: string;
  name: string;
  sku: string;
};

// Create a schema for form validation
const formSchema = z.object({
  poNumber: z.string().min(1, "PO number is required"),
  date: z.date(),
  supplierId: z.string().min(1, "Supplier is required"),
  deliveryLocationId: z.string().min(1, "Delivery location is required"),
  expectedDeliveryDate: z.date().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        itemId: z.string().min(1, "Item is required"),
        quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
        unitPrice: z.coerce
          .number()
          .min(0.01, "Unit price must be greater than 0"),
        taxRate: z.coerce.number().min(0, "Tax rate cannot be negative"),
      })
    )
    .min(1, "At least one item is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface PurchaseOrderFormProps {
  suppliers: Supplier[];
  locations: Location[];
  items: Item[];
  poNumber: string;
}

export function PurchaseOrderForm({
  suppliers,
  locations,
  items,
  poNumber,
}: PurchaseOrderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      poNumber,
      date: new Date(),
      supplierId: "",
      deliveryLocationId: "",
      expectedDeliveryDate: new Date(),
      paymentTerms: "",
      notes: "",
      lines: [
        {
          itemId: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 0.08, // Default tax rate
        },
      ],
    },
  });

  // Watch form values for calculations
  const watchedLines = form.watch("lines");

  // Calculate line totals and order summary
  const calculateLineTotals = () => {
    return watchedLines.map((line) => {
      const quantity = line.quantity || 0;
      const unitPrice = line.unitPrice || 0;
      const taxRate = line.taxRate || 0;

      const lineSubtotal = quantity * unitPrice;
      const lineTaxAmount = lineSubtotal * taxRate;
      const lineTotal = lineSubtotal + lineTaxAmount;

      return {
        subtotal: lineSubtotal,
        taxAmount: lineTaxAmount,
        total: lineTotal,
      };
    });
  };

  const lineTotals = calculateLineTotals();

  const orderSubtotal = lineTotals.reduce(
    (sum, line) => sum + line.subtotal,
    0
  );
  const orderTaxAmount = lineTotals.reduce(
    (sum, line) => sum + line.taxAmount,
    0
  );
  const orderTotal = lineTotals.reduce((sum, line) => sum + line.total, 0);

  // Add a new line
  const addLine = () => {
    const currentLines = form.getValues("lines");
    form.setValue("lines", [
      ...currentLines,
      {
        itemId: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 0.08, // Default tax rate
      },
    ]);
  };

  // Remove a line
  const removeLine = (index: number) => {
    const currentLines = form.getValues("lines");
    if (currentLines.length > 1) {
      form.setValue(
        "lines",
        currentLines.filter((_, i) => i !== index)
      );
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Convert suppliers to options format for SearchableSelect
  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier.id,
    label: supplier.name,
  }));

  // Convert locations to options format for SearchableSelect
  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: location.name,
  }));

  // Convert items to options format for SearchableSelect
  const itemOptions = items.map((item) => ({
    value: item.id,
    label: item.name,
    description: item.sku,
  }));

  // Handle form submission
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      // Calculate totals for each line and the entire order
      const lines = data.lines.map((line, index) => {
        const subtotal = line.quantity * line.unitPrice;
        const taxAmount = subtotal * line.taxRate;
        const total = subtotal + taxAmount;

        return {
          ...line,
          subtotal,
          taxAmount,
          total,
        };
      });

      const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
      const taxAmount = lines.reduce((sum, line) => sum + line.taxAmount, 0);
      const total = lines.reduce((sum, line) => sum + line.total, 0);

      // Create the purchase order
      const result = await createPurchaseOrder({
        poNumber: data.poNumber,
        date: data.date,
        supplierId: data.supplierId,
        deliveryLocationId: data.deliveryLocationId,
        expectedDeliveryDate: data.expectedDeliveryDate ?? new Date(),
        paymentTerms: data.paymentTerms ?? "",
        notes: data.notes ?? "",
        subtotal,
        taxAmount,
        total,
        lines,
      });
      toast.success("Purchase Order Created Successfully");

      // Redirect to the purchase order detail page
      router.push(`/dashboard/purchases/purchase-orders`);
      router.refresh();
    } catch (error) {
      console.error("Failed to create purchase order:", error);
      toast.error("Failed to Create PO");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="poNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Number</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Order Date</FormLabel>
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
                            selected={field.value}
                            onSelect={field.onChange}
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
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={supplierOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Search and select a supplier"
                          emptyMessage="No suppliers found"
                          clearable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryLocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Location</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={locationOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Search and select a location"
                          emptyMessage="No locations found"
                          clearable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="expectedDeliveryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expected Delivery Date</FormLabel>
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
                            onSelect={field.onChange}
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
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Net 30" />
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
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes for this order"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Order Items</h3>

          <div className="border rounded-md overflow-hidden mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="w-[100px]">Quantity</TableHead>
                  <TableHead className="w-[150px]">Unit Price</TableHead>
                  <TableHead className="w-[100px]">Tax Rate</TableHead>
                  <TableHead className="w-[150px]">Subtotal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchedLines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`lines.${index}.itemId`}
                        render={({ field }) => (
                          <FormItem className="space-y-0 mb-0">
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
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`lines.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="space-y-0 mb-0">
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`lines.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem className="space-y-0 mb-0">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
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
                        name={`lines.${index}.taxRate`}
                        render={({ field }) => (
                          <FormItem className="space-y-0 mb-0">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(lineTotals[index]?.subtotal || 0)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(index)}
                        disabled={watchedLines.length <= 1}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addLine}
            className="mb-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>

          <div className="flex flex-col gap-2 ml-auto w-full md:w-1/3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatCurrency(orderSubtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax:</span>
              <span>{formatCurrency(orderTaxAmount)}</span>
            </div>

            <Separator />

            <div className="flex justify-between font-medium text-lg">
              <span>Total:</span>
              <span>{formatCurrency(orderTotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Purchase Order
          </Button>
        </div>
      </form>
    </Form>
  );
}
