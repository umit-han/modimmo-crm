import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  Map,
  FileText,
  CalendarDays,
  Clock,
  DollarSign,
  ShoppingBag,
} from "lucide-react";

import {
  getCustomerWithOrderHistory,
  getOrderStatusCounts,
} from "@/actions/customers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import CustomerContactInfo from "../components/customer-contact-info";
import CustomerOrderHistory from "../components/customer-order-history";
import CustomerStats from "../components/customer-stats";
// import CustomerEditForm from "./components/customer-edit-form";

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  // Get customer data with order history
  const result = await getCustomerWithOrderHistory(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const { customer, stats } = result.data;

  // Get order status counts for the dashboard
  const orderStatusResult = await getOrderStatusCounts(id);
  const statusCounts = orderStatusResult.success
    ? orderStatusResult.data
    : { statusCounts: {}, paymentStatusCounts: {} };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get customer initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get status badge for a sales order
  const getOrderStatusBadge = (status: string) => {
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
        return <Badge variant="secondary">Delivered</Badge>;
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "RETURNED":
        return <Badge variant="destructive">Returned</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
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
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/sales/customers">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Customer Details</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/sales/orders/new?customerId=${customer.id}`}>
            <Button variant="outline">
              <ShoppingBag className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </Link>

          <Link href={`/dashboard/sales/customers/${customer.id}/edit`}>
            <Button>Edit Customer</Button>
          </Link>
        </div>
      </div>

      {/* Customer overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{customer.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Badge
                  variant={customer.isActive ? "success" : "outline"}
                  className="mr-2"
                >
                  {customer.isActive ? "Active" : "Inactive"}
                </Badge>
                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Customer since{" "}
                  {format(new Date(customer.createdAt), "MMM yyyy")}
                </span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <CustomerContactInfo customer={customer} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerStats
              stats={stats}
              statusCounts={
                statusCounts as {
                  statusCounts: Record<string, number>;
                  paymentStatusCounts: Record<string, number>;
                }
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Order History and other details */}
      <CustomerOrderHistory
        orders={customer.salesOrders}
        getOrderStatusBadge={getOrderStatusBadge}
        getPaymentStatusBadge={getPaymentStatusBadge}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
