"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Edit,
  Mail,
  FileText,
  PackageCheck,
  FileUp,
  CheckCircle,
  XCircle,
  MoreVertical,
  Printer,
  Building2,
  Calendar,
  Phone,
  Clock,
  CreditCard,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PurchaseOrderLineTable } from "./purchase-order-line-table";
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
import { sendPurchaseOderEmail } from "@/actions/purchase-orders";
import { useSession } from "next-auth/react";
import { usePurchaseOrderItems } from "@/hooks/usePurchaseOrderQueries";
import { ReceiveInventoryButton } from "./receive-inventory-button";

// Define types based on your Prisma schema
type PurchaseOrder = {
  id: string;
  poNumber: string;
  date: Date;
  supplierId: string;
  deliveryLocationId: string;
  supplierName?: string | null;
  supplier: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "APPROVED"
    | "PARTIALLY_RECEIVED"
    | "RECEIVED"
    | "CANCELLED"
    | "CLOSED";
  subtotal: number;
  taxAmount: number;
  shippingCost?: number | null;
  discount?: number | null;
  total: number;
  notes?: string | null;
  paymentTerms?: string | null;
  expectedDeliveryDate?: Date | null;
  createdBy: {
    name: string | null;
  };
  createdAt: Date;
};

interface PurchaseOrderDetailProps {
  purchaseOrder: PurchaseOrder;
}

export function PurchaseOrderDetail({
  purchaseOrder,
}: PurchaseOrderDetailProps) {
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
  const getStatusBadge = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge variant="outline" className="text-base font-normal">
            Draft
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge variant="secondary" className="text-base font-normal">
            Submitted
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="default" className="text-base font-normal">
            Approved
          </Badge>
        );
      case "PARTIALLY_RECEIVED":
        return (
          <Badge className="bg-amber-500 text-base font-normal">
            Partially Received
          </Badge>
        );
      case "RECEIVED":
        return (
          <Badge className="bg-green-600 text-base font-normal">Received</Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="text-base font-normal">
            Cancelled
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge
            variant="default"
            className="bg-gray-500 text-base font-normal"
          >
            Closed
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
  const { lines = [] } = usePurchaseOrderItems(purchaseOrder.id);
  // Handle actions
  const handleSendEmail = async () => {
    setIsLoading(true);
    // Implement email sending logic
    const poData = purchaseOrder;
    const companyInfo = {
      name: user?.orgName ?? "",
      email: "desishub.info@gmail.com",
      phone: "+256 762 063",
      address: "Kireka Kampala Uganda",
      website: website,
    };
    const orderItems = lines;
    const data = {
      companyInfo,
      poData,
      orderItems,
    };
    try {
      await sendPurchaseOderEmail(data, purchaseOrder.supplier?.email ?? "");
      toast.success(`Email sent for PO: ${purchaseOrder.poNumber}`);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.error(`Failed to send the mail`);
    }
  };

  const handlePrintPDF = () => {
    setIsLoading(true);
    // Implement PDF generation logic
    setTimeout(() => {
      setIsLoading(false);
      alert(`PDF generated for PO: ${purchaseOrder.poNumber}`);
    }, 1000);
  };

  const handleReceive = () => {
    setIsLoading(true);
    // Implement receive logic
    setTimeout(() => {
      setIsLoading(false);
      alert(`Redirecting to receive page for PO: ${purchaseOrder.poNumber}`);
    }, 1000);
  };

  // Check if actions are available based on status
  const canEdit = ["DRAFT"].includes(purchaseOrder.status);
  const canSendEmail = !["CANCELLED"].includes(purchaseOrder.status);
  const canReceive = ["SUBMITTED", "PARTIALLY_RECEIVED"].includes(
    purchaseOrder.status
  );
  const canApprove = ["SUBMITTED"].includes(purchaseOrder.status);
  const canCancel = !["CANCELLED", "CLOSED"].includes(purchaseOrder.status);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6 border-b bg-muted/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{purchaseOrder.poNumber}</h2>
              {getStatusBadge(purchaseOrder.status)}
            </div>
            <p className="text-muted-foreground mt-1">
              {purchaseOrder.supplier.name} •{" "}
              {format(new Date(purchaseOrder.date), "MMMM d, yyyy")}
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
                {isLoading ? "Sending..." : "Send Mail"}
              </Button>
            )}

            {/* <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={handlePrintPDF}
              disabled={isLoading}
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF/Print
            </Button> */}

            <ReceiveInventoryButton
              purchaseOrderId={purchaseOrder.id}
              purchaseOrderNumber={purchaseOrder.poNumber}
              locationId={purchaseOrder.deliveryLocationId}
            />

            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {canApprove && (
                  <DropdownMenuItem>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
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
          {/* Supplier Card */}
          <Card className="overflow-hidden border-0   transition-shadow duration-300 bg-white">
            <div className="bg-blue-50 border-l-4 border-blue-500">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="flex items-center text-blue-700 font-semibold">
                  <Building2 className="w-5 h-5 mr-2" />
                  Supplier Details
                </CardTitle>
              </CardHeader>
            </div>
            <CardContent className="pt-4">
              <div className="text-sm space-y-3">
                <p className="font-medium text-base">
                  {purchaseOrder.supplier.name}
                </p>
                <div className="flex items-start text-gray-600">
                  <FileText className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                  <p className="text-gray-600">
                    {purchaseOrder.supplier.address}
                  </p>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                  <p className="text-gray-600">
                    {purchaseOrder.supplier.phone}
                  </p>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                  <p className="text-gray-600">
                    {purchaseOrder.supplier.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details Card */}
          <Card className="overflow-hidden border-0   transition-shadow duration-300 bg-white">
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
                    <span className="ml-2">
                      {formatDate(purchaseOrder.date)}
                    </span>
                  </div>
                </div>

                {purchaseOrder.expectedDeliveryDate && (
                  <div className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                    <div>
                      <span className="text-gray-600 font-medium">
                        Expected Delivery:
                      </span>
                      <span className="ml-2">
                        {formatDate(purchaseOrder.expectedDeliveryDate)}
                      </span>
                    </div>
                  </div>
                )}

                {purchaseOrder.paymentTerms && (
                  <div className="flex items-start">
                    <CreditCard className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                    <div>
                      <span className="text-gray-600 font-medium">
                        Payment Terms:
                      </span>
                      <span className="ml-2">{purchaseOrder.paymentTerms}</span>
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
                      {purchaseOrder.createdBy.name || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Order Items</h3>
          <PurchaseOrderLineTable purchaseOrderId={purchaseOrder.id} />
        </div>

        {purchaseOrder.notes && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Notes</h3>
            <div className="p-3 bg-muted rounded-md text-sm">
              {purchaseOrder.notes}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 border-t bg-muted/10">
        <div className="flex flex-col gap-2 ml-auto w-full md:w-1/3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>{formatCurrency(purchaseOrder.subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax:</span>
            <span>{formatCurrency(purchaseOrder.taxAmount)}</span>
          </div>

          {purchaseOrder.shippingCost !== null &&
            purchaseOrder.shippingCost !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping:</span>
                <span>{formatCurrency(purchaseOrder.shippingCost)}</span>
              </div>
            )}

          {purchaseOrder.discount !== null &&
            purchaseOrder.discount !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span>-{formatCurrency(purchaseOrder.discount)}</span>
              </div>
            )}

          <Separator />

          <div className="flex justify-between font-medium text-lg">
            <span>Total:</span>
            <span>{formatCurrency(purchaseOrder.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
