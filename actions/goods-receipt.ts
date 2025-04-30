"use server";

import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { GoodsReceipt } from "@/types/goods-receipt";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const goodsReceiptSchema = z.object({
  purchaseOrderId: z.string(),
  locationId: z.string(),
  notes: z.string().optional(),
  receivedById: z.string(),
  lines: z.array(
    z.object({
      purchaseOrderLineId: z.string(),
      itemId: z.string(),
      receivedQuantity: z.number().min(1),
      notes: z.string().optional(),
    })
  ),
});

type GoodsReceiptInput = z.infer<typeof goodsReceiptSchema>;

export async function createGoodsReceipt(input: GoodsReceiptInput) {
  try {
    // Validate the input
    const validatedData = goodsReceiptSchema.parse(input);

    // Get the user
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the organization ID from the session
    const orgId = user.orgId;
    if (!orgId) {
      return { success: false, error: "No organization found" };
    }

    // Generate a receipt number (you can customize this format)
    const date = new Date();
    const receiptNumber = `GR-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${Math.floor(
      Math.random() * 10000
    )
      .toString()
      .padStart(4, "0")}`;

    // Create the goods receipt and its lines in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the goods receipt
      const goodsReceipt = await tx.goodsReceipt.create({
        data: {
          receiptNumber,
          date: new Date(),
          purchaseOrderId: validatedData.purchaseOrderId,
          locationId: validatedData.locationId,
          status: "COMPLETED",
          notes: validatedData.notes || "",
          orgId,
          receivedById: validatedData.receivedById,
          lines: {
            create: validatedData.lines.map((line) => ({
              purchaseOrderLineId: line.purchaseOrderLineId,
              itemId: line.itemId,
              receivedQuantity: line.receivedQuantity,
              notes: line.notes || "",
              serialNumbers: [],
            })),
          },
        },
        include: {
          lines: true,
        },
      });

      // Update the received quantities in the purchase order lines
      for (const line of validatedData.lines) {
        // Get the current purchase order line
        const poLine = await tx.purchaseOrderLine.findUnique({
          where: { id: line.purchaseOrderLineId },
          select: { receivedQuantity: true },
        });

        if (!poLine) {
          throw new Error(
            `Purchase order line not found: ${line.purchaseOrderLineId}`
          );
        }

        // Update the received quantity
        await tx.purchaseOrderLine.update({
          where: { id: line.purchaseOrderLineId },
          data: {
            receivedQuantity: poLine.receivedQuantity + line.receivedQuantity,
          },
        });
      }
      // Update the PO
      await tx.purchaseOrder.update({
        where: {
          id: validatedData.purchaseOrderId,
        },
        data: {
          status: "RECEIVED",
        },
      });

      // Update inventory for each received item
      for (const line of validatedData.lines) {
        // Check if inventory record exists for this item at this location
        const existingInventory = await tx.inventory.findUnique({
          where: {
            itemId_locationId: {
              itemId: line.itemId,
              locationId: validatedData.locationId,
            },
          },
        });

        if (existingInventory) {
          // Update existing inventory record
          await tx.inventory.update({
            where: {
              id: existingInventory.id,
            },
            data: {
              quantity: existingInventory.quantity + line.receivedQuantity,
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new inventory record
          await tx.inventory.create({
            data: {
              itemId: line.itemId,
              locationId: validatedData.locationId,
              quantity: line.receivedQuantity,
              reservedQuantity: 0,
              orgId,
            },
          });
        }
      }

      return goodsReceipt;
    });

    // Revalidate the purchase order page
    revalidatePath(`/dashboard/purchases/purchase-orders`);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error creating goods receipt:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function getGoodsReceiptLineItems(orgId: string) {
  try {
    const goodsReceipts = await db.goodsReceipt.findMany({
      where: {
        orgId,
      },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            lines: true,
          },
        },
        lines: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });
    return goodsReceipts as GoodsReceipt[];
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function getGoodsReceiptById(id: string, orgId: string) {
  try {
    const goodsReceipt = await db.goodsReceipt.findUnique({
      where: {
        id: id,
        orgId: orgId,
      },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
          },
        },
        location: true,
        receivedBy: true,
      },
    });
    return goodsReceipt;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getGoodsReceiptLineTableItems(goodsReceiptId: string) {
  try {
    const goodsReceiptLines = await db.goodsReceiptLine.findMany({
      where: {
        goodsReceiptId,
      },
      include: {
        item: true,
        purchaseOrderLine: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return goodsReceiptLines;
  } catch (error) {
    console.log(error);
    return [];
  }
}
