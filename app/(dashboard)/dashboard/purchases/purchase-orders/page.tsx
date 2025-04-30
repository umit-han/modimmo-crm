import { getPurchaseOrders } from "@/actions/purchase-orders";
import { PurchaseOrderLayout } from "./components/purchase-order-layout";
import Link from "next/link";
export default async function PurchaseOrdersPage() {
  const purchaseOrders = (await getPurchaseOrders()) || [];
  return (
    <div className=" py-4 md:py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold ">Purchase Orders</h1>
        {purchaseOrders.length > 0 && (
          <Link
            href="/dashboard/purchases/purchase-orders/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Create Purchase Order
          </Link>
        )}
      </div>

      {purchaseOrders.length > 0 ? (
        <PurchaseOrderLayout purchaseOrders={purchaseOrders} />
      ) : (
        <div className="text-center p-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-4">No purchase orders found</p>
          {/* Add a link to create a new PO */}
          <Link
            href="/dashboard/purchases/purchase-orders/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Create Purchase Order
          </Link>
        </div>
      )}
    </div>
  );
}
