"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Check, X, Download, Printer } from "lucide-react";

import {
  useStockAdjustment,
  useApproveStockAdjustment,
  useCancelStockAdjustment,
} from "@/hooks/useStockAdjustmentQueries";

interface StockAdjustmentDetailProps {
  id: string;
  userId: string;
}

export default function StockAdjustmentDetail({
  id,
  userId,
}: StockAdjustmentDetailProps) {
  const router = useRouter();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // React Query hooks
  const { data: adjustment, isLoading, error } = useStockAdjustment(id);
  const approveMutation = useApproveStockAdjustment();
  const cancelMutation = useCancelStockAdjustment();

  // Handle approve and cancel actions
  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({ adjustmentId: id, userId });
      setApproveDialogOpen(false);
      toast.success("Stock adjustment approved successfully");
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(id);
      setCancelDialogOpen(false);
      toast.success("Stock adjustment cancelled successfully");
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  // Helper functions
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMM dd, yyyy");
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "APPROVED":
        return <Badge variant="success">Approved</Badge>;
      case "COMPLETED":
        return <Badge variant="default">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get adjustment type label
  const getAdjustmentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      STOCK_COUNT: "Stock Count",
      DAMAGE: "Damage",
      THEFT: "Theft",
      EXPIRED: "Expired",
      WRITE_OFF: "Write Off",
      CORRECTION: "Correction",
      OTHER: "Other",
    };
    return types[type] || type;
  };

  // Calculate total quantity change
  const getTotalQuantityChange = () => {
    if (!adjustment) return 0;
    return adjustment.lines.reduce(
      (total, line) => total + line.adjustedQuantity,
      0
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Error state
  if (error || !adjustment) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <h3 className="text-lg font-semibold mb-1">
            Error loading adjustment details
          </h3>
          <p className="text-muted-foreground mb-4">
            There was a problem loading the adjustment details.
          </p>
          <Link href="/dashboard/inventory/adjustments">
            <Button>Return to Adjustments</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/inventory/adjustments">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            Adjustment {adjustment.adjustmentNumber}
          </h1>
          <div className="ml-2">{getStatusBadge(adjustment.status)}</div>
        </div>

        <div className="flex items-center gap-2">
          {adjustment.status === "DRAFT" && (
            <>
              <Button
                variant="outline"
                className="gap-1"
                onClick={() => setApproveDialogOpen(true)}
                disabled={approveMutation.isPending || cancelMutation.isPending}
              >
                <Check className="h-4 w-4" />
                Approve
              </Button>

              <Button
                variant="outline"
                className="gap-1 text-destructive hover:bg-destructive/10"
                onClick={() => setCancelDialogOpen(true)}
                disabled={approveMutation.isPending || cancelMutation.isPending}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          )}

          <Button variant="outline" className="gap-1">
            <Printer className="h-4 w-4" />
            Print
          </Button>

          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Adjustment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Adjustment Number
                </p>
                <p>{adjustment.adjustmentNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Date
                </p>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {formatDate(adjustment.date)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Location
                </p>
                <p>{adjustment.location.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Type
                </p>
                <p>{getAdjustmentTypeLabel(adjustment.adjustmentType)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <p>{getStatusBadge(adjustment.status)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created By
                </p>
                <p>{adjustment.createdBy.name}</p>
              </div>
              {adjustment.approvedBy && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Approved By
                  </p>
                  <p>{adjustment.approvedBy.name}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Reason
              </p>
              <p>{adjustment.reason}</p>
            </div>

            {adjustment.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Notes
                </p>
                <p>{adjustment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adjustment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Items Count
                </p>
                <p className="text-2xl font-bold">{adjustment.lines.length}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Quantity Change
                </p>
                <p
                  className={`text-2xl font-bold ${
                    getTotalQuantityChange() > 0
                      ? "text-green-600"
                      : getTotalQuantityChange() < 0
                        ? "text-red-600"
                        : ""
                  }`}
                >
                  {getTotalQuantityChange() > 0 ? "+" : ""}
                  {getTotalQuantityChange()}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Quantity Changes
                </p>
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-2 rounded-md">
                    <p className="text-sm text-green-800">Increased</p>
                    <p className="text-xl font-bold text-green-800">
                      {
                        adjustment.lines.filter(
                          (line) => line.adjustedQuantity > 0
                        ).length
                      }
                    </p>
                  </div>
                  <div className="bg-red-100 p-2 rounded-md">
                    <p className="text-sm text-red-800">Decreased</p>
                    <p className="text-xl font-bold text-red-800">
                      {
                        adjustment.lines.filter(
                          (line) => line.adjustedQuantity < 0
                        ).length
                      }
                    </p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded-md">
                    <p className="text-sm text-gray-800">Unchanged</p>
                    <p className="text-xl font-bold text-gray-800">
                      {
                        adjustment.lines.filter(
                          (line) => line.adjustedQuantity === 0
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adjustment Items</CardTitle>
          <CardDescription>
            List of items included in this adjustment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Before Quantity</TableHead>
                <TableHead className="text-right">After Quantity</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustment.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell className="font-medium">
                    {line.item.name}
                  </TableCell>
                  <TableCell>{line.item.sku}</TableCell>
                  <TableCell className="text-right">
                    {line.beforeQuantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {line.afterQuantity}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-medium ${
                        line.adjustedQuantity > 0
                          ? "text-green-600"
                          : line.adjustedQuantity < 0
                            ? "text-red-600"
                            : ""
                      }`}
                    >
                      {line.adjustedQuantity > 0 ? "+" : ""}
                      {line.adjustedQuantity}
                    </span>
                  </TableCell>
                  <TableCell>{line.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <ConfirmationDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="Approve Stock Adjustment"
        description={
          <>
            Are you sure you want to approve{" "}
            <strong>{adjustment.adjustmentNumber}</strong>? This will update the
            inventory quantities.
          </>
        }
        onConfirm={handleApprove}
        isConfirming={approveMutation.isPending}
        confirmLabel="Approve"
        variant="default"
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Stock Adjustment"
        description={
          <>
            Are you sure you want to cancel{" "}
            <strong>{adjustment.adjustmentNumber}</strong>? This action cannot
            be undone.
          </>
        }
        onConfirm={handleCancel}
        isConfirming={cancelMutation.isPending}
        confirmLabel="Cancel Adjustment"
        variant="destructive"
      />
    </div>
  );
}
