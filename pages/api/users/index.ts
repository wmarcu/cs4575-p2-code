import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import { users } from "@/db/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const allUsers = await db.select().from(users);
      return res.status(200).json(allUsers);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, email, passwordHash } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: "name and email are required" });
      }

      const [newUser] = await db
        .insert(users)
        .values({ name, email, passwordHash: passwordHash || null })
        .returning();

      return res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create user" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
