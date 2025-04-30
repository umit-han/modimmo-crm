"use client";

import { useState } from "react";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Eye,
} from "lucide-react";

import {
  DataTable,
  Column,
  TableActions,
  ConfirmationDialog,
} from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  useOrgStockAdjustments,
  useApproveStockAdjustment,
  useCancelStockAdjustment,
  StockAdjustment,
} from "@/hooks/useStockAdjustmentQueries";

interface StockAdjustmentListingProps {
  title: string;
  orgId: string;
}

export default function StockAdjustmentListing({
  title,
  orgId,
}: StockAdjustmentListingProps) {
  const router = useRouter();

  // State for confirmation dialogs
  const [adjustmentToApprove, setAdjustmentToApprove] =
    useState<StockAdjustment | null>(null);
  const [adjustmentToCancel, setAdjustmentToCancel] =
    useState<StockAdjustment | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // React Query hooks
  const { adjustments, pagination, isLoading, refetch } =
    useOrgStockAdjustments(orgId);
  const approveMutation = useApproveStockAdjustment();
  const cancelMutation = useCancelStockAdjustment();

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

  // Get quantity change indicator
  const getQuantityIndicator = (adjustedQuantity: number) => {
    if (adjustedQuantity > 0) {
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    } else if (adjustedQuantity < 0) {
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    } else {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
  };

  // Calculate total adjusted quantity for an adjustment
  const getTotalAdjustedQuantity = (adjustment: StockAdjustment) => {
    return adjustment.lines.reduce(
      (total, line) => total + line.adjustedQuantity,
      0
    );
  };

  // Export to Excel
  const handleExport = async (filteredAdjustments: StockAdjustment[]) => {
    setIsExporting(true);
    try {
      // Prepare data for export
      const exportData = filteredAdjustments.map((adjustment) => ({
        "Adjustment #": adjustment.adjustmentNumber,
        Date: formatDate(adjustment.date),
        Location: adjustment.location.name,
        Type: getAdjustmentTypeLabel(adjustment.adjustmentType),
        Reason: adjustment.reason,
        "Items Count": adjustment.lines.length,
        "Total Quantity Change": getTotalAdjustedQuantity(adjustment),
        Status: adjustment.status,
        "Created By": adjustment.createdBy.name,
        "Created Date": formatDate(adjustment.createdAt),
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Adjustments");

      // Generate filename with current date
      const fileName = `Stock_Adjustments_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      // Export to file
      XLSX.writeFile(workbook, fileName);

      toast.success("Export successful", {
        description: `Stock adjustments exported to ${fileName}`,
      });
    } catch (error) {
      toast.error("Export failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handler functions
  const handleAddClick = () => {
    router.push("/dashboard/inventory/adjustments/create");
  };

  const handleViewClick = (adjustment: StockAdjustment) => {
    router.push(`/dashboard/inventory/adjustments/${adjustment.id}`);
  };

  const handleApproveClick = (adjustment: StockAdjustment) => {
    setAdjustmentToApprove(adjustment);
    setApproveDialogOpen(true);
  };

  const handleCancelClick = (adjustment: StockAdjustment) => {
    setAdjustmentToCancel(adjustment);
    setCancelDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (adjustmentToApprove) {
      await approveMutation.mutateAsync({
        adjustmentId: adjustmentToApprove.id,
        userId: adjustmentToApprove.createdById, // Ideally this would be the current user ID
      });
      setApproveDialogOpen(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (adjustmentToCancel) {
      await cancelMutation.mutateAsync(adjustmentToCancel.id);
      setCancelDialogOpen(false);
    }
  };

  // Define columns for the data table
  const columns: Column<StockAdjustment>[] = [
    {
      header: "Adjustment #",
      accessorKey: "adjustmentNumber",
      cell: (row) => (
        <span
          className="font-medium text-primary cursor-pointer hover:underline"
          onClick={() => handleViewClick(row)}
        >
          {row.adjustmentNumber}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: (row) => formatDate(row.date),
      cell: (row) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          {formatDate(row.date)}
        </div>
      ),
    },
    // {
    //   header: "Location",
    //   accessorKey: "location.name",
    // },
    {
      header: "Type",
      accessorKey: (row) => getAdjustmentTypeLabel(row.adjustmentType),
    },
    {
      header: "Reason",
      accessorKey: "reason",
      cell: (row) => (
        <span className="truncate block max-w-[200px]" title={row.reason}>
          {row.reason}
        </span>
      ),
    },
    {
      header: "Items",
      accessorKey: (row) => `${row.lines.length} items`,
      cell: (row) => {
        const totalAdjusted = getTotalAdjustedQuantity(row);
        return (
          <div className="flex items-center">
            <span>{row.lines.length} items</span>
            <span className="ml-2 flex items-center text-xs">
              {getQuantityIndicator(totalAdjusted)}
              <span
                className={`ml-1 ${totalAdjusted > 0 ? "text-green-600" : totalAdjusted < 0 ? "text-red-600" : ""}`}
              >
                {totalAdjusted > 0 ? "+" : ""}
                {totalAdjusted}
              </span>
            </span>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => getStatusBadge(row.status),
    },
  ];

  // Generate subtitle with stats
  const getSubtitle = (adjustmentCount: number) => {
    const draftCount = adjustments.filter((a) => a.status === "DRAFT").length;
    const approvedCount = adjustments.filter(
      (a) => a.status === "APPROVED"
    ).length;

    return `${adjustmentCount} ${adjustmentCount === 1 ? "adjustment" : "adjustments"} | ${draftCount} draft | ${approvedCount} approved`;
  };
  console.log(adjustments);
  return (
    <>
      <DataTable<StockAdjustment>
        title={title}
        subtitle={
          adjustments.length > 0 ? getSubtitle(adjustments.length) : undefined
        }
        data={adjustments}
        columns={columns}
        keyField="id"
        isLoading={isLoading}
        onRefresh={refetch}
        // pagination={{
        //   currentPage: pagination.page,
        //   pageCount: pagination.pageCount,
        //   pageSize: pagination.pageSize,
        //   totalItems: pagination.total,
        //   siblingsCount: 1,
        //   onPageChange: (page) => {
        //     // This would be implemented with your server action and query hook
        //     refetch();
        //   },
        // }}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["adjustmentNumber", "reason", "notes"],
          enableDateFilter: true,
          getItemDate: (item) => new Date(item.date),
          // additionalFilters: [
          //   {
          //     name: "status",
          //     label: "Status",
          //     options: [
          //       { label: "All Statuses", value: "" },
          //       { label: "Draft", value: "DRAFT" },
          //       { label: "Approved", value: "APPROVED" },
          //       { label: "Completed", value: "COMPLETED" },
          //       { label: "Cancelled", value: "CANCELLED" },
          //     ],
          //   },
          //   {
          //     name: "type",
          //     label: "Type",
          //     options: [
          //       { label: "All Types", value: "" },
          //       { label: "Stock Count", value: "STOCK_COUNT" },
          //       { label: "Damage", value: "DAMAGE" },
          //       { label: "Theft", value: "THEFT" },
          //       { label: "Expired", value: "EXPIRED" },
          //       { label: "Write Off", value: "WRITE_OFF" },
          //       { label: "Correction", value: "CORRECTION" },
          //       { label: "Other", value: "OTHER" },
          //     ],
          //   },
          // ],
        }}
        renderRowActions={(adjustment) => (
          <div className="flex">
            <button onClick={() => handleViewClick(adjustment)}>
              <Eye className="size-4" />
            </button>
            {/* <TableActions.RowActions
              onEdit={() => handleEditClick(item)}
              onDelete={() => handleDeleteClick(item)}
              // isDeleting={
              //   deleteProductMutation.isPending && productToDelete?.id === item.id
              // }
            /> */}
          </div>
          // <TableActions.RowActions
          //   actions={[
          //     {
          //       label: "View Details",
          //       onClick: () => handleViewClick(adjustment),
          //     },
          //     ...(adjustment.status === "DRAFT"
          //       ? [
          //           {
          //             label: "Approve",
          //             onClick: () => handleApproveClick(adjustment),
          //             icon: <Check className="h-4 w-4" />,
          //           },
          //           {
          //             label: "Cancel",
          //             onClick: () => handleCancelClick(adjustment),
          //             icon: <X className="h-4 w-4" />,
          //             variant: "destructive",
          //           },
          //         ]
          //       : []),
          //   ]}
          // />
        )}
      />

      {/* Approve Confirmation Dialog */}
      <ConfirmationDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="Approve Stock Adjustment"
        description={
          adjustmentToApprove ? (
            <>
              Are you sure you want to approve{" "}
              <strong>{adjustmentToApprove.adjustmentNumber}</strong>? This will
              update the inventory quantities.
            </>
          ) : (
            "Are you sure you want to approve this adjustment?"
          )
        }
        onConfirm={handleConfirmApprove}
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
          adjustmentToCancel ? (
            <>
              Are you sure you want to cancel{" "}
              <strong>{adjustmentToCancel.adjustmentNumber}</strong>? This
              action cannot be undone.
            </>
          ) : (
            "Are you sure you want to cancel this adjustment?"
          )
        }
        onConfirm={handleConfirmCancel}
        isConfirming={cancelMutation.isPending}
        confirmLabel="Cancel Adjustment"
        variant="destructive"
      />
    </>
  );
}
