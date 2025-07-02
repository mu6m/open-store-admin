"use server";

import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, count, ilike, desc, asc } from "drizzle-orm";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  quantity: number;
  quantityType: "limited" | "unlimited";
  categoryId: string | null;
  categoryName: string | null;
  images: string[];
  info: string;
  details: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface ProductsResponse {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getProductsData(
  page: number = 1,
  limit: number = 10,
  search?: string,
  categoryId?: string
): Promise<ProductsResponse> {
  try {
    const offset = (page - 1) * limit;

    let query: any = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        quantity: products.quantity,
        quantityType: products.quantityType,
        categoryId: products.categoryId,
        categoryName: categories.name,
        images: products.images,
        info: products.info,
        details: products.details,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    let countQuery: any = db.select({ count: count() }).from(products);

    // Apply filters
    if (search) {
      query = query.where(ilike(products.name, `%${search}%`));
      countQuery = countQuery.where(ilike(products.name, `%${search}%`));
    }

    if (categoryId) {
      query = query.where(eq(products.categoryId, categoryId));
      countQuery = countQuery.where(eq(products.categoryId, categoryId));
    }

    const [productsResult, totalCountResult] = await Promise.all([
      query.orderBy(desc(products.createdAt)).limit(limit).offset(offset),
      countQuery,
    ]);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      products: productsResult.map((product: any) => ({
        ...product,
        images: Array.isArray(product.images) ? product.images : [],
        details: Array.isArray(product.details) ? product.details : [],
      })),
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return {
      products: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export async function getCategoriesData(): Promise<Category[]> {
  try {
    const categoriesResult = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
      })
      .from(categories)
      .orderBy(asc(categories.name));

    return categoriesResult;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        quantity: products.quantity,
        quantityType: products.quantityType,
        categoryId: products.categoryId,
        categoryName: categories.name,
        images: products.images,
        info: products.info,
        details: products.details,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));

    if (result.length === 0) return null;

    const product = result[0];
    return {
      ...product,
      images: Array.isArray(product.images) ? product.images : [],
      details: Array.isArray(product.details) ? product.details : [],
    };
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export async function createProduct(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const quantity = parseInt(formData.get("quantity") as string) || 0;
    const quantityType = formData.get("quantityType") as
      | "limited"
      | "unlimited";
    const categoryId = formData.get("categoryId") as string;
    const info = formData.get("info") as string;
    const detailsJson = formData.get("details") as string;

    if (!name || !price) {
      return { success: false, error: "Name and price are required" };
    }

    // Handle image uploads
    const imageFiles = formData.getAll("images") as File[];
    const imageUrls: string[] = [];

    for (const file of imageFiles.slice(0, 5)) {
      // Max 5 images
      if (file.size > 0) {
        const blob = await put(file.name, file, {
          access: "public",
        });
        imageUrls.push(blob.url);
      }
    }

    // Parse details
    let details = [];
    try {
      details = detailsJson ? JSON.parse(detailsJson) : [];
    } catch (e) {
      console.error("Invalid details JSON:", e);
    }

    await db.insert(products).values({
      name,
      description: description || null,
      price,
      quantity,
      quantityType,
      categoryId: categoryId || null,
      images: imageUrls,
      info: info || "",
      details,
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const quantity = parseInt(formData.get("quantity") as string) || 0;
    const quantityType = formData.get("quantityType") as
      | "limited"
      | "unlimited";
    const categoryId = formData.get("categoryId") as string;
    const info = formData.get("info") as string;
    const detailsJson = formData.get("details") as string;
    const existingImages = formData.get("existingImages") as string;

    if (!name || !price) {
      return { success: false, error: "Name and price are required" };
    }

    // Get existing product for image cleanup
    const existingProduct = await getProductById(id);
    if (!existingProduct) {
      return { success: false, error: "Product not found" };
    }

    // Handle image uploads
    const imageFiles = formData.getAll("images") as File[];
    let imageUrls: string[] = [];

    // Parse existing images
    try {
      imageUrls = existingImages ? JSON.parse(existingImages) : [];
    } catch (e) {
      console.error("Invalid existing images JSON:", e);
    }

    // Add new images (ensure max 5 total)
    for (const file of imageFiles) {
      if (file.size > 0 && imageUrls.length < 5) {
        const blob = await put(file.name, file, {
          access: "public",
        });
        imageUrls.push(blob.url);
      }
    }

    // Parse details
    let details = [];
    try {
      details = detailsJson ? JSON.parse(detailsJson) : [];
    } catch (e) {
      console.error("Invalid details JSON:", e);
    }

    await db
      .update(products)
      .set({
        name,
        description: description || null,
        price,
        quantity,
        quantityType,
        categoryId: categoryId || null,
        images: imageUrls,
        info: info || "",
        details,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get product to delete associated images
    const product = await getProductById(id);
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Delete images from Vercel Blob
    for (const imageUrl of product.images) {
      try {
        await del(imageUrl);
      } catch (e) {
        console.error("Failed to delete image:", e);
      }
    }

    await db.delete(products).where(eq(products.id, id));

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

export async function deleteProductImage(
  productId: string,
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const product = await getProductById(productId);
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Remove image from array
    const updatedImages = product.images.filter((img) => img !== imageUrl);

    // Delete from Vercel Blob
    try {
      await del(imageUrl);
    } catch (e) {
      console.error("Failed to delete image from blob:", e);
    }

    // Update product
    await db
      .update(products)
      .set({
        images: updatedImages,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product image:", error);
    return { success: false, error: "Failed to delete image" };
  }
}
