import { getGoodsReceiptLineItems } from "@/actions/goods-receipt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
export default async function GoodsReceiptList({ orgId }: { orgId: string }) {
  const goodsReceipts = await getGoodsReceiptLineItems(orgId);

  if (goodsReceipts.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg">
        <p className="text-muted-foreground mb-4">No goods receipts found</p>
        <Link href="/purchase-orders">
          <Button>View Purchase Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {goodsReceipts.map((receipt) => {
        // Calculate total value of received items
        const totalValue = receipt.lines.reduce((sum, line) => {
          // Find the corresponding purchase order line to get the unit price
          const poLine = receipt.purchaseOrder.lines?.find(
            (poLine) => poLine.id === line.purchaseOrderLineId
          );
          return sum + (poLine?.unitPrice || 0) * line.receivedQuantity;
        }, 0);

        return (
          <Link
            key={receipt.id}
            href={`/dashboard/purchases/goods-receipt/${receipt.id}`}
            className="block"
          >
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-red-500">
                    {receipt.receiptNumber}
                  </p>
                  <p className="text-muted-foreground">
                    {receipt.purchaseOrder.supplier.name}
                  </p>
                </div>
                <p className="font-semibold">{formatCurrency(totalValue)}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">
                  {new Date(receipt.date).toLocaleDateString()}
                </p>
                <StatusBadge status={receipt.status} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED":
      return <Badge className="bg-green-500">Completed</Badge>;
    case "PENDING":
      return (
        <Badge variant="outline" className="text-orange-500 border-orange-500">
          Pending
        </Badge>
      );
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
