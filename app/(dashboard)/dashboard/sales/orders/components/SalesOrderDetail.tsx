"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Edit,
  Mail,
  FileText,
  ShoppingBag,
  FileUp,
  CheckCircle,
  XCircle,
  MoreVertical,
  Printer,
  User,
  Calendar,
  Phone,
  Clock,
  CreditCard,
  MapPin,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatData";
import { toast } from "sonner";

import { useSession } from "next-auth/react";

import { SalesOrderLineTable } from "./SalesOrderLineTable";
import { useSalesOrderItems } from "@/hooks/useSalesOrdersQueries";
import { sendSalesOrderEmail } from "@/actions/sales-orders";
import InvoiceButton from "./InvoiceButton";

// Define types based on your Prisma schema
type SalesOrder = {
  id: string;
  orderNumber: string;
  date: Date;
  customerId: string | null;
  locationId: string;
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  } | null;
  location: {
    id: string;
    name: string;
  };
  status:
    | "DRAFT"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "RETURNED";
  paymentStatus: "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";
  paymentMethod: string | null;
  subtotal: number;
  taxAmount: number;
  shippingCost: number | null;
  discount: number | null;
  total: number;
  notes: string | null;
  createdBy: {
    name: string | null;
  };
  createdAt: Date;
};

interface SalesOrderDetailProps {
  salesOrder: SalesOrder;
}

export function SalesOrderDetail({ salesOrder }: SalesOrderDetailProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: SalesOrder["status"]) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge variant="outline" className="text-base font-normal">
            Draft
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge variant="info" className="text-base font-normal">
            Confirmed
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge variant="warning" className="text-base font-normal">
            Processing
          </Badge>
        );
      case "SHIPPED":
        return (
          <Badge variant="secondary" className="text-base font-normal">
            Shipped
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge variant="default" className="text-base font-normal">
            Delivered
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="success" className="text-base font-normal">
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="text-base font-normal">
            Cancelled
          </Badge>
        );
      case "RETURNED":
        return (
          <Badge variant="destructive" className="text-base font-normal">
            Returned
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-base font-normal">
            {status}
          </Badge>
        );
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: SalesOrder["paymentStatus"]) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="text-base font-normal">
            Pending
          </Badge>
        );
      case "PARTIAL":
        return (
          <Badge variant="warning" className="text-base font-normal">
            Partial
          </Badge>
        );
      case "PAID":
        return (
          <Badge variant="success" className="text-base font-normal">
            Paid
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge variant="info" className="text-base font-normal">
            Refunded
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-base font-normal">
            {status}
          </Badge>
        );
    }
  };

  const { data: session } = useSession();
  const website = process.env.NEXT_PUBLIC_BASE_URL;
  const user = session?.user;
  const { data } = useSalesOrderItems(salesOrder.id);
  const lines = data?.lines || [];
  // Handle actions
  const handleSendEmail = async () => {
    if (!salesOrder.customer?.email) {
      toast.error("Customer has no email address");
      return;
    }

    setIsLoading(true);
    // Implement email sending logic
    const orderData = salesOrder;
    const companyInfo = {
      name: user?.orgName ?? "",
      email: "info@company.com",
      phone: "+1 123 456 7890",
      address: "123 Main St, City, Country",
      website: website,
    };
    const orderItems = lines;
    const data = {
      companyInfo,
      orderData,
      orderItems,
    };

    try {
      await sendSalesOrderEmail(data, salesOrder.customer.email);
      toast.success(`Email sent for Order: ${salesOrder.orderNumber}`);
    } catch (error) {
      console.log(error);
      toast.error(`Failed to send the email`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintPDF = () => {
    setIsLoading(true);
    // Implement PDF generation logic
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`PDF generated for Order: ${salesOrder.orderNumber}`);
    }, 1000);
  };

  // Check if actions are available based on status
  const canEdit = ["DRAFT"].includes(salesOrder.status);
  const canSendEmail =
    !["CANCELLED"].includes(salesOrder.status) && salesOrder.customer?.email;
  const canShip = ["CONFIRMED", "PROCESSING"].includes(salesOrder.status);
  const canComplete = ["DELIVERED"].includes(salesOrder.status);
  const canCancel = !["CANCELLED", "COMPLETED"].includes(salesOrder.status);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6 border-b bg-muted/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{salesOrder.orderNumber}</h2>
              {getStatusBadge(salesOrder.status)}
              {/* {getPaymentStatusBadge(salesOrder.paymentStatus)} */}
            </div>
            <p className="text-muted-foreground mt-1">
              {salesOrder.customer?.name || "No Customer"} •{" "}
              {format(new Date(salesOrder.date), "MMMM d, yyyy")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* {canEdit && (
              <Button variant="outline" size="sm" className="h-9">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )} */}

            {canSendEmail && (
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={handleSendEmail}
                disabled={isLoading}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isLoading ? "Sending..." : "Send Invoice"}
              </Button>
            )}

            <InvoiceButton orderId={salesOrder.id} />

            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {canShip && (
                  <DropdownMenuItem>
                    <Truck className="h-4 w-4 mr-2" />
                    Mark as Shipped
                  </DropdownMenuItem>
                )}

                {canComplete && (
                  <DropdownMenuItem>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Order
                  </DropdownMenuItem>
                )}

                {canCancel && (
                  <DropdownMenuItem className="text-destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <FileUp className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Customer Card */}
          <Card className="overflow-hidden border-0 transition-shadow duration-300 bg-white">
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
                  {salesOrder.customer?.name || "No Customer"}
                </p>
                {salesOrder.customer?.address && (
                  <div className="flex items-start text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                    <p className="text-gray-600">
                      {salesOrder.customer.address}
                    </p>
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
                    <Mail className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                    <p className="text-gray-600">{salesOrder.customer.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Details Card */}
          <Card className="overflow-hidden border-0 transition-shadow duration-300 bg-white">
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
                    <span className="text-gray-600 font-medium">
                      Order Date:
                    </span>
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
                    <span className="text-gray-600 font-medium">
                      Created By:
                    </span>
                    <span className="ml-2">
                      {salesOrder.createdBy.name || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Order Items</h3>
          <SalesOrderLineTable salesOrderId={salesOrder.id} />
        </div>

        {salesOrder.notes && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Notes</h3>
            <div className="p-3 bg-muted rounded-md text-sm">
              {salesOrder.notes}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 border-t bg-muted/10">
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
      </div>
    </div>
  );
}
