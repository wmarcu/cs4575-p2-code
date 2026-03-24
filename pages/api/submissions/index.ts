import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { userId, problemId } = req.query;

      let query = db.select().from(submissions);

      if (userId) {
        query = query.where(eq(submissions.userId, Number(userId))) as typeof query;
      }
      if (problemId) {
        query = query.where(eq(submissions.problemId, Number(problemId))) as typeof query;
      }

      const results = await query
        .orderBy(asc(submissions.problemId), asc(submissions.energyConsumption));
      return res.status(200).json(results);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch submissions" });
    }
  }

  if (req.method === "POST") {
    try {
      const { userId, problemId, energyConsumption, code } = req.body;

      if (!userId || !problemId || energyConsumption === undefined) {
        return res
          .status(400)
          .json({ error: "userId, problemId, and energyConsumption are required" });
      }

      const [newSubmission] = await db
        .insert(submissions)
        .values({
          userId: Number(userId),
          problemId: Number(problemId),
          energyConsumption: Number(energyConsumption),
          code: code || null,
        })
        .returning();

      return res.status(201).json(newSubmission);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create submission" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
