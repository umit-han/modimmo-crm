import { formatCurrency } from "@/lib/formatData";

type Item = {
  id: string;
  name: string;
  sku: string;
};

type PurchaseOrderLine = {
  id: string;
  itemId: string;
  item: Item;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discount: number | null;
  total: number;
  notes: string | null;
  receivedQuantity: number;
};

interface PurchaseOrderLineItemsProps {
  lines: PurchaseOrderLine[];
}

export function PurchaseOrderLineItems({ lines }: PurchaseOrderLineItemsProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 font-medium">Item</th>
              <th className="text-right p-3 font-medium">Quantity</th>
              <th className="text-right p-3 font-medium">Unit Price</th>
              <th className="text-right p-3 font-medium">Tax</th>
              <th className="text-right p-3 font-medium">Total</th>
              <th className="text-right p-3 font-medium">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {lines.map((line) => (
              <tr key={line.id}>
                <td className="p-3">
                  <div>
                    <p className="font-medium">{line.item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {line.item.sku}
                    </p>
                    {line.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {line.notes}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-3 text-right">{line.quantity}</td>
                <td className="p-3 text-right">
                  {formatCurrency(line.unitPrice)}
                </td>
                <td className="p-3 text-right">
                  {line.taxRate > 0 ? (
                    <div>
                      <p>{formatCurrency(line.taxAmount)}</p>
                      <p className="text-xs text-muted-foreground">
                        ({line.taxRate}%)
                      </p>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-3 text-right font-medium">
                  {formatCurrency(line.total)}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end">
                    <span
                      className={
                        line.receivedQuantity > 0
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      {line.receivedQuantity} / {line.quantity}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {lines.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  No items added to this purchase order.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
