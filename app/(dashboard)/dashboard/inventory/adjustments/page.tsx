// app/dashboard/inventory/adjustments/page.tsx
import { Suspense } from "react";

import { TableLoading } from "@/components/ui/data-table";

import { getAuthenticatedUser } from "@/config/useAuth";
import StockAdjustmentListing from "./components/StockAdjustments";

export default async function StockAdjustmentsPage() {
  const user = await getAuthenticatedUser();

  if (!user?.orgId) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="container py-8">
      <Suspense fallback={<TableLoading title="Stock Adjustments" />}>
        <StockAdjustmentListing orgId={user.orgId} title="Stock Adjustments" />
      </Suspense>
    </div>
  );
}
