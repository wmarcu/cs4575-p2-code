import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email, and password are required" });
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash: password,
      })
      .returning();

    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Failed to create account" });
  }
}
