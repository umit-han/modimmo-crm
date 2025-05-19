"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit,
  Mail,
  FileText,
  MoreVertical,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  User,
  Phone,
  MapPin,
  Mail as MailIcon,
  Calendar,
  CreditCard,
  Download,
  Printer,
  FileUp,
} from "lucide-react";

import {
  useSalesOrder,
  useUpdateSalesOrderStatus,
  useUpdatePaymentStatus,
} from "@/hooks/useSalesOrdersQueries";
import { SalesOrderLineTable } from "./SalesOrderLineTable";
import InvoiceButton from "./InvoiceButton";

interface SalesOrderDetailViewProps {
  salesOrderId: string;
  userId: string;
}

export default function SalesOrderDetailView({
  salesOrderId,
  userId,
}: SalesOrderDetailViewProps) {
  const router = useRouter();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [markAsShippedDialogOpen, setMarkAsShippedDialogOpen] = useState(false);
  const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);

  // Fetch sales order data
  const { data: salesOrder, isLoading, error } = useSalesOrder(salesOrderId);

  // Mutations
  const updateStatusMutation = useUpdateSalesOrderStatus();
  const updatePaymentStatusMutation = useUpdatePaymentStatus();

  // Handle sending invoice email
  const handleSendEmail = async () => {
    if (!salesOrder?.customer?.email) {
      toast.error("Customer has no email address");
      return;
    }

    toast.success(
      `Invoice for ${salesOrder.orderNumber} sent to ${salesOrder.customer.email}`
    );
  };

  // Handle status updates
  const handleStatusUpdate = async (status: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId: salesOrderId,
        status,
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  // Handle payment status updates
  const handlePaymentStatusUpdate = async (paymentStatus: string) => {
    try {
      await updatePaymentStatusMutation.mutateAsync({
        orderId: salesOrderId,
        paymentStatus,
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    return format(new Date(date), "MMM dd, yyyy");
  };

  // Get status badge
  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;

    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "CONFIRMED":
        return <Badge variant="info">Confirmed</Badge>;
      case "PROCESSING":
        return <Badge variant="warning">Processing</Badge>;
      case "SHIPPED":
        return <Badge variant="secondary">Shipped</Badge>;
      case "DELIVERED":
        return <Badge variant="default">Delivered</Badge>;
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "RETURNED":
        return <Badge variant="destructive">Returned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;

    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      case "PARTIAL":
        return <Badge variant="warning">Partial</Badge>;
      case "PAID":
        return <Badge variant="success">Paid</Badge>;
      case "REFUNDED":
        return <Badge variant="info">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Determine available actions based on order status
  const canEdit = salesOrder?.status === "DRAFT";
  const canCancel =
    salesOrder && !["CANCELLED", "COMPLETED"].includes(salesOrder.status);
  const canComplete = salesOrder?.status === "DELIVERED";
  const canShip = ["CONFIRMED", "PROCESSING"].includes(
    salesOrder?.status ?? ""
  );
  const canMarkAsPaid = salesOrder?.paymentStatus !== "PAID";

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Show error state
  if (error || !salesOrder) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">
          Error Loading Sales Order
        </h2>
        <p className="text-muted-foreground mb-4">
          Unable to load the sales order details. Please try again.
        </p>
        <Button asChild>
          <Link href="/dashboard/sales/orders">Back to Sales Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with order info and actions */}
      <div className="p-4 md:p-6 border rounded-lg bg-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-2xl font-bold">{salesOrder.orderNumber}</h2>
              <div className="flex items-center gap-2">
                {getStatusBadge(salesOrder.status)}
                {getPaymentStatusBadge(salesOrder.paymentStatus)}
              </div>
            </div>
            <p className="text-muted-foreground mt-1">
              {salesOrder.customer?.name || "No Customer"} •{" "}
              {formatDate(salesOrder.date)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Button variant="outline" size="sm" className="h-9" asChild>
                <Link href={`/dashboard/sales/orders/${salesOrderId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}

            {salesOrder.customer?.email && (
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={handleSendEmail}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Invoice
              </Button>
            )}

            <InvoiceButton orderId={salesOrder.id} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canShip && (
                  <DropdownMenuItem
                    onClick={() => setMarkAsShippedDialogOpen(true)}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Mark as Shipped
                  </DropdownMenuItem>
                )}

                {canComplete && (
                  <DropdownMenuItem onClick={() => setCompleteDialogOpen(true)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Order
                  </DropdownMenuItem>
                )}

                {canMarkAsPaid && (
                  <DropdownMenuItem
                    onClick={() => setMarkAsPaidDialogOpen(true)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => toast.success("Print function triggered")}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => toast.success("Export function triggered")}
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {canCancel && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Customer and Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Card */}
        <Card className="overflow-hidden border">
          <div className="bg-blue-50 border-l-4 border-blue-500">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="flex items-center text-blue-700 font-semibold">
                <User className="w-5 h-5 mr-2" />
                Customer Details
              </CardTitle>
            </CardHeader>
          </div>
          <CardContent className="pt-4">
            <div className="text-sm space-y-3">
              <p className="font-medium text-base">
                {salesOrder.customer?.name || "No Customer Assigned"}
              </p>

              {salesOrder.customer?.address && (
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                  <p className="text-gray-600">{salesOrder.customer.address}</p>
                </div>
              )}

              {salesOrder.customer?.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                  <p className="text-gray-600">{salesOrder.customer.phone}</p>
                </div>
              )}

              {salesOrder.customer?.email && (
                <div className="flex items-center text-gray-600">
                  <MailIcon className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                  <p className="text-gray-600">{salesOrder.customer.email}</p>
                </div>
              )}

              {!salesOrder.customer && (
                <p className="text-muted-foreground italic">
                  This is a walk-in customer order without specific customer
                  details.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Details Card */}
        <Card className="overflow-hidden border">
          <div className="bg-purple-50 border-l-4 border-purple-500">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="flex items-center text-purple-700 font-semibold">
                <FileText className="w-5 h-5 mr-2" />
                Order Details
              </CardTitle>
            </CardHeader>
          </div>
          <CardContent className="pt-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <Calendar className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                <div>
                  <span className="text-gray-600 font-medium">Order Date:</span>
                  <span className="ml-2">{formatDate(salesOrder.date)}</span>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                <div>
                  <span className="text-gray-600 font-medium">Location:</span>
                  <span className="ml-2">{salesOrder.location.name}</span>
                </div>
              </div>

              {salesOrder.paymentMethod && (
                <div className="flex items-start">
                  <CreditCard className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                  <div>
                    <span className="text-gray-600 font-medium">
                      Payment Method:
                    </span>
                    <span className="ml-2">{salesOrder.paymentMethod}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <User className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                <div>
                  <span className="text-gray-600 font-medium">Created By:</span>
                  <span className="ml-2">
                    {salesOrder.createdBy.name || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesOrderLineTable salesOrderId={salesOrderId} />
        </CardContent>
      </Card>

      {/* Order Notes */}
      {salesOrder.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{salesOrder.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 ml-auto w-full md:w-1/3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatCurrency(salesOrder.subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax:</span>
              <span>{formatCurrency(salesOrder.taxAmount)}</span>
            </div>

            {salesOrder.shippingCost !== null &&
              salesOrder.shippingCost !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>{formatCurrency(salesOrder.shippingCost)}</span>
                </div>
              )}

            {salesOrder.discount !== null &&
              salesOrder.discount !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount:</span>
                  <span>-{formatCurrency(salesOrder.discount)}</span>
                </div>
              )}

            <Separator />

            <div className="flex justify-between font-medium text-lg">
              <span>Total:</span>
              <span>{formatCurrency(salesOrder.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs for confirmations */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleStatusUpdate("CANCELLED")}
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this order as completed? This typically means the order has
              been delivered and the transaction is finished.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleStatusUpdate("COMPLETED")}>
              Complete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={markAsShippedDialogOpen}
        onOpenChange={setMarkAsShippedDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Shipped</AlertDialogTitle>
            <AlertDialogDescription>
              Update this order's status to "Shipped"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleStatusUpdate("SHIPPED")}>
              Mark as Shipped
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={markAsPaidDialogOpen}
        onOpenChange={setMarkAsPaidDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Paid</AlertDialogTitle>
            <AlertDialogDescription>
              Update this order's payment status to "Paid"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handlePaymentStatusUpdate("PAID")}
            >
              Mark as Paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
