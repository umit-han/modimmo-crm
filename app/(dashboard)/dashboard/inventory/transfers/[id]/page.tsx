import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDate, formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ArrowLeftRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser } from "@/config/useAuth";
import {
  getTransferById,
  getTransferTotalQuantity,
} from "@/actions/stock-transfer";
import { TransferStatusTimeline } from "../components/TransferStatusTimeline";
import { TransferActions } from "../components/TransferActions";
import { TransferLineTable } from "../components/TransferLineTable";
import TransferStatusBadge from "../components/TransferStatusBadge";

interface TransferDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TransferDetailPage({
  params,
}: TransferDetailPageProps) {
  const user = await getAuthenticatedUser();
  if (!user?.orgId) {
    return <div>Not authenticated</div>;
  }
  const id = (await params).id;
  const transfer = await getTransferById(id, user.orgId);

  if (!transfer) {
    return notFound();
  }

  // Calculate total quantity
  const totalQuantity = await getTransferTotalQuantity(transfer.id);

  if (!totalQuantity) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/inventory/transfers">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          Transfer {transfer.transferNumber}
        </h1>
        <TransferStatusBadge status={transfer.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">From Location</CardTitle>
            <CardDescription>Source of items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{transfer.fromLocation.name}</div>
          </CardContent>
        </Card>

        <Card className="relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">To Location</CardTitle>
            <CardDescription>Destination for items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{transfer.toLocation.name}</div>
          </CardContent>
          <div className="absolute top-1/2 -left-3 transform -translate-y-1/2 bg-background rounded-full p-1 border">
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Transfer Details</CardTitle>
            <CardDescription>Information about this transfer</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-1 text-sm">
              <dt className="text-muted-foreground">Date:</dt>
              <dd>{formatDate(transfer.date)}</dd>

              <dt className="text-muted-foreground">Total Items:</dt>
              <dd>{formatNumber(totalQuantity._sum.quantity || 0)}</dd>

              <dt className="text-muted-foreground">Created By:</dt>
              <dd>{transfer.createdBy.name}</dd>

              {transfer.approvedById && (
                <>
                  <dt className="text-muted-foreground">Approved By:</dt>
                  <dd>{transfer.approvedBy?.name}</dd>
                </>
              )}

              <dt className="text-muted-foreground">Created:</dt>
              <dd>{formatDate(transfer.createdAt)}</dd>

              {transfer.updatedAt > transfer.createdAt && (
                <>
                  <dt className="text-muted-foreground">Last Updated:</dt>
                  <dd>{formatDate(transfer.updatedAt)}</dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Transfer Status</h2>
        <TransferStatusTimeline
          status={transfer.status}
          createdAt={transfer.createdAt}
          approvedAt={transfer.status !== "DRAFT" ? transfer.updatedAt : null}
          inTransitAt={
            transfer.status === "IN_TRANSIT" || transfer.status === "COMPLETED"
              ? transfer.updatedAt
              : null
          }
          completedAt={
            transfer.status === "COMPLETED" ? transfer.updatedAt : null
          }
          cancelledAt={
            transfer.status === "CANCELLED" ? transfer.updatedAt : null
          }
        />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transfer Items</h2>
        <TransferActions transfer={transfer} userId={user.id} />
      </div>

      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <TransferLineTable transferId={transfer.id} />
      </Suspense>

      {transfer.notes && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Notes</h2>
          <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">
            {transfer.notes}
          </div>
        </div>
      )}
    </div>
  );
}
