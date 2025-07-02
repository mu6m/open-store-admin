"use server";

import { db } from "@/db";
import { orders, users, products, categories } from "@/db/schema";
import { eq, count, desc, ilike, and, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  price: string;
  status: string;
  selectedDetails: any;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    number: string | null;
    address: string | null;
  };
  product: {
    id: string;
    name: string;
    price: string;
    category: {
      id: string;
      name: string;
    } | null;
  };
}

export interface OrdersResult {
  orders: Order[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getOrdersData(
  page: number = 1,
  pageSize: number = 10,
  searchTerm?: string,
  userId?: string
): Promise<OrdersResult> {
  try {
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const whereConditions = [];

    if (userId) {
      whereConditions.push(eq(orders.userId, userId));
    }

    if (searchTerm) {
      const searchLower = `%${searchTerm.toLowerCase()}%`;
      whereConditions.push(
        or(
          ilike(orders.status, searchLower),
          ilike(users.number, searchLower),
          ilike(users.address, searchLower),
          ilike(products.name, searchLower)
        )
      );
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const totalCountResult = await db
      .select({ count: count() })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Get orders with relations
    const ordersData = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        productId: orders.productId,
        quantity: orders.quantity,
        price: orders.price,
        status: orders.status,
        selectedDetails: orders.selectedDetails,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        user: {
          id: users.id,
          number: users.number,
          address: users.address,
        },
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          category: {
            id: categories.id,
            name: categories.name,
          },
        },
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      orders: ordersData.map((order: any) => ({
        ...order,
        user: order.user || { id: "", number: null, address: null },
        product: {
          ...order.product,
          id: order.product?.id || "",
          name: order.product?.name || "Unknown Product",
          price: order.product?.price || "0",
          category: order.product?.category || null,
        },
      })) as Order[],
      totalCount: Number(totalCount),
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return {
      orders: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const orderData = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        productId: orders.productId,
        quantity: orders.quantity,
        price: orders.price,
        status: orders.status,
        selectedDetails: orders.selectedDetails,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        user: {
          id: users.id,
          number: users.number,
          address: users.address,
        },
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          category: {
            id: categories.id,
            name: categories.name,
          },
        },
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (!orderData[0]) return null;

    const order = orderData[0];
    return {
      ...order,
      user: order.user || { id: "", number: null, address: null },
      product: {
        ...order.product,
        id: order.product?.id || "",
        name: order.product?.name || "Unknown Product",
        price: order.product?.price || "0",
        category: order.product?.category || null,
      },
    } as Order;
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

export async function createOrder(data: {
  userId: string;
  productId: string;
  quantity: number;
  price: string;
  status?: string;
  selectedDetails?: any;
}) {
  try {
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: data.userId,
        productId: data.productId,
        quantity: data.quantity,
        price: data.price,
        status: data.status || "checking order",
        selectedDetails: data.selectedDetails || {},
      })
      .returning();

    revalidatePath("/admin/orders");
    return { success: true, order: newOrder };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { success: false, error: "Failed to create order" };
  }
}

export async function updateOrder(
  id: string,
  data: {
    quantity?: number;
    price?: string;
    status?: string;
    selectedDetails?: any;
  }
) {
  try {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    revalidatePath("/admin/orders");
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error("Failed to update order:", error);
    return { success: false, error: "Failed to update order" };
  }
}

export async function deleteOrder(id: string) {
  try {
    await db.delete(orders).where(eq(orders.id, id));
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete order:", error);
    return { success: false, error: "Failed to delete order" };
  }
}

// Get users for dropdown
export async function getUsersForSelect() {
  try {
    const usersData = await db
      .select({
        id: users.id,
        number: users.number,
      })
      .from(users)
      .orderBy(users.createdAt);

    return usersData;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

// Get products for dropdown
export async function getProductsForSelect() {
  try {
    const productsData = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
      })
      .from(products)
      .orderBy(products.name);

    return productsData;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}
