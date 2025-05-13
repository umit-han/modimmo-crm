"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

/**
 * Server action to add multiple suppliers to an item using upsert
 */
export async function addItemSuppliers(itemId: string, supplierIds: string[]) {
  try {
    // Tek tek upsert işlemi (varsa güncelleme yok, yoksa ekleme)
    for (const supplierId of supplierIds) {
      await db.itemSupplier.upsert({
        where: {
          itemId_supplierId: {
            itemId,
            supplierId,
          },
        },
        update: {}, // Varsa geç
        create: {
          itemId,
          supplierId,
        },
      });
    }

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

    // Eğer bu tercihli olarak işaretlendiyse, önce diğerlerini kaldır
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
    await db.itemSupplier.update({
      where: { id: itemSupplierId },
      data,
    });

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
