"use server";

import PurchaseOrderEmail, {
  PurchaseOrderEmailProps,
} from "@/components/email-templates/purchase-order-email";
import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
// Fetch all purchase orders with related data
export async function getPurchaseOrders() {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user.orgId ?? "";
    const purchaseOrders = await db.purchaseOrder.findMany({
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      where: {
        orgId,
      },
    });
    return purchaseOrders;
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function getPurchaseOrder(id: string) {
  try {
    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        deliveryLocation: true,
        createdBy: true,
        approvedBy: true,
        lines: {
          include: {
            item: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    return purchaseOrder;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getPurchaseOrderLineItems(purchaseOrderId: string) {
  try {
    const items = await db.purchaseOrderLine.findMany({
      where: {
        purchaseOrderId,
      },
      include: {
        item: true,
      },
    });
    return items;
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function getItems() {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user.orgId ?? "";
    // Fetch items for the form
    const items = await db.item.findMany({
      orderBy: {
        name: "asc",
      },
      where: {
        orgId,
      },
    });
    return items;
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function getSuppliers() {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user.orgId ?? "";

    // Fetch suppliers for the form
    const suppliers = await db.supplier.findMany({
      orderBy: {
        name: "asc",
      },
      where: {
        orgId,
      },
    });
    return suppliers;
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function getLocations() {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user.orgId ?? "";

    // Fetch locations for the form
    const locations = await db.location.findMany({
      orderBy: {
        name: "asc",
      },
      where: {
        orgId,
      },
    });
    return locations;
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function getPurchaseOrderNumber() {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user.orgId ?? "";

    const poCount = await db.purchaseOrder.count({
      where: {
        orgId,
      },
    });
    const poNumber = `PO-${(poCount + 1).toString().padStart(5, "0")}`;
    return poNumber;
  } catch (error) {
    console.log(error);
    return "";
  }
}

export async function createPurchaseOrder(data: {
  poNumber: string;
  date: Date;
  supplierId: string;
  deliveryLocationId: string;
  expectedDeliveryDate: Date | null;
  paymentTerms: string | null;
  notes: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  lines: {
    itemId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    subtotal: number;
    taxAmount: number;
    total: number;
  }[];
}) {
  try {
    // Get the current user (adjust based on your auth setup)
    const user = await getAuthenticatedUser();
    const orgId = user.orgId ?? "";

    // Get the supplier name for reference
    const supplier = await db.supplier.findUnique({
      where: { id: data.supplierId },
      select: { name: true },
    });

    // Create the purchase order with lines
    const purchaseOrder = await db.purchaseOrder.create({
      data: {
        poNumber: data.poNumber,
        date: data.date,
        supplierId: data.supplierId,
        supplierName: supplier?.name,
        deliveryLocationId: data.deliveryLocationId,
        status: "DRAFT",
        subtotal: data.subtotal,
        taxAmount: data.taxAmount,
        total: data.total,
        notes: data.notes,
        paymentTerms: data.paymentTerms,
        expectedDeliveryDate: data.expectedDeliveryDate,
        createdById: user.id,
        orgId: orgId,
        lines: {
          create: data.lines.map((line) => ({
            itemId: line.itemId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate,
            taxAmount: line.taxAmount,
            total: line.total,
          })),
        },
      },
    });

    // Revalidate the purchase orders page
    revalidatePath("/dashboard/purchases/purchase-orders");

    return { success: true, id: purchaseOrder.id };
  } catch (error) {
    console.error("Failed to create purchase order:", error);
    throw new Error("Failed to create purchase order");
  }
}

export async function sendPurchaseOderEmail(
  data: PurchaseOrderEmailProps,
  email: string
) {
  try {
    await db.purchaseOrder.update({
      where: {
        poNumber: data.poData.poNumber,
      },
      data: {
        status: "SUBMITTED",
      },
    });
    data.poData.status = "SUBMITTED";
    const res = await resend.emails.send({
      from: "Inventory Pro <info@desishub.com>",
      to: "gmukejohnbaptist@gmail.com",
      subject: `New Purchase Order from ${data.companyInfo.name}`,
      react: PurchaseOrderEmail({ data }),
    });
    revalidatePath("/dashboard/purchases/purchase-orders");
    return {
      success: true,
    };
  } catch (error) {
    console.log(error);
  }
}
