// components/reports/stock-movement/RecentTransfersTable.tsx
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
import { TransferStatus } from "@prisma/client";

interface RecentTransfersTableProps {
  transfers: Array<{
    id: string;
    transferNumber: string;
    date: string;
    status: string;
    fromLocation: { id: string; name: string };
    toLocation: { id: string; name: string };
    createdBy: { id: string; name: string };
    totalQuantity: number;
  }>;
}

// Map status to badge variants
const statusVariants: Record<string, string> = {
  DRAFT: "secondary",
  APPROVED: "primary",
  IN_TRANSIT: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

// Map status to human-readable labels
const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  APPROVED: "Approved",
  IN_TRANSIT: "In Transit",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function RecentTransfersTable({ transfers }: RecentTransfersTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transfer #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-4 text-muted-foreground"
              >
                No transfers found.
              </TableCell>
            </TableRow>
          ) : (
            transfers.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell className="font-medium">
                  {transfer.transferNumber}
                </TableCell>
                <TableCell>
                  {format(new Date(transfer.date), "dd MMM yyyy")}
                </TableCell>
                <TableCell>{transfer.fromLocation.name}</TableCell>
                <TableCell>{transfer.toLocation.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      statusVariants[transfer.status] as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                        | "success"
                        | "warning"
                    }
                  >
                    {statusLabels[transfer.status] || transfer.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {transfer.totalQuantity.toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
