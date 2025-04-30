// app/products/page.tsx
import { Suspense } from "react";

import { TableLoading } from "@/components/ui/data-table";
import ItemListing from "@/components/dashboard/items/item-listing";
import { getAuthenticatedUser } from "@/config/useAuth";
import LocationListing from "@/components/dashboard/items/location-listing";

export default async function ProductsPage() {
  const user = await getAuthenticatedUser();
  // const orgId = user.orgId;
  return (
    <div className="container py-8">
      <Suspense fallback={<TableLoading title="Locations" />}>
        <LocationListing title="Org Locations" />
      </Suspense>
    </div>
  );
}
