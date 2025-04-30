import { formatNumber } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package } from "lucide-react";
import { getTransferLineTableItems } from "@/actions/stock-transfer";

interface TransferLineTableProps {
  transferId: string;
}

export async function TransferLineTable({
  transferId,
}: TransferLineTableProps) {
  const lines = await getTransferLineTableItems(transferId);

  if (lines.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg">
        <p className="text-muted-foreground">
          No items found for this transfer
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted/50 rounded-md flex items-center justify-center">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{line.item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {line.item.sku}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatNumber(line.quantity)}
              </TableCell>
              <TableCell>{line.notes || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
