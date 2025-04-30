import { Suspense } from "react";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getLocations } from "@/actions/purchase-orders";
import { getBriefCustomers } from "@/actions/customers";
import { getCategoriesWithItems } from "@/actions/categories";

import { Skeleton } from "@/components/ui/skeleton";
import { Category, POSInterface } from "./components/POSInterface";

export default async function POSPage() {
  const user = await getAuthenticatedUser();

  if (!user?.orgId) {
    return <div>Not authenticated</div>;
  }

  // Get data needed for the POS
  const [customers, locations, categoriesWithItems] = await Promise.all([
    getBriefCustomers(),
    getLocations(),
    getCategoriesWithItems(user.orgId),
  ]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Suspense fallback={<Skeleton className="h-full w-full" />}>
        <POSInterface
          customers={customers || []}
          locations={locations || []}
          categoriesWithItems={(categoriesWithItems as Category[]) || []}
          userId={user.id}
          orgId={user.orgId}
        />
      </Suspense>
    </div>
  );
}
