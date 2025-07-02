"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { generateToken, validateCredentials } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  console.log("Login attempt for username:", username);

  if (!validateCredentials(username, password)) {
    console.log("Invalid credentials");
    redirect("/login?error=Invalid credentials");
  }

  try {
    const token = await generateToken(username);
    const cookieStore = await cookies();

    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    console.log("Login successful, cookie set");
  } catch (error) {
    console.error("Login error:", error);
    redirect("/login?error=Login failed");
  }
  redirect("/admin");
}
