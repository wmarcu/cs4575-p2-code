import type { NextApiRequest, NextApiResponse } from 'next'
import {LANGUAGE, LANGUAGE_VERSION, RunResponse} from "@/types";
import { quickValidate } from "@/lib/validation/test-runner";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RunResponse>
) {
  if (req.method !== "POST") {
    res.status(405).json({ stderr: "Expected POST", stdout: null, exitCode: 1 });
    return;
  }
  try {
    const result = await quickValidate(req.body.code);
    res.status(200).json({ stderr: result.stderr, stdout: result.stdout, exitCode: result.success ? 0 : 1 });
    return;
  } catch (err: any) {
    res.status(500).json({ stderr: "unknown error", stdout: null, exitCode: 1 });
    return;
  }
}

