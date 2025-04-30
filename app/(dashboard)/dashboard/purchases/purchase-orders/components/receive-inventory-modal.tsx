"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

import { usePurchaseOrderItems } from "@/hooks/usePurchaseOrderQueries";
import { createGoodsReceipt } from "@/actions/goods-receipt";

// Define types based on your Prisma schema
type PurchaseOrderLine = {
  id: string;
  itemId: string;
  item: {
    id: string;
    name: string;
    sku: string;
  };
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discount?: number | null;
  total: number;
  receivedQuantity: number;
};

type ReceiptFormValues = {
  lines: {
    purchaseOrderLineId: string;
    itemId: string;
    receivedQuantity: number;
    notes?: string;
  }[];
  notes?: string;
  locationId: string;
};

interface ReceiveInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  locationId: string;
}

const formSchema = z.object({
  lines: z.array(
    z.object({
      purchaseOrderLineId: z.string(),
      itemId: z.string(),
      receivedQuantity: z.number().min(0),
      notes: z.string().optional(),
    })
  ),
  notes: z.string().optional(),
  locationId: z.string(),
});

export function ReceiveInventoryModal({
  isOpen,
  onClose,
  purchaseOrderId,
  purchaseOrderNumber,
  locationId,
}: ReceiveInventoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const { lines = [], isLoading } = usePurchaseOrderItems(purchaseOrderId);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Initialize form with purchase order lines
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReceiptFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lines: [],
      notes: "",
      locationId,
    },
  });

  // Update form values when lines change
  useState(() => {
    if (lines.length > 0) {
      setValue(
        "lines",
        lines.map((line) => ({
          purchaseOrderLineId: line.id,
          itemId: line.itemId,
          receivedQuantity: 0,
          notes: "",
        }))
      );
    }
  });

  const onSubmit = async (data: ReceiptFormValues) => {
    if (!session?.user?.id) {
      toast.error("User not authenticated");
      return;
    }
    setIsSubmitting(true);

    try {
      // Filter out lines with zero received quantity
      const filteredLines = data.lines.filter(
        (line) => line.receivedQuantity > 0
      );

      if (filteredLines.length === 0) {
        toast.error("Please enter at least one received quantity");
        setIsSubmitting(false);
        return;
      }

      const result = await createGoodsReceipt({
        purchaseOrderId,
        locationId: data.locationId,
        notes: data.notes || "",
        receivedById: session.user.id,
        lines: filteredLines,
      });

      if (result.success) {
        toast.success("Inventory received successfully");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Failed to receive inventory");
      }
    } catch (error) {
      console.error("Error receiving inventory:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receive Inventory</DialogTitle>
          <DialogDescription>
            Purchase Order: {purchaseOrderNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Ordered</TableHead>
                    <TableHead className="text-right">
                      Previously Received
                    </TableHead>
                    <TableHead className="text-right">Receive Now</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.length > 0 ? (
                    lines.map((line, index) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <div className="font-medium">{line.item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {line.item.sku}
                          </div>
                          <input
                            type="hidden"
                            {...register(`lines.${index}.purchaseOrderLineId`)}
                            value={line.id}
                          />
                          <input
                            type="hidden"
                            {...register(`lines.${index}.itemId`)}
                            value={line.itemId}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {line.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              line.receivedQuantity === line.quantity
                                ? "text-green-600"
                                : ""
                            }
                          >
                            {line.receivedQuantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            className="w-20 text-right ml-auto"
                            min={0}
                            max={line.quantity - line.receivedQuantity}
                            {...register(`lines.${index}.receivedQuantity`, {
                              valueAsNumber: true,
                            })}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No items found for this purchase order
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this receipt"
                {...register("notes")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Receipt"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
