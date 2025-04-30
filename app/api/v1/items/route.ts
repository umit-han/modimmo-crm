import { generateSlug } from "@/lib/generateSlug";
import { db } from "@/prisma/db";
import { ItemCreateDTO } from "@/types/item";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const apiKey = headersList.get("x-api-key");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          data: null,
          error: "API Key is required",
          success: false,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validKey = await db.apiKey.findUnique({ where: { key: apiKey } });
    if (!validKey) {
      return new Response(
        JSON.stringify({
          data: null,
          error: "Invalid API Key",
          success: false,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Parse pagination parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    // Check if pagination is requested
    const isPaginated = pageParam !== null || limitParam !== null;

    if (isPaginated) {
      // Handle paginated request
      const page = parseInt(pageParam || "1");
      const limit = parseInt(limitParam || "10");
      const skip = (page - 1) * limit;

      // Get items with pagination
      const items = await db.item.findMany({
        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: limit,
      });

      // Get total count for pagination
      const totalItems = await db.item.count();

      // Calculate total pages
      const totalPages = Math.ceil(totalItems / limit);

      // Construct response with data and pagination
      const response = {
        success: true,
        data: {
          data: items,
          pagination: {
            total: totalItems,
            page,
            limit,
            pages: totalPages,
          },
        },
        error: null,
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Return all items without pagination
      const items = await db.item.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      // Construct response with just data
      const response = {
        success: true,
        data: {
          data: items,
          pagination: {
            total: items.length,
            page: 1,
            limit: items.length,
            pages: 1,
          },
        },
        error: null,
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        data: null,
        error: "Failed to create item",
        success: false,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data: ItemCreateDTO = await request.json();
    const slug = generateSlug(data.name);

    // Check if item already exists
    const existingItem = await db.item.findUnique({
      where: {
        slug,
      },
    });

    if (existingItem) {
      return new Response(
        JSON.stringify({
          data: null,
          error: "Item already exists",
          success: false,
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // Create new item
    data.slug = slug;
    const newItem = await db.item.create({
      data,
    });
    // console.log(newItem);
    // Return success response
    return new Response(
      JSON.stringify({
        data: newItem,
        error: null,
        success: true,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(error);

    // Return error response
    return new Response(
      JSON.stringify({
        data: null,
        error: "Failed to create item",
        success: false,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
