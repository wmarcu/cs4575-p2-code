import type { NextApiRequest, NextApiResponse } from 'next'
import {LANGUAGE, LANGUAGE_VERSION, RunResponse} from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RunResponse>
) {
  if (req.method !== "POST") {
    res.status(405).json({ stderr: "Expected POST", stdout: null, exitCode: 1 });
    return;
  }
  try {
    const response = await fetch("http://localhost:2000/api/v2/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: LANGUAGE,
        version: LANGUAGE_VERSION,
        files: [
          {"content": req.body.code}
        ]
      })
    });
    if (!response.ok) {
      res.status(500).json({ stderr: response.statusText, stdout: null, exitCode: 1 });
      return;
    } else {
      const json = await response.json();
      console.log(json);
      res.status(200).json({ stderr: json.run.stderr, stdout: json.run.stdout, exitCode: 0 });
      return;
    }
  } catch {
    res.status(500).json({ stderr: "unknown error", stdout: null, exitCode: 1 });
    return;
  }
}
