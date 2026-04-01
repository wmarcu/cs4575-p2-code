import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import { problems } from "@/db/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const allProblems = await db.select().from(problems);
      return res.status(200).json(allProblems);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch problems" });
    }
  }

  if (req.method === "POST") {
    try {
      const { title, description, difficulty, examples, constraints, starterCode, complexity } = req.body;

      if (!title || !description || !complexity) {
        return res.status(400).json({ error: "title, description, and complexity are required" });
      }

      const [newProblem] = await db
        .insert(problems)
        .values({
          title,
          description,
          difficulty: difficulty || "easy",
          examples: examples || [],
          constraints: constraints || [],
          starterCode: starterCode || "",
          complexity,
        })
        .returning();

      return res.status(201).json(newProblem);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create problem" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
