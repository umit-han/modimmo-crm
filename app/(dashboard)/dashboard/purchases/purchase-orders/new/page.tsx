import { PurchaseOrderForm } from "../components/purchase-order-form";
import {
  getItems,
  getLocations,
  getPurchaseOrderNumber,
  getSuppliers,
} from "@/actions/purchase-orders";

export default async function NewPurchaseOrderPage() {
  const items = await getItems();
  const suppliers = await getSuppliers();
  const locations = await getLocations();
  const poNumber = await getPurchaseOrderNumber();
  return (
    <div className="container py-4 md:py-6">
      <h1 className="text-2xl font-bold mb-6">Create Purchase Order</h1>

      <PurchaseOrderForm
        suppliers={suppliers}
        locations={locations}
        items={items}
        poNumber={poNumber}
      />
    </div>
  );
}
