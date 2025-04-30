"use server";
import SalesOrderEmail, {
  SalesOrderEmailProps,
} from "@/components/email-templates/sales-order-email";
import { getAuthenticatedUser } from "@/config/useAuth";
// actions/sales-orders.ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
import { db } from "@/prisma/db";
import { PaymentStatus, SalesOrderStatus, Source } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Fetch all sales orders
 */
export async function getSalesOrders(source: Source = "SALES_ORDER") {
  const user = await getAuthenticatedUser();
  const orgId = user.orgId ?? "";
  try {
    const salesOrders = await db.salesOrder.findMany({
      orderBy: {
        date: "desc",
      },
      where: {
        orgId,
        source,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        location: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return salesOrders;
  } catch (error) {
    console.error("Error fetching sales orders:", error);
    return null;
  }
}

/**
 * Get a single sales order by ID
 */
export async function getSalesOrderById(id: string) {
  try {
    const salesOrder = await db.salesOrder.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        location: true,
        createdBy: {
          select: {
            id: true,
            name: true,
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

    return salesOrder;
  } catch (error) {
    console.error("Error fetching sales order:", error);
    return null;
  }
}

/**
 * Create a new sales order
 */
export async function createSalesOrder(data: {
  date: Date;
  customerId?: string;
  locationId: string;
  status: string;
  paymentStatus: string;
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
    const orderNumber = `SO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
      date.getDate()
    ).padStart(2, "0")}-${Math.floor(Math.random() * 10000)
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
          status: data.status as SalesOrderStatus,
          paymentStatus: data.paymentStatus as PaymentStatus,
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

    revalidatePath("/dashboard/sales/orders");
    revalidatePath("/dashboard/inventory/stock");

    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating sales order:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Update a sales order's status
 */
export async function updateSalesOrderStatus(orderId: string, status: string) {
  try {
    const updatedOrder = await db.salesOrder.update({
      where: { id: orderId },
      data: { status: status as SalesOrderStatus },
    });

    revalidatePath(`/dashboard/sales/orders/${orderId}`);
    revalidatePath("/dashboard/sales/orders");

    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error("Error updating sales order status:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Update a sales order's payment status
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: string
) {
  try {
    const updatedOrder = await db.salesOrder.update({
      where: { id: orderId },
      data: { paymentStatus: paymentStatus as PaymentStatus },
    });

    revalidatePath(`/dashboard/sales/orders/${orderId}`);
    revalidatePath("/dashboard/sales/orders");

    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function sendSalesOrderEmail(
  data: SalesOrderEmailProps,
  email: string
) {
  try {
    // Update the order status to confirmed if it was a draft
    if (data.orderData.status === "DRAFT") {
      await db.salesOrder.update({
        where: {
          orderNumber: data.orderData.orderNumber,
        },
        data: {
          status: "CONFIRMED",
        },
      });
      data.orderData.status = "CONFIRMED";
    }

    // Send the email
    const res = await resend.emails.send({
      from: "Inventory Pro <info@desishub.com>",
      // Update with your sender email
      to: "gmukejohnbaptist@gmail.com",
      subject: `Order Confirmation: ${data.orderData.orderNumber} from ${data.companyInfo.name}`,
      react: SalesOrderEmail({ data }),
    });

    // Add a BCC to yourself to keep track of sent emails
    const companyMail = "desishub.info@gmail.com";
    // const companyMail = "desishub.info@gmail.com" || data.companyInfo.email;
    await resend.emails.send({
      from: "Inventory Pro <info@desishub.com>", // Update with your sender email
      to: companyMail, // Send a copy to your company email
      subject: `COPY: Order ${data.orderData.orderNumber} sent to ${email}`,
      react: SalesOrderEmail({ data }),
    });

    // Revalidate the sales orders page to reflect status changes
    revalidatePath("/dashboard/sales/orders");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error sending sales order email:", error);
    throw error;
  }
}

export async function getPOSSalesOrder(id: string, orgId: string) {
  try {
    const salesOrder = await db.salesOrder.findUnique({
      where: {
        id,
        orgId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        lines: {
          include: {
            item: {
              select: {
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
    });
    return;
  } catch (error) {
    console.log(error);
    return null;
  }
}
