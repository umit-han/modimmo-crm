"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

/**
 * Server action to add multiple suppliers to an item
 */
export async function addItemSuppliers(itemId: string, supplierIds: string[]) {
  try {
    // Create an array of ItemSupplier objects to create
    const itemSuppliers = supplierIds.map((supplierId) => ({
      itemId,
      supplierId,
    }));

    // Use createMany to insert multiple records at once
    await db.itemSupplier.createMany({
      data: itemSuppliers,
      skipDuplicates: true,
    });

    // Revalidate the item detail page to show the updated suppliers
    revalidatePath(`/dashboard/inventory/items/${itemId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add item suppliers:", error);
    throw new Error("Failed to add suppliers to item");
  }
}

export async function updateItemSupplier(
  itemSupplierId: string,
  data: {
    isPreferred: boolean;
    supplierSku: string | null;
    leadTime: number | null;
    minOrderQty: number | null;
    unitCost: number | null;
    lastPurchaseDate: Date | null;
    notes: string | null;
  }
) {
  try {
    // Get the item ID for revalidation
    const itemSupplier = await db.itemSupplier.findUnique({
      where: { id: itemSupplierId },
      select: { itemId: true },
    });

    if (!itemSupplier) {
      console.log("No item Found");
      return { success: false };
    }
    // If this is marked as preferred, unmark any other preferred suppliers for this item
    if (data.isPreferred) {
      await db.itemSupplier.updateMany({
        where: {
          itemId: itemSupplier.itemId,
          isPreferred: true,
        },
        data: {
          isPreferred: false,
        },
      });
    }
    // Update the item supplier
    const updated = await db.itemSupplier.update({
      where: { id: itemSupplierId },
      data,
    });
    // console.log(updated);
    // Revalidate the paths
    revalidatePath(`/dashboard/inventory/items/${itemSupplier.itemId}`);
    revalidatePath(
      `/dashboard/inventory/items/${itemSupplier.itemId}/suppliers`
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to update item supplier:", error);
    throw new Error("Failed to update supplier details");
  }
}
