// app/dashboard/inventory/adjustments/[id]/page.tsx
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthenticatedUser } from "@/config/useAuth";
import StockAdjustmentDetail from "../components/StockAdjustmentDetail";

export default async function StockAdjustmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthenticatedUser();

  if (!user?.orgId) {
    return <div>Not authenticated</div>;
  }
  const id = await (await params).id;
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <StockAdjustmentDetail id={id} userId={user.id} />
    </Suspense>
  );
}
