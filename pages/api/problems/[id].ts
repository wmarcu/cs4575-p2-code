import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import { problems } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = Number(req.query.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid problem id" });
  }

  try {
    const [problem] = await db
      .select()
      .from(problems)
      .where(eq(problems.id, id));

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    return res.status(200).json(problem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch problem" });
  }
}
