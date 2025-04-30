import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser } from "@/config/useAuth";
import TransferList from "./components/TransferList";
import TransferListSkeleton from "./components/TransferSkeleton";
import { Plus } from "lucide-react";

export default async function TransfersPage() {
  const user = await getAuthenticatedUser();
  if (!user?.orgId) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Stock Transfers</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/inventory/stock">
            <Button variant="outline">View Inventory</Button>
          </Link>
          <Link href="/dashboard/inventory/transfers/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Batch Transfer
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<TransferListSkeleton />}>
        <TransferList orgId={user.orgId} />
      </Suspense>
    </div>
  );
}
