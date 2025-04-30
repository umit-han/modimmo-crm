"use server";

import { db } from "@/prisma/db";
import { InventoryItem, Item } from "@/types/inventory";

export async function getInventoryItems(orgId: string) {
  try {
    const items = await db.item.findMany({
      where: {
        orgId,
      },
      include: {
        inventories: {
          select: {
            quantity: true,
            reservedQuantity: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return items as Item[];
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function getItemsWithInventories(orgId: string) {
  try {
    const items = await db.item.findMany({
      where: {
        orgId,
      },
      include: {
        inventories: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return items as Item[];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getInventoryItem(itemId: string, orgId: string) {
  try {
    const item = await db.item.findUnique({
      where: {
        id: itemId,
        orgId,
      },
      include: {
        inventories: {
          include: {
            location: true,
          },
        },
      },
    });
    return item as InventoryItem;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getInventoryLocations(orgId: string) {
  try {
    const locations = await db.location.findMany({
      where: {
        orgId,
      },
      orderBy: {
        name: "asc",
      },
    });
    return locations;
  } catch (error) {
    console.log(error);
    return [];
  }
}
