"use server";
import { db } from "@/prisma/db";
import { AdjustmentType } from "@prisma/client";
// actions/stock-adjustments.js
import { revalidatePath } from "next/cache";

export async function createStockAdjustment(input: {
  locationId: string;
  adjustmentType: string;
  reason: string;
  notes?: string;
  lines: Array<{
    itemId: string;
    beforeQuantity: number;
    afterQuantity: number;
    notes?: string;
    serialNumbers?: string[];
  }>;
  userId: string;
  orgId: string;
}) {
  try {
    // Validate that we have at least one line
    if (!input.lines.length) {
      return { success: false, error: "No items to adjust" };
    }

    // Generate an adjustment number
    const date = new Date();
    const adjustmentNumber = `ADJ-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
      date.getDate()
    ).padStart(2, "0")}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

    // Use a transaction to ensure data consistency
    const adjustment = await db.$transaction(async (tx) => {
      // Create the adjustment
      const newAdjustment = await tx.adjustment.create({
        data: {
          adjustmentNumber,
          date: new Date(),
          locationId: input.locationId,
          adjustmentType: input.adjustmentType as AdjustmentType,
          reason: input.reason,
          notes: input.notes || "",
          status: "DRAFT",
          orgId: input.orgId,
          createdById: input.userId,
        },
      });

      // Create adjustment lines and update inventory
      for (const line of input.lines) {
        const adjustedQuantity = line.afterQuantity - line.beforeQuantity;

        // Create adjustment line
        await tx.adjustmentLine.create({
          data: {
            adjustmentId: newAdjustment.id,
            itemId: line.itemId,
            beforeQuantity: line.beforeQuantity,
            afterQuantity: line.afterQuantity,
            adjustedQuantity,
            notes: line.notes || "",
            serialNumbers: line.serialNumbers || [],
          },
        });

        // Update inventory immediately for DRAFT adjustments
        // For a real system, you might want to wait until approval for certain types
        const inventoryEntry = await tx.inventory.findUnique({
          where: {
            itemId_locationId: {
              itemId: line.itemId,
              locationId: input.locationId,
            },
            orgId: input.orgId,
          },
        });

        if (inventoryEntry) {
          // Update existing inventory
          await tx.inventory.update({
            where: {
              id: inventoryEntry.id,
            },
            data: {
              quantity: line.afterQuantity,
            },
          });
        } else {
          // Create new inventory entry if it doesn't exist
          await tx.inventory.create({
            data: {
              itemId: line.itemId,
              locationId: input.locationId,
              quantity: line.afterQuantity,
              reservedQuantity: 0,
              orgId: input.orgId,
            },
          });
        }
      }

      return newAdjustment;
    });

    // Revalidate the inventory and adjustments pages
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/inventory/adjustments");

    return {
      success: true,
      data: adjustment,
    };
  } catch (error) {
    console.error("Error creating stock adjustment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function getStockAdjustments({
  orgId,
  page = 1,
  pageSize = 10,
  search = "",
  status,
  type,
  startDate,
  endDate,
}: {
  orgId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const skip = (page - 1) * pageSize;

    // Build filters
    const where: any = { orgId };

    if (search) {
      where.OR = [
        { adjustmentNumber: { contains: search, mode: "insensitive" } },
        { reason: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.adjustmentType = type;
    }

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      where.date = {
        gte: startDate,
      };
    } else if (endDate) {
      where.date = {
        lte: endDate,
      };
    }

    // Get total count for pagination
    const totalCount = await db.adjustment.count({ where });

    // Get adjustments with relations
    const adjustments = await db.adjustment.findMany({
      where,
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lines: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      skip,
      take: pageSize,
    });

    return {
      adjustments,
      pagination: {
        total: totalCount,
        pageCount: Math.ceil(totalCount / pageSize),
        page,
        pageSize,
      },
    };
  } catch (error) {
    console.error("Error fetching stock adjustments:", error);
    throw error;
  }
}

export async function getStockAdjustmentById(id: string) {
  try {
    const adjustment = await db.adjustment.findUnique({
      where: { id },
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lines: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    return adjustment;
  } catch (error) {
    console.error("Error fetching stock adjustment:", error);
    throw error;
  }
}

export async function approveStockAdjustment({
  adjustmentId,
  userId,
}: {
  adjustmentId: string;
  userId: string;
}) {
  try {
    const adjustment = await db.adjustment.update({
      where: { id: adjustmentId },
      data: {
        status: "APPROVED",
        approvedById: userId,
      },
    });

    // Revalidate paths
    revalidatePath("/inventory");
    revalidatePath("/adjustments");
    revalidatePath(`/adjustments/${adjustmentId}`);

    return {
      success: true,
      data: adjustment,
    };
  } catch (error) {
    console.error("Error approving stock adjustment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function cancelStockAdjustment({
  adjustmentId,
}: {
  adjustmentId: string;
}) {
  try {
    // Use a transaction to cancel adjustment and revert inventory changes
    const result = await db.$transaction(async (tx) => {
      // Get the adjustment with lines
      const adjustment = await tx.adjustment.findUnique({
        where: { id: adjustmentId },
        include: {
          lines: true,
        },
      });

      if (!adjustment) {
        throw new Error("Adjustment not found");
      }

      if (adjustment.status === "CANCELLED") {
        throw new Error("Adjustment is already cancelled");
      }

      // For each line, revert the inventory change
      for (const line of adjustment.lines) {
        const inventoryEntry = await tx.inventory.findUnique({
          where: {
            itemId_locationId: {
              itemId: line.itemId,
              locationId: adjustment.locationId,
            },
            orgId: adjustment.orgId,
          },
        });

        if (inventoryEntry) {
          // Revert back to before quantity
          await tx.inventory.update({
            where: {
              id: inventoryEntry.id,
            },
            data: {
              quantity: line.beforeQuantity,
            },
          });
        }
      }

      // Update adjustment status
      return await tx.adjustment.update({
        where: { id: adjustmentId },
        data: {
          status: "CANCELLED",
        },
      });
    });

    // Revalidate paths
    revalidatePath("/inventory");
    revalidatePath("/adjustments");
    revalidatePath(`/adjustments/${adjustmentId}`);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error cancelling stock adjustment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
