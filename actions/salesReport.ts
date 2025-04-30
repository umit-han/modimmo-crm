// actions/salesReports.ts
"use server";
import { revalidatePath } from "next/cache";
import { SalesOrderStatus, PaymentStatus } from "@prisma/client";
import { db } from "@/prisma/db";

// Get sales summary statistics
export async function getSalesSummaryStats(
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

  // Get total sales revenue
  const salesRevenue = await db.salesOrder.aggregate({
    where: {
      orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        not: SalesOrderStatus.CANCELLED,
      },
    },
    _sum: {
      total: true,
    },
  });

  // Get order count
  const orderCounts = await db.salesOrder.groupBy({
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

  // Calculate total order count
  const totalOrders = orderCounts.reduce(
    (sum, item) => sum + item._count.id,
    0
  );

  // Get payment status distribution
  const paymentStatusDistribution = await db.salesOrder.groupBy({
    by: ["paymentStatus"],
    where: {
      orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        not: SalesOrderStatus.CANCELLED,
      },
    },
    _count: {
      id: true,
    },
    _sum: {
      total: true,
    },
  });

  // Calculate total items sold
  const salesLines = await db.salesOrderLine.findMany({
    where: {
      salesOrder: {
        orgId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: SalesOrderStatus.CANCELLED,
        },
      },
    },
    select: {
      quantity: true,
    },
  });

  const totalItemsSold = salesLines.reduce(
    (sum, line) => sum + line.quantity,
    0
  );

  // Get sales trend over time
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

  // Get all sales orders for trend analysis
  const salesOrders = await db.salesOrder.findMany({
    where: {
      orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        not: SalesOrderStatus.CANCELLED,
      },
    },
    select: {
      id: true,
      date: true,
      total: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // Process the sales orders to get a trend
  const salesTrend = processTimeTrend(salesOrders, period);

  return {
    totalSalesRevenue: salesRevenue._sum.total || 0,
    totalOrders,
    totalItemsSold,
    orderCounts,
    paymentStatusDistribution,
    salesTrend,
  };
}

// Get sales by customer
export async function getSalesByCustomer(
  orgId: string,
  fromDate?: Date,
  toDate?: Date,
  limit: number = 10
) {
  const now = new Date();
  const endDate = toDate || now;
  let startDate = fromDate;

  if (!startDate) {
    // Default to last 30 days if no date is provided
    startDate = new Date();
    startDate.setDate(now.getDate() - 30);
  }

  // Get all customers with sales
  const customersWithSales = await db.salesOrder.groupBy({
    by: ["customerId"],
    where: {
      orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        not: SalesOrderStatus.CANCELLED,
      },
      customerId: {
        not: null,
      },
    },
    _count: {
      id: true,
    },
    _sum: {
      total: true,
    },
    orderBy: {
      _sum: {
        total: "desc",
      },
    },
    take: limit,
  });

  // Get customer details for each customerId
  const customersData = await Promise.all(
    customersWithSales.map(async (item) => {
      if (!item.customerId) return null;

      const customer = await db.customer.findUnique({
        where: {
          id: item.customerId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      });

      return {
        customer,
        orderCount: item._count.id,
        totalSpent: item._sum.total || 0,
      };
    })
  );

  const filteredCustomersData = customersData.filter(Boolean);

  // Get recent orders for top customers
  const topCustomerIds = filteredCustomersData
    .map((item) => item?.customer?.id)
    .filter(Boolean);

  const recentOrders = await db.salesOrder.findMany({
    where: {
      orgId,
      customerId: {
        in: topCustomerIds as string[],
      },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      orderNumber: true,
      date: true,
      total: true,
      status: true,
      paymentStatus: true,
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 20,
  });

  return {
    customers: filteredCustomersData,
    recentOrders,
  };
}

// Get sales by item
export async function getSalesByItem(
  orgId: string,
  fromDate?: Date,
  toDate?: Date,
  limit: number = 10
) {
  const now = new Date();
  const endDate = toDate || now;
  let startDate = fromDate;

  if (!startDate) {
    // Default to last 30 days if no date is provided
    startDate = new Date();
    startDate.setDate(now.getDate() - 30);
  }

  // Get all items with sales
  const itemsWithSales = await db.salesOrderLine.groupBy({
    by: ["itemId"],
    where: {
      salesOrder: {
        orgId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: SalesOrderStatus.CANCELLED,
        },
      },
    },
    _sum: {
      quantity: true,
      total: true,
    },
    orderBy: {
      _sum: {
        total: "desc",
      },
    },
    take: limit,
  });

  // Get item details for each itemId
  const itemsData = await Promise.all(
    itemsWithSales.map(async (item) => {
      const itemDetails = await db.item.findUnique({
        where: {
          id: item.itemId,
        },
        select: {
          id: true,
          name: true,
          sku: true,
          sellingPrice: true,
          brand: {
            select: {
              name: true,
            },
          },
          category: {
            select: {
              title: true,
            },
          },
        },
      });

      return {
        item: itemDetails,
        quantitySold: item._sum.quantity || 0,
        totalRevenue: item._sum.total || 0,
        averagePrice: item._sum.quantity
          ? (item._sum.total || 0) / item._sum.quantity
          : 0,
      };
    })
  );

  // Get monthly sales trends for top items
  const topItemIds = itemsData.map((item) => item.item?.id).filter(Boolean);

  // Calculate sales trend per month for top items
  const salesTrends = await Promise.all(
    topItemIds.map(async (itemId) => {
      const monthlySales = await db.salesOrderLine.findMany({
        where: {
          itemId: itemId as string,
          salesOrder: {
            orgId,
            date: {
              gte: startDate,
              lte: endDate,
            },
            status: {
              not: SalesOrderStatus.CANCELLED,
            },
          },
        },
        select: {
          quantity: true,
          total: true,
          salesOrder: {
            select: {
              date: true,
            },
          },
        },
      });

      // Group by month
      const salesByMonth = monthlySales.reduce(
        (acc, sale) => {
          const date = new Date(sale.salesOrder.date);
          const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

          if (!acc[yearMonth]) {
            acc[yearMonth] = {
              quantity: 0,
              revenue: 0,
            };
          }

          acc[yearMonth].quantity += sale.quantity;
          acc[yearMonth].revenue += sale.total;

          return acc;
        },
        {} as Record<string, { quantity: number; revenue: number }>
      );

      // Convert to array and sort by month
      const salesTrend = Object.entries(salesByMonth)
        .map(([month, data]) => ({
          month,
          itemId: itemId as string,
          quantity: data.quantity,
          revenue: data.revenue,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return {
        itemId: itemId as string,
        trend: salesTrend,
      };
    })
  );

  return {
    items: itemsData,
    salesTrends,
  };
}

// Get combined sales report data
export async function getSalesReport(
  orgId: string,
  period: "daily" | "weekly" | "monthly" = "monthly",
  fromDate?: Date,
  toDate?: Date
) {
  const summaryStats = await getSalesSummaryStats(
    orgId,
    period,
    fromDate,
    toDate
  );
  const customerData = await getSalesByCustomer(orgId, fromDate, toDate, 10);
  const itemData = await getSalesByItem(orgId, fromDate, toDate, 10);

  return {
    summaryStats,
    customerData,
    itemData,
  };
}

// Helper function to format dates into time periods
function processTimeTrend(
  data: Array<{ date: Date; id: string; total?: number }>,
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
      trendsMap.set(periodKey, {
        period: periodKey,
        count: 0,
        total: 0,
      });
    }

    const current = trendsMap.get(periodKey);
    current.count += 1;
    current.total += item.total || 0;
  });

  // Convert map to array and sort by period
  return Array.from(trendsMap.values()).sort((a, b) =>
    a.period.localeCompare(b.period)
  );
}
