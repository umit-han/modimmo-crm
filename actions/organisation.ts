"use server";

import { db } from "@/prisma/db";

export async function getOrganizationByUserId(userId: string) {
  try {
    // First, get the user with their organization
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        organisation: true,
      },
    });

    if (!user?.organisation) {
      return null;
    }

    return user.organisation;
  } catch (error) {
    console.error("Error fetching organization:", error);
    return null;
  }
}
