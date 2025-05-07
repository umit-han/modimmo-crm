"use server";

import { CategoryFormProps } from "@/components/Forms/inventory/CategoryFormModal";

import { api, getAuthenticatedApi } from "@/config/axios";
import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import {
  BriefItemsResponse,
  ItemCreateDTO,
  ProductData,
  ProductResponse,
} from "@/types/item";
import { LocationCreateDTO, LocationDTO } from "@/types/location";
import {
  CategoryProps,
  CustomerCreateDTO,
  CustomerDTO,
  SupplierCreateDTO,
  SupplierDTO,
} from "@/types/types";
import { LocationType } from "@/lib/constants/enums";
import {SalesOrder, StatusCount, PaymentStatusCount } from "@/types/actions/customers"
import axios from "axios";
import { error } from "console";
import { revalidatePath } from "next/cache";

export async function createCustomer(data: CustomerCreateDTO) {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user.orgId;
    const customer = await db.customer.create({
      data: {
        ...data,
        orgId,
      },
    });
    return {
      success: true,
      data: customer,
      error: null,
    };
  } catch (error) {
    console.log(error);
    return {
      success: true,
      error: "Failed to Create an Customer",
      data: null,
    };
  }
}
export async function getOrgCustomers() {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user.orgId;
    const customers = await db.customer.findMany({
      where: {
        orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        createdAt: true,
      },
    });
    return customers;
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function getBriefCustomers() {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user.orgId;
    const customers = await db.customer.findMany({
      where: {
        orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    });
    return customers;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getCustomerById(id: string) {
  try {
    const customer = await db.customer.findUnique({
      where: {
        id,
      },
    });
    return customer;
  } catch (error) {
    console.log(error);
    throw new Error("An unexpected error occurred");
  }
}
export async function updateCustomerById(
  id: string,
  data: Partial<CustomerDTO>
) {
  try {
    await db.customer.update({
      where: {
        id,
      },
      data,
    });
    console.log("Updating customer:", id, data);
    revalidatePath(`/dashboard/sales/customers/${id}`);
    return { success: true };
  } catch (error) {
    console.log(error);
    return {
      success: false,
    };
  }
}

export async function deleteCustomer(id: string) {
  try {
    const customer = await db.customer.findUnique({
      where: {
        id,
      },
      include: {
        salesOrders: true,
      },
    });
    if (!customer) {
      return {
        success: false,
        data: null,
        error: "Not supplier Found",
      };
    }
    if (customer.salesOrders.length > 0) {
      return {
        success: false,
        data: null,
        error: "Customer with Sales cannot be deleted",
      };
    }
    const deleted = await db.customer.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      data: deleted,
      error: null,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: null,
      error: "Failed to delete the supplier",
    };
  }
}

export async function getCustomerWithOrderHistory(customerId: string) {
  try {
    // Fetch customer details
    const customer = await db.customer.findUnique({
      where: { id: customerId },
      include: {
        salesOrders: {
          orderBy: {
            date: "desc",
          },
          include: {
            location: true,
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
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      return { success: false, error: "Customer not found" };
    }

    // Calculate some statistics
    const stats = {
      totalOrders: customer.salesOrders.length,
      totalSpent: customer.salesOrders.reduce(
        (sum: number, order: SalesOrder) =>
          order.status !== "CANCELLED" ? sum + order.total : sum,
        0
      ),
      completedOrders: customer.salesOrders.filter(
        (order: SalesOrder) => ["COMPLETED", "DELIVERED"].includes(order.status)
      ).length,
      cancelledOrders: customer.salesOrders.filter(
        (order: SalesOrder) => order.status === "CANCELLED"
      ).length,
      pendingPayment: customer.salesOrders
        .filter(
          (order: SalesOrder) =>
            order.paymentStatus !== "PAID" && order.status !== "CANCELLED"
        )
        .reduce((sum: number, order: SalesOrder) => sum + order.total, 0),
    };
    

    return {
      success: true,
      data: {
        customer,
        stats,
      },
    };
  } catch (error) {
    console.error("Error fetching customer with order history:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function getOrderStatusCounts(customerId: string) {
  try {
    const statusCounts = await db.salesOrder.groupBy({
      by: ["status"],
      where: {
        customerId,
      },
      _count: {
        status: true,
      },
    });

    const paymentStatusCounts = await db.salesOrder.groupBy({
      by: ["paymentStatus"],
      where: {
        customerId,
      },
      _count: {
        paymentStatus: true,
      },
    });

    return {
      success: true,
      data : {
        statusCounts: statusCounts.reduce(
          (acc: Record<string, number>, curr: StatusCount) => {
            acc[curr.status] = curr._count.status;
            return acc;
          },
          {} as Record<string, number>
        ),
        paymentStatusCounts: paymentStatusCounts.reduce(
          (acc: Record<string, number>, curr: PaymentStatusCount) => {
            acc[curr.paymentStatus] = curr._count.paymentStatus;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
    };
  } catch (error) {
    console.error("Error getting order status counts:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Gets recent orders for a customer
 */
export async function getRecentOrders(customerId: string, limit = 5) {
  try {
    const recentOrders = await db.salesOrder.findMany({
      where: {
        customerId,
      },
      orderBy: {
        date: "desc",
      },
      take: limit,
      include: {
        location: true,
      },
    });

    return {
      success: true,
      data: recentOrders,
    };
  } catch (error) {
    console.error("Error getting recent orders:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
