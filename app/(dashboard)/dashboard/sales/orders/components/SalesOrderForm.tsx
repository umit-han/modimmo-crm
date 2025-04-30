"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  Trash2,
  Plus,
  Loader2,
  ArrowLeft,
  Calculator,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createSalesOrder } from "@/actions/sales-orders";
import { SearchableSelect } from "@/components/ui/searchable-select";

// Define form schema with zod
const lineItemSchema = z.object({
  id: z.string(),
  itemId: z.string().min(1, "Item is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative"),
  taxAmount: z.coerce.number(),
  discount: z.coerce.number().min(0, "Discount cannot be negative").optional(),
  total: z.coerce.number(),
  serialNumbers: z.array(z.string()).optional(),
});

const salesOrderSchema = z.object({
  date: z.date({ required_error: "Date is required" }),
  customerId: z.string(),
  locationId: z.string().min(1, "Location is required"),
  paymentMethod: z.string().optional(),
  shippingCost: z.coerce
    .number()
    .min(0, "Shipping cost cannot be negative")
    .optional(),
  discount: z.coerce.number().min(0, "Discount cannot be negative").optional(),
  notes: z.string().optional(),
  lines: z.array(lineItemSchema).min(1, "At least one item is required"),
});

// Types
type Item = {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
};

type Customer = {
  id: string;
  name: string;
};

type Location = {
  id: string;
  name: string;
};

interface SalesOrderFormProps {
  items: Item[];
  customers: Customer[];
  locations: Location[];
  userId: string;
  orgId: string;
  initialCustomerId?: string;
}

export function SalesOrderForm({
  items,
  customers,
  locations,
  userId,
  orgId,
  initialCustomerId,
}: SalesOrderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Initialize form
  const form = useForm<z.infer<typeof salesOrderSchema>>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      date: new Date(),
      customerId: initialCustomerId || "",
      locationId: locations.length > 0 ? locations[0].id : "",
      paymentMethod: "",
      shippingCost: 0,
      discount: 0,
      notes: "",
      lines: [
        {
          id: uuidv4(),
          itemId: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 0,
          taxAmount: 0,
          discount: 0,
          total: 0,
          serialNumbers: [],
        },
      ],
    },
  });

  // Setup field array for line items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Watch form fields for calculations
  const watchedLines = form.watch("lines");
  const watchedShippingCost = form.watch("shippingCost") || 0;
  const watchedDiscount = form.watch("discount") || 0;

  // Recalculate totals when line items change
  useEffect(() => {
    calculateTotals();
  }, [watchedLines, watchedShippingCost, watchedDiscount]);

  // Calculate totals
  const calculateTotals = () => {
    let calculatedSubtotal = 0;
    let calculatedTax = 0;

    // Calculate line totals
    watchedLines.forEach((line) => {
      const lineSubtotal = line.quantity * line.unitPrice;
      const lineDiscount = line.discount || 0;
      const lineTaxable = lineSubtotal - lineDiscount;
      const lineTax = (lineTaxable * line.taxRate) / 100;

      calculatedSubtotal += lineSubtotal;
      calculatedTax += lineTax;

      // Update tax amount in the form
      const index = watchedLines.findIndex((l) => l.id === line.id);
      if (index !== -1) {
        form.setValue(
          `lines.${index}.taxAmount`,
          parseFloat(lineTax.toFixed(2))
        );
        form.setValue(
          `lines.${index}.total`,
          parseFloat((lineSubtotal - lineDiscount + lineTax).toFixed(2))
        );
      }
    });

    setSubtotal(calculatedSubtotal);
    setTotalTax(calculatedTax);

    // Calculate grand total
    const total =
      calculatedSubtotal +
      calculatedTax +
      watchedShippingCost -
      watchedDiscount;
    setGrandTotal(total);
  };

  // Handle adding a new line item
  const addLineItem = () => {
    append({
      id: uuidv4(),
      itemId: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      total: 0,
      serialNumbers: [],
    });
  };

  // Handle item selection in a line
  const handleItemSelect = (itemId: string, index: number) => {
    const selectedItem = items.find((item) => item.id === itemId);
    if (selectedItem) {
      form.setValue(`lines.${index}.unitPrice`, selectedItem.sellingPrice);
      // Recalculate line total
      const quantity = form.getValues(`lines.${index}.quantity`);
      const discount = form.getValues(`lines.${index}.discount`) || 0;
      const taxRate = form.getValues(`lines.${index}.taxRate`);

      const subtotal = quantity * selectedItem.sellingPrice;
      const taxable = subtotal - discount;
      const tax = (taxable * taxRate) / 100;

      form.setValue(`lines.${index}.taxAmount`, parseFloat(tax.toFixed(2)));
      form.setValue(
        `lines.${index}.total`,
        parseFloat((subtotal - discount + tax).toFixed(2))
      );
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof salesOrderSchema>) => {
    setIsSubmitting(true);

    try {
      const result = await createSalesOrder({
        date: values.date,
        customerId: values.customerId,
        locationId: values.locationId,
        status: "DRAFT", // Default status for new orders
        paymentStatus: "PENDING", // Default payment status
        paymentMethod: values.paymentMethod,
        subtotal,
        taxAmount: totalTax,
        shippingCost: values.shippingCost,
        discount: values.discount,
        total: grandTotal,
        notes: values.notes,
        userId,
        orgId,
        lines: values.lines.map((line) => ({
          itemId: line.itemId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          taxAmount: line.taxAmount,
          discount: line.discount,
          total: line.total,
          serialNumbers: line.serialNumbers || [],
        })),
      });

      if (result.success) {
        toast.success("Sales order created successfully");
        router.push("/dashboard/sales/orders");
      } else {
        toast.error(result.error || "Failed to create sales order");
      }
    } catch (error) {
      console.error("Error creating sales order:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create options lists for selects
  const customerOptions = customers.map((customer) => ({
    label: customer.name,
    value: customer.id,
  }));

  const locationOptions = locations.map((location) => ({
    label: location.name,
    value: location.id,
  }));

  const itemOptions = items.map((item) => ({
    label: `${item.name} (${item.sku})`,
    value: item.id,
  }));

  const paymentMethodOptions = [
    { label: "Cash", value: "CASH" },
    { label: "Credit Card", value: "CREDIT_CARD" },
    { label: "Bank Transfer", value: "BANK_TRANSFER" },
    { label: "Check", value: "CHECK" },
    { label: "Mobile Money", value: "MOBILE_MONEY" },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* Order Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>
                Enter the basic order information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? new Date(field.value)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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

                {/* Customer */}
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer (Optional)</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <SearchableSelect
                            placeholder="Select customer"
                            options={customerOptions}
                            value={field.value}
                            onValueChange={field.onChange}
                            emptyMessage="No customers found"
                            clearable
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="flex-shrink-0"
                          onClick={() => {
                            // This would open a modal to create a new customer
                            alert(
                              "Create new customer functionality would go here"
                            );
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Method */}
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethodOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about this order"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Line Items Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>Add items to this order</CardDescription>
              </div>
              <Button
                type="button"
                onClick={addLineItem}
                size="sm"
                className="mt-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="w-[100px]">Quantity</TableHead>
                      <TableHead className="w-[130px]">Price</TableHead>
                      <TableHead className="w-[100px]">Tax (%)</TableHead>
                      <TableHead className="w-[130px]">Discount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-6 text-muted-foreground"
                        >
                          No items added. Click "Add Item" to start.
                        </TableCell>
                      </TableRow>
                    ) : (
                      fields.map((field, index) => (
                        <TableRow key={field.id}>
                          {/* Item */}
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`lines.${index}.itemId`}
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <SearchableSelect
                                      placeholder="Select item"
                                      options={itemOptions}
                                      value={field.value}
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                        handleItemSelect(value, index);
                                      }}
                                      emptyMessage="No items found"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          {/* Quantity */}
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
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(
                                          parseInt(e.target.value)
                                        );
                                        calculateTotals();
                                      }}
                                      className="w-full"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          {/* Unit Price */}
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`lines.${index}.unitPrice`}
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(
                                          parseFloat(e.target.value)
                                        );
                                        calculateTotals();
                                      }}
                                      className="w-full"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          {/* Tax Rate */}
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`lines.${index}.taxRate`}
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      step="0.1"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(
                                          parseFloat(e.target.value)
                                        );
                                        calculateTotals();
                                      }}
                                      className="w-full"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          {/* Discount */}
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`lines.${index}.discount`}
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      step="0.01"
                                      value={field.value || 0}
                                      onChange={(e) => {
                                        field.onChange(
                                          parseFloat(e.target.value)
                                        );
                                        calculateTotals();
                                      }}
                                      className="w-full"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          {/* Line Total */}
                          <TableCell className="text-right font-medium">
                            {formatCurrency(watchedLines[index]?.total || 0)}
                          </TableCell>

                          {/* Delete Button */}
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              disabled={fields.length <= 1}
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>{formatCurrency(totalTax)}</span>
                </div>

                {/* Shipping Cost */}
                <FormField
                  control={form.control}
                  name="shippingCost"
                  render={({ field }) => (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Shipping:</span>
                      <FormItem className="space-y-0 w-24">
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={field.value || 0}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value) || 0);
                              calculateTotals();
                            }}
                            className="text-right"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </div>
                  )}
                />

                {/* Order Discount */}
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Discount:</span>
                      <FormItem className="space-y-0 w-24">
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={field.value || 0}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value) || 0);
                              calculateTotals();
                            }}
                            className="text-right"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </div>
                  )}
                />

                <Separator />

                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/sales/orders")}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => calculateTotals()}
                  disabled={isSubmitting}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Recalculate
                </Button>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Order"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
}
