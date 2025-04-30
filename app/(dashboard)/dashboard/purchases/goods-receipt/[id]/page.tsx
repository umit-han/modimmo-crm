import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Mail, MoreVertical, Printer } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getGoodsReceiptById } from "@/actions/goods-receipt";
import GoodsReceiptLineTable from "../components/GoodsReceiptLineTable";
import StatusBadge from "../components/StatusBadge";

interface GoodsReceiptPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GoodsReceiptPage({
  params,
}: GoodsReceiptPageProps) {
  const user = await getAuthenticatedUser();

  const id = (await params).id;

  const goodsReceipt = await getGoodsReceiptById(id, user.orgId ?? "");

  if (!goodsReceipt) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{goodsReceipt.receiptNumber}</h1>
          <p className="text-muted-foreground">
            {goodsReceipt.purchaseOrder.supplier.name} •{" "}
            {new Date(goodsReceipt.date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link
                  href={`/purchase-orders/${goodsReceipt.purchaseOrderId}`}
                  className="w-full"
                >
                  View Purchase Order
                </Link>
              </DropdownMenuItem>
              {goodsReceipt.status === "PENDING" && (
                <>
                  <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Cancel Receipt
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4 space-y-2">
          <h3 className="font-medium">Receipt Details</h3>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <p className="text-muted-foreground">Status</p>
            <p>
              <StatusBadge status={goodsReceipt.status} />
            </p>

            <p className="text-muted-foreground">PO Number</p>
            <p className="font-medium">{goodsReceipt.purchaseOrder.poNumber}</p>

            <p className="text-muted-foreground">Location</p>
            <p>{goodsReceipt.location.name}</p>

            <p className="text-muted-foreground">Received By</p>
            <p>{goodsReceipt.receivedBy.name}</p>

            <p className="text-muted-foreground">Date</p>
            <p>{new Date(goodsReceipt.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Received Items</h2>
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              <GoodsReceiptLineTable goodsReceiptId={goodsReceipt.id} />
            </Suspense>
          </div>
        </div>
      </div>

      {goodsReceipt.notes && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Notes</h2>
          <div className="bg-muted/50 p-4 rounded-lg">{goodsReceipt.notes}</div>
        </div>
      )}
    </div>
  );
}
