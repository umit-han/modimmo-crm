import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Mail,
  FileText,
  Package,
  CreditCard,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PurchaseOrderStatusBadge } from "../components/purchase-status-badge";
import { PurchaseOrderLineItems } from "../components/line-items";
import { getPurchaseOrder } from "@/actions/purchase-orders";
import { formatCurrency, formatDate } from "@/lib/formatData";

interface PurchaseOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PurchaseOrderDetailPage({
  params,
}: PurchaseOrderDetailPageProps) {
  const { id } = await params;
  const purchaseOrder = await getPurchaseOrder(id);
  if (!purchaseOrder) {
    notFound();
  }

  return (
    <div className="container py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/purchase-orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Orders
          </Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {purchaseOrder.poNumber}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <PurchaseOrderStatusBadge status={purchaseOrder.status} />
            <span className="text-muted-foreground">
              Created on {formatDate(purchaseOrder.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Send Mail shshsh
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            PDF/Print
          </Button>
          <Button variant="outline" size="sm">
            <Package className="h-4 w-4 mr-2" />
            Receive
          </Button>
          <Button variant="outline" size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            Convert to Bill
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Mark as Approved</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Vendor Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="font-medium">{purchaseOrder.supplier.name}</p>
              <p>{purchaseOrder.supplier.contactPerson}</p>
              <p>{purchaseOrder.supplier.address}</p>
              {purchaseOrder.supplier.address && (
                <p>{purchaseOrder.supplier.address}</p>
              )}
              {purchaseOrder.supplier.phone && (
                <p>{purchaseOrder.supplier.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-1 text-sm">
              <dt className="font-medium">PO Number:</dt>
              <dd>{purchaseOrder.poNumber}</dd>

              <dt className="font-medium">Order Date:</dt>
              <dd>{formatDate(purchaseOrder.date)}</dd>

              {purchaseOrder.expectedDeliveryDate && (
                <>
                  <dt className="font-medium">Delivery Date:</dt>
                  <dd>{formatDate(purchaseOrder.expectedDeliveryDate)}</dd>
                </>
              )}

              <dt className="font-medium">Delivery Location:</dt>
              <dd>{purchaseOrder.deliveryLocation.name}</dd>

              {purchaseOrder.paymentTerms && (
                <>
                  <dt className="font-medium">Payment Terms:</dt>
                  <dd>{purchaseOrder.paymentTerms}</dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Line Items</h2>
        <PurchaseOrderLineItems lines={purchaseOrder.lines} />
      </div>

      <div className="flex justify-end">
        <div className="w-full max-w-xs">
          <div className="bg-muted/40 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(purchaseOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span>{formatCurrency(purchaseOrder.taxAmount)}</span>
              </div>
              {purchaseOrder.shippingCost && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>{formatCurrency(purchaseOrder.shippingCost)}</span>
                </div>
              )}
              {purchaseOrder.discount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount:</span>
                  <span>-{formatCurrency(purchaseOrder.discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatCurrency(purchaseOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {purchaseOrder.notes && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Notes</h2>
          <div className="bg-muted/40 rounded-lg p-4">
            <p className="text-sm whitespace-pre-line">{purchaseOrder.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
