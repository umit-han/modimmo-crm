// actions/reports.ts
"use server";

import { revalidatePath } from "next/cache";
import {
  AdjustmentType,
  TransferStatus,
  AdjustmentStatus,
} from "@prisma/client";
import { db } from "@/prisma/db";

// Get stock transfer statistics
export async function getStockTransferStats(
  orgId: string,
  period: "daily" | "weekly" | "monthly" = "monthly",
  fromDate?: Date,
  toDate?: Date
) {
  const now = new Date();
  const endDate = toDate || now;
  let startDate = fromDate;

  if (!startDate) {
    // Default to last 30 days if no date is provided
    startDate = new Date();
    startDate.setDate(now.getDate() - 30);
  }

  // Get transfers summary - count by status
  const transferCountsByStatus = await db.transfer.groupBy({
    by: ["status"],
    where: {
      orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
  });

  // Calculate total quantity moved
  const transferLines = await db.transferLine.findMany({
    where: {
      transfer: {
        orgId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        // Only include completed transfers in the quantity calculation
        status: TransferStatus.COMPLETED,
      },
    },
    select: {
      quantity: true,
    },
  });

  const totalQuantityMoved = transferLines.reduce(
    (sum, line) => sum + line.quantity,
    0
  );

  // Get transfers by location
  const transfersByLocation = await db.transfer.groupBy({
    by: ["fromLocationId", "toLocationId"],
    where: {
      orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: TransferStatus.COMPLETED,
    },
    _count: {
      id: true,
    },
  });

  // Get transfers trend over time
  let dateFormat: string;
  let dateField: string;

  switch (period) {
    case "daily":
      dateFormat = "%Y-%m-%d";
      dateField = "date";
      break;
    case "weekly":
      dateFormat = "%Y-W%W";
      dateField = "date";
      break;
    case "monthly":
    default:
      dateFormat = "%Y-%m";
      dateField = "date";
      break;
  }

  // Since Prisma doesn't support direct date formatting in groupBy,
  // we need to get the raw data and format on the application side
  const transfers = await db.transfer.findMany({
    where: {
      orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      date: true,
      status: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // Process the transfers to get a trend
  const transferTrend = processTimeTrend(transfers, period);

  return {
    totalTransfers: transfers.length,
    totalQuantityMoved,
    transferCountsByStatus,
    transfersByLocation,
    transferTrend,
  };
}

// Get stock adjustment statistics
export async function getStockAdjustmentStats(
  orgId: string,
  period: "daily" | "weekly" | "monthly" = "monthly",
  fromDate?: Date,
  toDate?: Date
) {
  const now = new Date();
  const endDate = toDate || now;
  let startDate = fromDate;

  if (!startDate) {
    // Default to last 30 days if no date is provided
    startDate = new Date();
    startDate.setDate(now.getDate() - 30);
  }

  // Get adjustments summary - count by type
  const adjustmentCountsByType = await db.adjustment.groupBy({
    by: ["adjustmentType"],
    where: {
      orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: AdjustmentStatus.COMPLETED,
    },
    _count: {
      id: true,
    },
  });

  // Calculate total quantity adjusted
  const adjustmentLines = await db.adjustmentLine.findMany({
    where: {
      adjustment: {
        orgId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: AdjustmentStatus.COMPLETED,
      },
    },
    select: {
      adjustedQuantity: true,
    },
  });

  const totalQuantityAdjusted = adjustmentLines.reduce(
    (sum, line) => sum + Math.abs(line.adjustedQuantity),
    0
  );

  // Get positive and negative adjustments
  const positiveAdjustments = adjustmentLines
    .filter((line) => line.adjustedQuantity > 0)
    .reduce((sum, line) => sum + line.adjustedQuantity, 0);

  const negativeAdjustments = adjustmentLines
    .filter((line) => line.adjustedQuantity < 0)
    .reduce((sum, line) => sum + Math.abs(line.adjustedQuantity), 0);

  // Get adjustments by location
  const adjustmentsByLocation = await db.adjustment.groupBy({
    by: ["locationId", "adjustmentType"],
    where: {
      orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: AdjustmentStatus.COMPLETED,
    },
    _count: {
      id: true,
    },
  });

  // Get adjustments over time
  const adjustments = await db.adjustment.findMany({
    where: {
      orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      date: true,
      adjustmentType: true,
      status: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // Process the adjustments to get a trend
  const adjustmentTrend = processTimeTrend(adjustments, period);

  // Get top 5 most frequently adjusted items
  const topAdjustedItems = await db.adjustmentLine.groupBy({
    by: ["itemId"],
    where: {
      adjustment: {
        orgId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: AdjustmentStatus.COMPLETED,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 5,
  });

  // Get full item details for the top adjusted items
  const topAdjustedItemsWithDetails = await Promise.all(
    topAdjustedItems.map(async (item) => {
      const itemDetails = await db.item.findUnique({
        where: {
          id: item.itemId,
        },
        select: {
          id: true,
          name: true,
          sku: true,
        },
      });

      return {
        ...itemDetails,
        count: item._count.id,
      };
    })
  );

  return {
    totalAdjustments: adjustments.length,
    totalQuantityAdjusted,
    positiveAdjustments,
    negativeAdjustments,
    adjustmentCountsByType,
    adjustmentsByLocation,
    adjustmentTrend,
    topAdjustedItems: topAdjustedItemsWithDetails,
  };
}

// Get recent transfers
export async function getRecentTransfers(orgId: string, limit: number = 10) {
  const transfers = await db.transfer.findMany({
    where: {
      orgId,
    },
    select: {
      id: true,
      transferNumber: true,
      date: true,
      status: true,
      fromLocation: {
        select: {
          id: true,
          name: true,
        },
      },
      toLocation: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      lines: {
        select: {
          quantity: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: limit,
  });

  // Calculate total quantity for each transfer
  return transfers.map((transfer) => ({
    ...transfer,
    totalQuantity: transfer.lines.reduce((sum, line) => sum + line.quantity, 0),
  }));
}

// Get recent adjustments
export async function getRecentAdjustments(orgId: string, limit: number = 10) {
  const adjustments = await db.adjustment.findMany({
    where: {
      orgId,
    },
    select: {
      id: true,
      adjustmentNumber: true,
      date: true,
      status: true,
      adjustmentType: true,
      reason: true,
      location: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      lines: {
        select: {
          adjustedQuantity: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: limit,
  });

  // Calculate net adjustment for each entry
  return adjustments.map((adjustment) => ({
    ...adjustment,
    netAdjustment: adjustment.lines.reduce(
      (sum, line) => sum + line.adjustedQuantity,
      0
    ),
  }));
}

// Helper function to format dates into time periods
function processTimeTrend(
  data: Array<{ date: Date; id: string; status?: any; adjustmentType?: any }>,
  period: "daily" | "weekly" | "monthly"
) {
  const trendsMap = new Map();

  data.forEach((item) => {
    let periodKey: string;
    const date = new Date(item.date);

    switch (period) {
      case "daily":
        periodKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
        break;
      case "weekly": {
        // Get the first day of the week (Sunday)
        const day = date.getDay();
        const diff = date.getDate() - day;
        const firstDayOfWeek = new Date(date);
        firstDayOfWeek.setDate(diff);
        periodKey = firstDayOfWeek.toISOString().split("T")[0];
        break;
      }
      case "monthly":
      default:
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
    }

    if (!trendsMap.has(periodKey)) {
      trendsMap.set(periodKey, { period: periodKey, count: 0 });
    }

    const current = trendsMap.get(periodKey);
    current.count += 1;
  });

  // Convert map to array and sort by period
  return Array.from(trendsMap.values()).sort((a, b) =>
    a.period.localeCompare(b.period)
  );
}

// Get location names for IDs
export async function getLocationNames(orgId: string) {
  const locations = await db.location.findMany({
    where: {
      orgId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return locations.reduce(
    (acc, location) => {
      acc[location.id] = location.name;
      return acc;
    },
    {} as Record<string, string>
  );
}

// Get combined stock movement report data
export async function getStockMovementReport(
  orgId: string,
  period: "daily" | "weekly" | "monthly" = "monthly",
  fromDate?: Date,
  toDate?: Date
) {
  const transferStats = await getStockTransferStats(
    orgId,
    period,
    fromDate,
    toDate
  );
  const adjustmentStats = await getStockAdjustmentStats(
    orgId,
    period,
    fromDate,
    toDate
  );
  const recentTransfers = await getRecentTransfers(orgId, 10);
  const recentAdjustments = await getRecentAdjustments(orgId, 10);
  const locationNames = await getLocationNames(orgId);
  const data = {
    transferStats,
    adjustmentStats,
    recentTransfers,
    recentAdjustments,
    locationNames,
  };
  return data;
}
