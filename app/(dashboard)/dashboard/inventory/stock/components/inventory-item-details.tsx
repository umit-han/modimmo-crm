import { formatNumber } from "@/lib/utils";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Package } from "lucide-react";
import { StockTransferDialog } from "./stock-transfer-dialog";
import { getInventoryItem, getInventoryLocations } from "@/actions/inventory";

interface InventoryItemDetailsProps {
  itemId: string;
  orgId: string;
}

export async function InventoryItemDetails({
  itemId,
  orgId,
}: InventoryItemDetailsProps) {
  // Get the item with its inventory across all locations
  const item = await getInventoryItem(itemId, orgId);

  if (!item) {
    return notFound();
  }

  // Get all locations for the organization
  const locations = await getInventoryLocations(orgId);

  // Calculate total quantity across all locations
  const totalQuantity = item.inventories.reduce(
    (sum, inv) => sum + inv.quantity,
    0
  );
  const totalReserved = item.inventories.reduce(
    (sum, inv) => sum + inv.reservedQuantity,
    0
  );
  const availableQuantity = totalQuantity - totalReserved;

  // Create a complete inventory map including locations with zero quantity
  const inventoryByLocation = locations.map((location) => {
    const inventoryRecord = item.inventories.find(
      (inv) => inv.locationId === location.id
    );
    return {
      locationId: location.id,
      locationName: location.name,
      quantity: inventoryRecord?.quantity || 0,
      reservedQuantity: inventoryRecord?.reservedQuantity || 0,
      availableQuantity:
        (inventoryRecord?.quantity || 0) -
        (inventoryRecord?.reservedQuantity || 0),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Package className="mr-2 h-6 w-6" />
            {item.name}
          </h2>
          <p className="text-muted-foreground">SKU: {item.sku}</p>
        </div>
        <StockTransferDialog item={item} locations={locations} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Stock</CardTitle>
            <CardDescription>Across all locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(totalQuantity)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Available</CardTitle>
            <CardDescription>Not reserved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(availableQuantity)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Reserved</CardTitle>
            <CardDescription>For orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(totalReserved)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Stock by Location</h3>

        {inventoryByLocation.length === 0 ? (
          <div className="text-center p-6 border rounded-lg">
            <p className="text-muted-foreground">No locations found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inventoryByLocation.map((inv) => (
              <div key={inv.locationId} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{inv.locationName}</h4>
                  <div className="text-right">
                    <span className="font-medium">
                      {formatNumber(inv.quantity)}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">
                      ({formatNumber(inv.availableQuantity)} available)
                    </span>
                  </div>
                </div>
                <Progress
                  value={
                    inv.quantity > 0
                      ? (inv.availableQuantity / inv.quantity) * 100
                      : 0
                  }
                  className="h-2"
                />
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">
                    {formatNumber(inv.reservedQuantity)} reserved
                  </span>
                  <span className="text-muted-foreground">
                    {formatNumber(inv.availableQuantity)} available
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
