// app/dashboard/sales/orders/new/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { getItemsWithInventories } from "@/actions/inventory";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getLocations } from "@/actions/purchase-orders";
import { getBriefCustomers } from "@/actions/customers";
import { SalesOrderForm } from "../components/SalesOrderForm";
export default async function CreateSalesOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const customerId = (await searchParams).customerId || "";
  const user = await getAuthenticatedUser();
  if (!user?.orgId) {
    return <div>Not authenticated</div>;
  }

  // Get data needed for the form
  const [customers, locations, items] = await Promise.all([
    getBriefCustomers(),
    getLocations(),
    getItemsWithInventories(user.orgId),
  ]);

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/sales/orders">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Create Sales Order</h1>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <SalesOrderForm
          customers={customers || []}
          locations={locations || []}
          items={items || []}
          userId={user.id}
          orgId={user.orgId}
          initialCustomerId={customerId as string}
        />
      </Suspense>
    </div>
  );
}
