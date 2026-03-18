import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import { submissions, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const problemId = Number(req.query.problemId);

  if (isNaN(problemId)) {
    return res.status(400).json({ error: "Invalid problemId" });
  }

  try {
    const rows = await db
      .select({
        submissionId: submissions.id,
        userId: submissions.userId,
        userName: users.name,
        energyConsumption: submissions.energyConsumption,
        submittedAt: submissions.createdAt,
      })
      .from(submissions)
      .innerJoin(users, eq(submissions.userId, users.id))
      .where(eq(submissions.problemId, problemId))
      .orderBy(asc(submissions.energyConsumption));

    const leaderboard = rows.map((row, index) => ({
      rank: index + 1,
      userId: row.userId,
      userName: row.userName,
      energyConsumption: row.energyConsumption,
      submittedAt: row.submittedAt,
    }));

    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
}
