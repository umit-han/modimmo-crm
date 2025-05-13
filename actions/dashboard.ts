"use server";

import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import {Inventory} from "@/types/models"

// Server-side data fetching
export async function getDashboardData() {
  // Get total inventory value
  const user = await getAuthenticatedUser();
  const orgId = user.orgId;
  const inventoryItems = await db.inventory.findMany({
    include: {
      item: true,
    },
    where: {
      orgId,
    },
  });

  const totalValue = inventoryItems.reduce((sum: number, inv) => {
    return sum + inv.quantity * (inv.item.costPrice || 0);
  }, 0);

  // Get total items count
  const totalItems = await db.item.count();

  // Get low stock items
  const lowStockItems = await db.inventory.findMany({
    where: {
      item: {
        minStockLevel: {
          gt: 0,
        },
      },
      orgId,
      // quantity: {
      //   lte: db.item.fields.minStockLevel,
      // },
    },
    include: {
      item: true,
      location: true,
    },
    orderBy: {
      quantity: "asc",
    },
    take: 5,
  });

  // Get top selling items
  const topSellingItems = await db.item.findMany({
    orderBy: {
      salesCount: "desc",
    },
    where: {
      orgId,
    },
    take: 5,
  });

  // Get sales orders count and value
  const salesOrdersData = await db.salesOrder.aggregate({
    _count: {
      id: true,
    },
    _sum: {
      total: true,
    },
    where: {
      orgId,
    },
  });

  // Get purchase orders count and value
  const purchaseOrdersData = await db.purchaseOrder.aggregate({
    _count: {
      id: true,
    },
    _sum: {
      total: true,
    },
    where: {
      orgId,
    },
  });

  // Get recent customers
  const recentCustomers = await db.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    where: {
      orgId,
    },
  });

  // Get recent sales orders
  const recentSalesOrders = await db.salesOrder.findMany({
    include: {
      customer: true,
    },
    orderBy: {
      date: "desc",
    },
    take: 5,
    where: {
      orgId,
    },
  });

  return {
    inventoryValue: totalValue,
    totalItems,
    lowStockItems,
    topSellingItems,
    salesOrders: {
      count: salesOrdersData._count.id || 0,
      value: salesOrdersData._sum.total || 0,
    },
    purchaseOrders: {
      count: purchaseOrdersData._count.id || 0,
      value: purchaseOrdersData._sum.total || 0,
    },
    recentCustomers,
    recentSalesOrders,
  };
}
