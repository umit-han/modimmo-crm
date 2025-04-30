"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/config/useAuth";

const transferSchema = z.object({
  itemId: z.string(),
  fromLocationId: z.string(),
  toLocationId: z.string(),
  quantity: z.number().positive(),
  notes: z.string().optional(),
});

type TransferInput = z.infer<typeof transferSchema>;

export async function createTransfer(input: TransferInput) {
  try {
    // Validate the input
    const validatedData = transferSchema.parse(input);

    // Get the session
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the organization ID from the session
    const orgId = user.orgId;
    if (!orgId) {
      return { success: false, error: "No organization found" };
    }

    // Check if there's enough available quantity
    const sourceInventory = await db.inventory.findUnique({
      where: {
        itemId_locationId: {
          itemId: validatedData.itemId,
          locationId: validatedData.fromLocationId,
        },
        orgId,
      },
    });

    if (!sourceInventory) {
      return { success: false, error: "Source inventory not found" };
    }

    const availableQuantity =
      sourceInventory.quantity - sourceInventory.reservedQuantity;
    if (availableQuantity < validatedData.quantity) {
      return {
        success: false,
        error: `Not enough available quantity. Only ${availableQuantity} units available.`,
      };
    }

    // Generate a transfer number
    const date = new Date();
    const transferNumber = `TR-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
      date.getDate()
    ).padStart(2, "0")}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

    // Create the transfer and transfer line
    const transfer = await db.transfer.create({
      data: {
        transferNumber,
        date: new Date(),
        fromLocationId: validatedData.fromLocationId,
        toLocationId: validatedData.toLocationId,
        status: "DRAFT",
        notes: validatedData.notes || "",
        orgId,
        createdById: user.id,
        lines: {
          create: {
            itemId: validatedData.itemId,
            quantity: validatedData.quantity,
            notes: validatedData.notes || "",
            serialNumbers: [],
          },
        },
      },
      include: {
        lines: true,
      },
    });

    // Reserve the quantity in the source location
    await db.inventory.update({
      where: {
        id: sourceInventory.id,
      },
      data: {
        reservedQuantity: {
          increment: validatedData.quantity,
        },
      },
    });

    // Revalidate the inventory page
    revalidatePath("/inventory");
    revalidatePath("/transfers");

    return {
      success: true,
      data: transfer,
    };
  } catch (error) {
    console.error("Error creating transfer:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
// New function for batch transfers
export async function createBatchTransfer(input: {
  lines: Array<{
    itemId: string;
    fromLocationId: string;
    toLocationId: string;
    quantity: number;
  }>;
  notes: string;
  userId: string;
  orgId: string;
}) {
  try {
    // Validate that we have at least one line
    if (!input.lines.length) {
      return { success: false, error: "No items to transfer" };
    }

    // Generate a transfer number
    const date = new Date();
    const transferNumber = `TR-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
      date.getDate()
    ).padStart(2, "0")}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

    // Group lines by from/to location pairs
    const transferGroups = new Map();

    for (const line of input.lines) {
      const key = `${line.fromLocationId}-${line.toLocationId}`;
      if (!transferGroups.has(key)) {
        transferGroups.set(key, {
          fromLocationId: line.fromLocationId,
          toLocationId: line.toLocationId,
          lines: [],
        });
      }
      transferGroups.get(key).lines.push({
        itemId: line.itemId,
        quantity: line.quantity,
      });
    }

    // Create transfers for each group
    const transfers = [];

    for (const [_, group] of transferGroups.entries()) {
      // Use a transaction to ensure data consistency
      const transfer = await db.$transaction(async (tx) => {
        // Create the transfer
        const newTransfer = await tx.transfer.create({
          data: {
            transferNumber: `${transferNumber}-${transfers.length + 1}`,
            date: new Date(),
            fromLocationId: group.fromLocationId,
            toLocationId: group.toLocationId,
            status: "DRAFT",
            notes: input.notes,
            orgId: input.orgId,
            createdById: input.userId,
          },
        });

        // Create transfer lines and reserve inventory
        for (const line of group.lines) {
          // Check if there's enough available quantity
          const sourceInventory = await tx.inventory.findUnique({
            where: {
              itemId_locationId: {
                itemId: line.itemId,
                locationId: group.fromLocationId,
              },
              orgId: input.orgId,
            },
          });

          if (!sourceInventory) {
            throw new Error(
              `Source inventory not found for item ${line.itemId}`
            );
          }

          const availableQuantity =
            sourceInventory.quantity - sourceInventory.reservedQuantity;
          if (availableQuantity < line.quantity) {
            throw new Error(
              `Not enough available quantity for item ${line.itemId}. Only ${availableQuantity} units available.`
            );
          }

          // Create transfer line
          await tx.transferLine.create({
            data: {
              transferId: newTransfer.id,
              itemId: line.itemId,
              quantity: line.quantity,
              notes: "",
              serialNumbers: [],
            },
          });

          // Reserve the quantity in the source location
          await tx.inventory.update({
            where: {
              id: sourceInventory.id,
            },
            data: {
              reservedQuantity: {
                increment: line.quantity,
              },
            },
          });
        }

        return newTransfer;
      });

      transfers.push(transfer);
    }

    // Revalidate the inventory and transfers pages
    revalidatePath("/inventory");
    revalidatePath("/transfers");

    return {
      success: true,
      data: transfers,
    };
  } catch (error) {
    console.error("Error creating batch transfer:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
// This function would be used to approve a transfer
export async function approveTransfer(transferId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const transfer = await db.transfer.findUnique({
      where: {
        id: transferId,
        orgId: user.orgId,
      },
      include: {
        lines: true,
      },
    });

    if (!transfer) {
      return { success: false, error: "Transfer not found" };
    }

    if (transfer.status !== "DRAFT") {
      return {
        success: false,
        error: "Transfer can only be approved when in DRAFT status",
      };
    }

    // Update transfer status to APPROVED
    await db.transfer.update({
      where: {
        id: transferId,
      },
      data: {
        status: "APPROVED",
        approvedById: user.id,
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/transfers");
    revalidatePath(`/transfers/${transferId}`);

    return { success: true };
  } catch (error) {
    console.error("Error approving transfer:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// This function would be used to complete a transfer
export async function completeTransfer(transferId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    // Use a transaction to ensure data consistency
    await db.$transaction(async (tx) => {
      const transfer = await tx.transfer.findUnique({
        where: {
          id: transferId,
          orgId: user.orgId,
        },
        include: {
          lines: true,
        },
      });

      if (!transfer) {
        throw new Error("Transfer not found");
      }

      if (transfer.status !== "APPROVED" && transfer.status !== "IN_TRANSIT") {
        throw new Error("Transfer must be APPROVED or IN_TRANSIT to complete");
      }

      // Process each transfer line
      for (const line of transfer.lines) {
        // Get source inventory
        const sourceInventory = await tx.inventory.findUnique({
          where: {
            itemId_locationId: {
              itemId: line.itemId,
              locationId: transfer.fromLocationId,
            },
          },
        });

        if (!sourceInventory) {
          throw new Error(`Source inventory not found for item ${line.itemId}`);
        }

        // Update source inventory
        await tx.inventory.update({
          where: {
            id: sourceInventory.id,
          },
          data: {
            quantity: {
              decrement: line.quantity,
            },
            reservedQuantity: {
              decrement: line.quantity,
            },
          },
        });

        // Check if destination inventory exists
        const destInventory = await tx.inventory.findUnique({
          where: {
            itemId_locationId: {
              itemId: line.itemId,
              locationId: transfer.toLocationId,
            },
          },
        });

        if (destInventory) {
          // Update existing destination inventory
          await tx.inventory.update({
            where: {
              id: destInventory.id,
            },
            data: {
              quantity: {
                increment: line.quantity,
              },
            },
          });
        } else {
          // Create new destination inventory
          await tx.inventory.create({
            data: {
              itemId: line.itemId,
              locationId: transfer.toLocationId,
              quantity: line.quantity,
              reservedQuantity: 0,
              orgId: transfer.orgId,
            },
          });
        }
      }

      // Update transfer status
      await tx.transfer.update({
        where: {
          id: transferId,
        },
        data: {
          status: "COMPLETED",
        },
      });
    });

    revalidatePath("/inventory");
    revalidatePath("/transfers");
    revalidatePath(`/transfers/${transferId}`);

    return { success: true };
  } catch (error) {
    console.error("Error completing transfer:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// This function would be used to cancel a transfer
export async function cancelTransfer(transferId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Use a transaction to ensure data consistency
    await db.$transaction(async (tx) => {
      const transfer = await tx.transfer.findUnique({
        where: {
          id: transferId,
          orgId: user.orgId,
        },
        include: {
          lines: true,
        },
      });

      if (!transfer) {
        throw new Error("Transfer not found");
      }

      if (transfer.status === "COMPLETED") {
        throw new Error("Completed transfers cannot be cancelled");
      }

      // If the transfer is in DRAFT or APPROVED status, unreserve the quantities
      if (
        transfer.status === "DRAFT" ||
        transfer.status === "APPROVED" ||
        transfer.status === "IN_TRANSIT"
      ) {
        for (const line of transfer.lines) {
          // Get source inventory
          const sourceInventory = await tx.inventory.findUnique({
            where: {
              itemId_locationId: {
                itemId: line.itemId,
                locationId: transfer.fromLocationId,
              },
            },
          });

          if (sourceInventory) {
            // Unreserve the quantity
            await tx.inventory.update({
              where: {
                id: sourceInventory.id,
              },
              data: {
                reservedQuantity: {
                  decrement: line.quantity,
                },
              },
            });
          }
        }
      }

      // Update transfer status
      await tx.transfer.update({
        where: {
          id: transferId,
        },
        data: {
          status: "CANCELLED",
        },
      });
    });

    revalidatePath("/inventory");
    revalidatePath("/transfers");
    revalidatePath(`/transfers/${transferId}`);

    return { success: true };
  } catch (error) {
    console.error("Error cancelling transfer:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function getTransfers(orgId: string) {
  try {
    const transfers = await db.transfer.findMany({
      where: {
        orgId,
      },
      include: {
        fromLocation: true,
        toLocation: true,
        lines: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return transfers;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getTransferById(id: string, orgId: string) {
  try {
    const transfer = await db.transfer.findUnique({
      where: {
        id,
        orgId,
      },
      include: {
        fromLocation: true,
        toLocation: true,
        createdBy: true,
        approvedBy: true,
      },
    });
    return transfer;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getTransferTotalQuantity(transferId: string) {
  try {
    const totalQuantity = await db.transferLine.aggregate({
      where: {
        transferId,
      },
      _sum: {
        quantity: true,
      },
    });
    return totalQuantity;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getTransferLineTableItems(transferId: string) {
  try {
    const lines = await db.transferLine.findMany({
      where: {
        transferId,
      },
      include: {
        item: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return lines;
  } catch (error) {
    console.log(error);
    return [];
  }
}
