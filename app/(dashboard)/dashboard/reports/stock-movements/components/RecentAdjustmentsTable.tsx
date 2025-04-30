// components/reports/stock-movement/RecentAdjustmentsTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AdjustmentStatus, AdjustmentType } from "@prisma/client";

interface RecentAdjustmentsTableProps {
  adjustments: Array<{
    id: string;
    adjustmentNumber: string;
    date: string;
    status: string;
    adjustmentType: string;
    reason: string;
    location: { id: string; name: string };
    createdBy: { id: string; name: string };
    netAdjustment: number;
  }>;
}

// Map status to badge variants
const statusVariants: Record<string, string> = {
  DRAFT: "secondary",
  APPROVED: "primary",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

// Map status to human-readable labels
const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  APPROVED: "Approved",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Map adjustment types to human-readable labels
const typeLabels: Record<string, string> = {
  STOCK_COUNT: "Stock Count",
  DAMAGE: "Damage",
  THEFT: "Theft",
  EXPIRED: "Expired",
  WRITE_OFF: "Write Off",
  CORRECTION: "Correction",
  OTHER: "Other",
};

export function RecentAdjustmentsTable({
  adjustments,
}: RecentAdjustmentsTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Adjustment #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Net Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adjustments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-4 text-muted-foreground"
              >
                No adjustments found.
              </TableCell>
            </TableRow>
          ) : (
            adjustments.map((adjustment) => (
              <TableRow key={adjustment.id}>
                <TableCell className="font-medium">
                  {adjustment.adjustmentNumber}
                </TableCell>
                <TableCell>
                  {format(new Date(adjustment.date), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  {typeLabels[adjustment.adjustmentType as AdjustmentType] ||
                    adjustment.adjustmentType}
                </TableCell>
                <TableCell>{adjustment.location.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      statusVariants[adjustment.status] as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                        | "success"
                        | "warning"
                    }
                  >
                    {statusLabels[adjustment.status] || adjustment.status}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-right ${adjustment.netAdjustment >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {adjustment.netAdjustment >= 0 ? "+" : ""}
                  {adjustment.netAdjustment.toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
