"use server";

import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, count, ilike, or, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  id: string;
  name: string;
  description?: string;
}

export async function getCategoriesData(): Promise<Category[]> {
  try {
    const categoriesWithProductCount = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        productCount: count(products.id),
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .groupBy(
        categories.id,
        categories.name,
        categories.description,
        categories.createdAt,
        categories.updatedAt
      )
      .orderBy(desc(categories.createdAt));

    return categoriesWithProductCount.map((category) => ({
      ...category,
      productCount: Number(category.productCount),
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function searchCategories(
  searchTerm: string
): Promise<Category[]> {
  try {
    if (!searchTerm.trim()) {
      return getCategoriesData();
    }

    const categoriesWithProductCount = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        productCount: count(products.id),
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .where(
        or(
          ilike(categories.name, `%${searchTerm}%`),
          ilike(categories.description, `%${searchTerm}%`)
        )
      )
      .groupBy(
        categories.id,
        categories.name,
        categories.description,
        categories.createdAt,
        categories.updatedAt
      )
      .orderBy(desc(categories.createdAt));

    return categoriesWithProductCount.map((category) => ({
      ...category,
      productCount: Number(category.productCount),
    }));
  } catch (error) {
    console.error("Failed to search categories:", error);
    return [];
  }
}

export async function createCategory(
  data: CreateCategoryData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if category name already exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.name, data.name))
      .limit(1);

    if (existingCategory.length > 0) {
      return { success: false, error: "Category name already exists" };
    }

    await db.insert(categories).values({
      name: data.name,
      description: data.description || null,
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(
  data: UpdateCategoryData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if another category with the same name exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.name, data.name))
      .limit(1);

    if (existingCategory.length > 0 && existingCategory[0].id !== data.id) {
      return { success: false, error: "Category name already exists" };
    }

    const result = await db
      .update(categories)
      .set({
        name: data.name,
        description: data.description || null,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, data.id));

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if category has products
    const productsInCategory = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, id))
      .limit(1);

    if (productsInCategory.length > 0) {
      return {
        success: false,
        error: "Cannot delete category with existing products",
      };
    }

    await db.delete(categories).where(eq(categories.id, id));

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        productCount: count(products.id),
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .where(eq(categories.id, id))
      .groupBy(
        categories.id,
        categories.name,
        categories.description,
        categories.createdAt,
        categories.updatedAt
      )
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0],
      productCount: Number(result[0].productCount),
    };
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
}
