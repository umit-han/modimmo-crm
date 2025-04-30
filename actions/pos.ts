"use server";

import { revalidatePath } from "next/cache";
import { SalesOrderStatus, PaymentStatus, Source } from "@prisma/client";
import { db } from "@/prisma/db";

export async function createPOSSale(data: {
  date: Date;
  customerId?: string;
  locationId: string;
  paymentMethod?: string;
  subtotal: number;
  taxAmount: number;
  shippingCost?: number;
  discount?: number;
  total: number;
  notes?: string;
  userId: string;
  orgId: string;
  lines: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    discount?: number;
    total: number;
    serialNumbers?: string[];
  }>;
}) {
  try {
    // Generate order number
    const date = new Date();
    const orderNumber = `POS-${date.getFullYear()}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${Math.floor(
      Math.random() * 10000
    )
      .toString()
      .padStart(4, "0")}`;

    // Create order with lines in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the order
      const order = await tx.salesOrder.create({
        data: {
          orderNumber,
          date: data.date,
          customerId: data.customerId || null,
          locationId: data.locationId,
          source: Source.POS, // Set the source to POS
          status: SalesOrderStatus.COMPLETED, // POS sales are typically completed immediately
          paymentStatus: PaymentStatus.PAID, // POS sales are typically paid immediately
          paymentMethod: data.paymentMethod || null,
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          shippingCost: data.shippingCost || null,
          discount: data.discount || null,
          total: data.total,
          notes: data.notes || null,
          orgId: data.orgId,
          createdById: data.userId,
          lines: {
            create: data.lines.map((line) => ({
              itemId: line.itemId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              taxRate: line.taxRate,
              taxAmount: line.taxAmount,
              discount: line.discount || null,
              total: line.total,
              serialNumbers: line.serialNumbers || [],
            })),
          },
        },
      });

      // Update inventory levels for each line item
      for (const line of data.lines) {
        // Find current inventory at the specified location
        const existingInventory = await tx.inventory.findUnique({
          where: {
            itemId_locationId: {
              itemId: line.itemId,
              locationId: data.locationId,
            },
          },
        });

        // Get the item to update sales metrics
        const item = await tx.item.findUnique({
          where: { id: line.itemId },
        });

        if (item) {
          // Update item sales metrics
          await tx.item.update({
            where: { id: line.itemId },
            data: {
              salesCount: { increment: line.quantity },
              salesTotal: { increment: line.total },
            },
          });
        }

        if (existingInventory) {
          // Update inventory quantity
          await tx.inventory.update({
            where: {
              id: existingInventory.id,
            },
            data: {
              quantity: {
                decrement: line.quantity,
              },
            },
          });
        } else {
          // If no inventory record exists, create one with negative quantity
          // This indicates that we need to restock this item
          await tx.inventory.create({
            data: {
              itemId: line.itemId,
              locationId: data.locationId,
              quantity: -line.quantity,
              reservedQuantity: 0,
              orgId: data.orgId,
            },
          });
        }
      }

      return order;
    });

    revalidatePath("/pos");
    revalidatePath("/dashboard/sales/orders");
    revalidatePath("/dashboard/inventory/stock");

    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating POS sale:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
