import Link from "next/link";

import { getSalesOrders } from "@/actions/sales-orders";
import { SalesOrderLayout } from "../orders/components/SalesOrderLayout";
import { SalesOrderFilters } from "../orders/components/SalesOrderFilters";

export default async function SalesOrdersPage() {
  const salesOrders = (await getSalesOrders("POS")) || [];

  return (
    <div className="py-4 md:py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">POS Orders</h1>
        <Link
          href="/pos"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Create POS Order
        </Link>
      </div>

      {salesOrders.length > 0 ? (
        <>
          <SalesOrderFilters />
          <SalesOrderLayout salesOrders={salesOrders} />
        </>
      ) : (
        <div className="text-center p-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-4">No sales orders found</p>
          <Link
            href="/dashboard/sales/orders/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Create Sales Order
          </Link>
        </div>
      )}
    </div>
  );
}
