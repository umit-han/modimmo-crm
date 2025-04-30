import {
  Location,
  Inventory as PrismaInventory,
  Item as PrismaItem,
} from "@prisma/client";

// type ItemInventory = {
//   quantity: number;
//   reservedQuantity: number;
// };

export interface Item extends PrismaItem {
  inventories: PrismaInventory[];
}

interface Inventory extends PrismaInventory {
  location: Location;
}

export interface InventoryItem extends PrismaItem {
  inventories: Inventory[];
}
