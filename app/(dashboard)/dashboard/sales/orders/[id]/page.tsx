// app/dashboard/sales/orders/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

import { getSalesOrderById } from "@/actions/sales-orders";
import { getAuthenticatedUser } from "@/config/useAuth";
import SalesOrderDetailView from "../components/DetailView";

interface SalesOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SalesOrderDetailPage({
  params,
}: SalesOrderDetailPageProps) {
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

  return (
    <div className="py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/sales/orders">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Sales Order Details</h1>
      </div>

      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <SalesOrderDetailView salesOrderId={id} userId={user.id} />
      </Suspense>
    </div>
  );
}
