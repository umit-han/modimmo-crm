"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Printer, Download, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SalesOrderItem {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discount?: number | null;
  total: number;
  item: {
    name: string;
    sku: string;
  };
}

interface SalesOrderData {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  source: string;
  customer: {
    id: string;
    name: string;
  } | null;
  location: {
    id: string;
    name: string;
  };
  subtotal: number;
  taxAmount: number;
  shippingCost: number | null;
  discount: number | null;
  total: number;
  notes: string | null;
  lines: SalesOrderItem[];
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface SalesReceiptProps {
  data: SalesOrderData;
  orgName: string;
}

export function SalesReceipt({ data, orgName }: SalesReceiptProps) {
  const router = useRouter();
  const [isPrinting, setIsPrinting] = useState(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Handle print
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  // Status badges
  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant:
          | "default"
          | "outline"
          | "secondary"
          | "destructive"
          | "success";
      }
    > = {
      DRAFT: { label: "Draft", variant: "outline" },
      CONFIRMED: { label: "Confirmed", variant: "secondary" },
      PROCESSING: { label: "Processing", variant: "secondary" },
      SHIPPED: { label: "Shipped", variant: "secondary" },
      DELIVERED: { label: "Delivered", variant: "success" },
      COMPLETED: { label: "Completed", variant: "success" },
      CANCELLED: { label: "Cancelled", variant: "destructive" },
      RETURNED: { label: "Returned", variant: "destructive" },
    };

    const config = statusMap[status] || { label: status, variant: "default" };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant:
          | "default"
          | "outline"
          | "secondary"
          | "destructive"
          | "success";
      }
    > = {
      PENDING: { label: "Pending", variant: "outline" },
      PARTIAL: { label: "Partial", variant: "secondary" },
      PAID: { label: "Paid", variant: "success" },
      REFUNDED: { label: "Refunded", variant: "destructive" },
    };

    const config = statusMap[status] || { label: status, variant: "default" };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="flex flex-col space-y-6 print:space-y-2 max-w-4xl mx-auto">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint} disabled={isPrinting}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.info("Download functionality would be implemented here")
            }
          >
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.info("Share functionality would be implemented here")
            }
          >
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      {/* Receipt */}
      <Card className="print:shadow-none print:border-none">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold mb-1">
                {data.source === "POS" ? "Receipt" : "Sales Order"}
              </CardTitle>
              <CardDescription>Order #{data.orderNumber}</CardDescription>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">{orgName}</h2>
              <p className="text-sm text-muted-foreground">
                {data.location.name}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6 print:space-y-3">
          {/* Order Details */}
          <div className="grid grid-cols-2 gap-6 print:gap-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Date
              </h3>
              <p>{format(new Date(data.date), "PPP")}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Status
              </h3>
              <div className="flex space-x-2">
                {getStatusBadge(data.status)}
                {getPaymentStatusBadge(data.paymentStatus)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Customer
              </h3>
              <p>{data.customer ? data.customer.name : "Walk-in Customer"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Payment Method
              </h3>
              <p>{data.paymentMethod || "Not specified"}</p>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-medium mb-2">Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{line.item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {line.item.sku}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {line.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(line.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(line.taxAmount)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(line.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Order Summary */}
          <div className="flex justify-end">
            <div className="w-72">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(data.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>{formatCurrency(data.taxAmount)}</span>
                </div>
                {data.shippingCost ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span>{formatCurrency(data.shippingCost)}</span>
                  </div>
                ) : null}
                {data.discount ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount:</span>
                    <span>-{formatCurrency(data.discount)}</span>
                  </div>
                ) : null}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(data.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-1">Notes</h3>
                <p className="text-sm text-muted-foreground">{data.notes}</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="border-t text-sm text-muted-foreground print:pt-2">
          <div className="w-full flex flex-col space-y-1 items-center text-center">
            <p>Created by {data.createdBy.name}</p>
            <p>{format(new Date(data.createdAt), "PPPp")}</p>
            <p className="mt-2">Thank you for your business!</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
