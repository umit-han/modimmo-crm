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
import { CategoryProps } from "@/types/types";
import { LocationType } from "@prisma/client";
import axios from "axios";
import { error } from "console";
import { revalidatePath } from "next/cache";

export async function createLocation(data: LocationCreateDTO) {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user.orgId;
    const location = await db.location.create({
      data: {
        ...data,
        type: data.type as LocationType,
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
export async function getOrgLocations() {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user.orgId;
    const locations = await db.location.findMany({
      where: {
        orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        type: true,
        address: true,
        phone: true,
        email: true,
        createdAt: true,
      },
    });
    return locations;
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function getLocationById(id: string) {
  try {
    const location = await db.location.findUnique({
      where: {
        id,
      },
    });
    return location;
  } catch (error) {
    console.log(error);
    throw new Error("An unexpected error occurred");
  }
}
export async function updateLocationById(
  id: string,
  data: Partial<LocationDTO>
) {
  try {
    await db.location.update({
      where: {
        id,
      },
      data,
    });
    console.log("Updating location:", id, data);
    // revalidatePath(`/dashboard/inventory/item/${id}`);
    return { success: true };
  } catch (error) {
    console.log(error);
    return {
      success: false,
    };
  }
}

export async function deleteLocation(id: string) {
  try {
    const location = await db.location.findUnique({
      where: {
        id,
      },
    });
    if (!location) {
      return {
        success: false,
        data: null,
        error: "Not location Found",
      };
    }

    const deleted = await db.location.delete({
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
      error: "Failed to delete the location",
    };
  }
}
