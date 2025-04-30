// components/reports/sales/TopCustomersTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopCustomersTableProps {
  customers: Array<{
    customer: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
    };
    orderCount: number;
    totalSpent: number;
  } | null>;
}

export function TopCustomersTable({ customers }: TopCustomersTableProps) {
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
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right">Orders</TableHead>
            <TableHead className="text-right">Total Spent</TableHead>
            <TableHead className="text-right">Avg. Order</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-4 text-muted-foreground"
              >
                No customer data available.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customerData) => {
              if (!customerData) return null;
              const { customer, orderCount, totalSpent } = customerData;
              const avgOrderValue =
                orderCount > 0 ? totalSpent / orderCount : 0;

              return (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    {customer.email || customer.phone || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">{orderCount}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(totalSpent)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(avgOrderValue)}
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
