// app/dashboard/sales/orders/[id]/invoice/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

import { getSalesOrderById } from "@/actions/sales-orders";
import { getAuthenticatedUser } from "@/config/useAuth";
import InvoiceView from "../../components/InvoiceView";

interface InvoicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const user = await getAuthenticatedUser();
  if (!user?.orgId) {
    return <div>Not authenticated</div>;
  }
  const id = (await params).id;

  // Fetch the sales order data
  const salesOrder = await getSalesOrderById(id);

  if (!salesOrder) {
    notFound();
  }

  const companyInfo = {
    name: user.orgName || "Your Company Name",
    email: "info@yourcompany.com",
    phone: "+1 (123) 456-7890",
    address: "123 Business Street, City, State 12345",
    logo: "/invoice-logo.png", // Path to your company logo
  };

  return (
    <div className="py-6 p-0 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/sales/orders/${id}`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg md:text-2xl font-bold">
            Invoice #{salesOrder.orderNumber}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/sales/orders/${id}`}>Back to Order</Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-[800px] w-full" />}>
        <InvoiceView
          salesOrder={salesOrder}
          companyInfo={companyInfo}
          orgId={user.orgId}
        />
      </Suspense>
    </div>
  );
}
