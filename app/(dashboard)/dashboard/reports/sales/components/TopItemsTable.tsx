// components/reports/sales/TopItemsTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopItemsTableProps {
  items: Array<{
    item: {
      id: string;
      name: string;
      sku: string;
      sellingPrice: number;
      brand: {
        name: string;
      } | null;
      category: {
        title: string;
      } | null;
    } | null;
    quantitySold: number;
    totalRevenue: number;
    averagePrice: number;
  }>;
}

export function TopItemsTable({ items }: TopItemsTableProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Qty Sold</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Avg. Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-4 text-muted-foreground"
              >
                No items found.
              </TableCell>
            </TableRow>
          ) : (
            items.map((itemData) => {
              if (!itemData.item) return null;
              const { item, quantitySold, totalRevenue, averagePrice } =
                itemData;

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.brand?.name || ""}
                    </div>
                  </TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>
                    {item.category?.title || "Uncategorized"}
                  </TableCell>
                  <TableCell className="text-right">
                    {quantitySold.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(averagePrice)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
