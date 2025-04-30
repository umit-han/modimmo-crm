import { getTransfers } from "@/actions/stock-transfer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function TransferList({ orgId }: { orgId: string }) {
  const transfers = await getTransfers(orgId);

  if (transfers.length === 0) {
    return (
      <div className="text-center p-12 border rounded-lg">
        <h3 className="text-lg font-medium mb-2">No transfers found</h3>
        <p className="text-muted-foreground mb-4">
          You haven't created any stock transfers yet
        </p>
        <Link href="/inventory">
          <Button>Go to Inventory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Transfer #</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">From</th>
              <th className="px-4 py-3 text-left font-medium">To</th>
              <th className="px-4 py-3 text-left font-medium">Items</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transfers.map((transfer) => (
              <tr key={transfer.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/inventory/transfers/${transfer.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {transfer.transferNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(transfer.date)}
                </td>
                <td className="px-4 py-3">{transfer.fromLocation.name}</td>
                <td className="px-4 py-3">{transfer.toLocation.name}</td>
                <td className="px-4 py-3">
                  {transfer.lines.length}{" "}
                  {transfer.lines.length === 1 ? "item" : "items"}
                </td>
                <td className="px-4 py-3">
                  <TransferStatusBadge status={transfer.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/inventory/transfers/${transfer.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransferStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "DRAFT":
      return <Badge variant="outline">Draft</Badge>;
    case "APPROVED":
      return <Badge className="bg-blue-500">Approved</Badge>;
    case "IN_TRANSIT":
      return <Badge className="bg-orange-500">In Transit</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-500">Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
