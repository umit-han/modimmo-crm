"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { usePurchaseOrderItems } from "@/hooks/usePurchaseOrderQueries";
import { useSession } from "next-auth/react";

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

interface PurchaseOrderLineTableProps {
  purchaseOrderId: string;
}

export function PurchaseOrderLineTable({
  purchaseOrderId,
}: PurchaseOrderLineTableProps) {
  const { lines = [], isLoading } = usePurchaseOrderItems(purchaseOrderId);
  const { data: session } = useSession();
  const user = session?.user;
  const companyName = user?.orgName ?? "";
  // const [isLoading, setIsLoading] = useState(true);
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Tax</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Received</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.length > 0 ? (
            lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>
                  <div className="font-medium">{line.item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {line.item.sku}
                  </div>
                </TableCell>
                <TableCell className="text-right">{line.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(line.unitPrice)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(line.taxAmount)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(line.total)}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      line.receivedQuantity === line.quantity
                        ? "text-green-600"
                        : ""
                    }
                  >
                    {line.receivedQuantity} / {line.quantity}
                  </span>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-6 text-muted-foreground"
              >
                No items found for this purchase order
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
