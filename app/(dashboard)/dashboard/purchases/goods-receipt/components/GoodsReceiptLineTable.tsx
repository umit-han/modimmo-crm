import { getGoodsReceiptLineTableItems } from "@/actions/goods-receipt";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export default async function GoodsReceiptLineTable({
  goodsReceiptId,
}: {
  goodsReceiptId: string;
}) {
  const goodsReceiptLines = await getGoodsReceiptLineTableItems(goodsReceiptId);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (goodsReceiptLines.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg">
        <p className="text-muted-foreground">No items found for this receipt</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Ordered</TableHead>
            <TableHead className="text-right">Received</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goodsReceiptLines.map((line) => (
            <TableRow key={line.id}>
              <TableCell>
                <div className="font-medium">{line.item.name}</div>
                <div className="text-sm text-muted-foreground">
                  {line.item.sku}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {line.purchaseOrderLine.quantity}
              </TableCell>
              <TableCell className="text-right font-medium">
                {line.receivedQuantity}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(line.purchaseOrderLine.unitPrice)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(
                  line.purchaseOrderLine.unitPrice * line.receivedQuantity
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
