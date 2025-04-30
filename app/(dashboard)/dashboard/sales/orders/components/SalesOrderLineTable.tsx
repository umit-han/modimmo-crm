"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useSalesOrderItems } from "@/hooks/useSalesOrdersQueries";

// Define types based on your Prisma schema
type SalesOrderLine = {
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
  serialNumbers: string[];
};

interface SalesOrderLineTableProps {
  salesOrderId: string;
}

export function SalesOrderLineTable({
  salesOrderId,
}: SalesOrderLineTableProps) {
  const { data, isLoading } = useSalesOrderItems(salesOrderId);
  const lines = data?.lines || [];
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
            {lines.some((line) => line.discount) && (
              <TableHead className="text-right">Discount</TableHead>
            )}
            <TableHead className="text-right">Total</TableHead>
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
                  {line.serialNumbers.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Serial: {line.serialNumbers.join(", ")}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">{line.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(line.unitPrice)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(line.taxAmount)}
                  <div className="text-xs text-muted-foreground">
                    ({line.taxRate}%)
                  </div>
                </TableCell>
                {lines.some((line) => line.discount) && (
                  <TableCell className="text-right">
                    {line.discount ? formatCurrency(line.discount) : "-"}
                  </TableCell>
                )}
                <TableCell className="text-right font-medium">
                  {formatCurrency(line.total)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={lines.some((line) => line.discount) ? 6 : 5}
                className="text-center py-6 text-muted-foreground"
              >
                No items found for this sales order
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
