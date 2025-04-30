"use server";

import { CategoryFormProps } from "@/components/Forms/inventory/CategoryFormModal";
import { db } from "@/prisma/db";
import { CategoryProps } from "@/types/types";
import { error } from "console";
import { revalidatePath } from "next/cache";

export async function createCategory(data: CategoryFormProps) {
  const slug = data.slug;
  try {
    const existingCategory = await db.category.findUnique({
      where: {
        slug,
      },
    });
    if (existingCategory) {
      return {
        status: 409,
        data: null,
        error: "Category Already exists",
      };
    }
    const newCategory = await db.category.create({
      data,
    });
    // console.log(newCategory);
    revalidatePath("/dashboard/inventory/categories");
    return {
      status: 200,
      data: newCategory,
      error: null,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 200,
      error: "Something went wrong",
      data: null,
    };
  }
}
export async function getOrgCategories(orgId: string) {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        orgId,
      },
    });

    return categories;
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function updateCategoryById(id: string, data: CategoryProps) {
  try {
    const updatedCategory = await db.category.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/categories");
    return updatedCategory;
  } catch (error) {
    console.log(error);
  }
}
export async function getCategoryById(id: string) {
  try {
    const category = await db.category.findUnique({
      where: {
        id,
      },
    });
    return category;
  } catch (error) {
    console.log(error);
  }
}
export async function deleteCategory(id: string) {
  try {
    const deletedCategory = await db.category.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedCategory,
    };
  } catch (error) {
    console.log(error);
  }
}
// export async function createBulkCategories(categories: CategoryProps[]) {
//   try {
//     for (const category of categories) {
//       await createCategory(category);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

export async function getCategoriesWithItems(orgId: string) {
  try {
    // First get all categories
    const categories = await db.category.findMany({
      where: {
        orgId,
      },
      orderBy: {
        title: "asc",
      },
    });

    // Add "All Products" as a virtual category
    const allProductsCategory = {
      id: "all-products",
      title: "All Products",
      slug: "all-products",
      imageUrl: null,
      description: null,
      orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Get items with their inventory information for each category including "All"
    const categoriesWithItems = await Promise.all(
      [allProductsCategory, ...categories].map(async (category) => {
        const items = await db.item.findMany({
          where: {
            orgId,
            ...(category.id !== "all-products"
              ? { categoryId: category.id }
              : {}),
            isActive: true,
          },
          include: {
            inventories: true,
            category: true,
          },
          orderBy: {
            name: "asc",
          },
        });

        return {
          ...category,
          items,
        };
      })
    );

    return categoriesWithItems;
  } catch (error) {
    console.error("Error fetching categories with items:", error);
    throw new Error("Failed to load categories and items");
  }
}
