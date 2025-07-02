"use server";

import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export interface User {
  id: string;
  number: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
  orderCount: number;
}

export async function getUsersData(): Promise<User[]> {
  try {
    const usersWithOrderCount = await db
      .select({
        id: users.id,
        number: users.number,
        address: users.address,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        orderCount: count(orders.id),
      })
      .from(users)
      .leftJoin(orders, eq(users.id, orders.userId))
      .groupBy(
        users.id,
        users.number,
        users.address,
        users.createdAt,
        users.updatedAt
      );

    return usersWithOrderCount.map((user) => ({
      ...user,
      orderCount: Number(user.orderCount),
    }));
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

// Optional: Add pagination support for server-side pagination
export async function getUsersWithPagination(
  page: number = 1,
  pageSize: number = 10,
  searchTerm?: string
): Promise<{ users: User[]; totalCount: number }> {
  try {
    const offset = (page - 1) * pageSize;

    // Build the base query
    let query = db
      .select({
        id: users.id,
        number: users.number,
        address: users.address,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        orderCount: count(orders.id),
      })
      .from(users)
      .leftJoin(orders, eq(users.id, orders.userId))
      .groupBy(
        users.id,
        users.number,
        users.address,
        users.createdAt,
        users.updatedAt
      )
      .limit(pageSize)
      .offset(offset);

    // Add search functionality if needed
    // Note: You'll need to modify this based on your exact search requirements
    const usersWithOrderCount = await query;

    // Get total count for pagination
    const totalCountResult = await db.select({ count: count() }).from(users);

    const totalCount = Number(totalCountResult[0]?.count || 0);

    const formattedUsers = usersWithOrderCount.map((user) => ({
      ...user,
      orderCount: Number(user.orderCount),
    }));

    return {
      users: formattedUsers,
      totalCount,
    };
  } catch (error) {
    console.error("Failed to fetch users with pagination:", error);
    return { users: [], totalCount: 0 };
  }
}
