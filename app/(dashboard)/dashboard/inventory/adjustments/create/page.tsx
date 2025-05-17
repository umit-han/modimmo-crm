import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { getItemsWithInventories } from "@/actions/inventory";
import { getAuthenticatedUser } from "@/config/useAuth";
import { StockAdjustmentForm } from "../components/StockAdjustementForm";
import { getLocations } from "@/actions/purchase-orders";

export default async function CreateStockAdjustmentPage() {
  const user = await getAuthenticatedUser();
  if (!user?.orgId) {
    return <div>Not authenticated</div>;
  }

  // Get all locations for the organization
  const locations = await getLocations();

  // Get all items with their inventory
  const items = await getItemsWithInventories(user.orgId);

  return (
    <div className="sm:container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/inventory/adjustments">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg md:text-2xl font-bold">Create Stock Adjustment</h1>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <StockAdjustmentForm
            items={items}
            locations={locations}
            userId={user.id}
            orgId={user.orgId}
          />
        </Suspense>
      </div>
    </div>
  );
}
