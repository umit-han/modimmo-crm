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
import { CategoryProps, SupplierCreateDTO, SupplierDTO } from "@/types/types";
import { LocationType } from "@prisma/client";
import axios from "axios";
import { error } from "console";
import { revalidatePath } from "next/cache";

export async function createSupplier(data: SupplierCreateDTO) {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user.orgId;
    const location = await db.supplier.create({
      data: {
        ...data,
        orgId,
      },
    });
    return {
      success: true,
      data: location,
      error: null,
    };
  } catch (error) {
    console.log(error);
    return {
      success: true,
      error: "Failed to Create an Item",
      data: null,
    };
  }
}
export async function getOrgSuppliers() {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user.orgId;
    const suppliers = await db.supplier.findMany({
      where: {
        orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        contactPerson: true,
        phone: true,
        email: true,
        createdAt: true,
      },
    });
    return suppliers;
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function getBriefSuppliers() {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user.orgId;
    const suppliers = await db.supplier.findMany({
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
    return suppliers;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getSupplierById(id: string) {
  try {
    const supplier = await db.supplier.findUnique({
      where: {
        id,
      },
    });
    return supplier;
  } catch (error) {
    console.log(error);
    throw new Error("An unexpected error occurred");
  }
}
export async function updateSupplierById(
  id: string,
  data: Partial<SupplierDTO>
) {
  try {
    await db.supplier.update({
      where: {
        id,
      },
      data,
    });
    console.log("Updating supplier:", id, data);
    revalidatePath(`/dashboard/purchases/orders/${id}`);
    return { success: true };
  } catch (error) {
    console.log(error);
    return {
      success: false,
    };
  }
}

export async function deleteSupplier(id: string) {
  try {
    const supplier = await db.supplier.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
      },
    });
    if (!supplier) {
      return {
        success: false,
        data: null,
        error: "Not supplier Found",
      };
    }
    if (supplier.items.length > 0) {
      return {
        success: false,
        data: null,
        error: "Supplier with items cannot be deleted",
      };
    }

    const deleted = await db.supplier.delete({
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
