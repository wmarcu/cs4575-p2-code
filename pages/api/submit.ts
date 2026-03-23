import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import { problems, submissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SubmitResponse } from "@/types";
import { validateSolution } from "@/lib/validation/test-runner";
import { withLock } from "@/lib/energy/execution-queue";
import {
  withEnergyMonitoring,
  sleep,
} from "@/lib/energy/powerjoular";
import { startExecution, isCpuPinningEnabled, getPinnedCpu } from "@/lib/energy/direct-executor";

const ENERGY_MEASUREMENT_RUNS = parseInt(process.env.ENERGY_MEASUREMENT_RUNS || "10", 10);
const ENERGY_WARMUP_RUNS = parseInt(process.env.ENERGY_WARMUP_RUNS || "3", 10);
const ENERGY_MIN_DURATION_SEC = parseInt(process.env.ENERGY_MIN_DURATION_SEC || "3", 10);
const ENERGY_BASELINE_SEC = parseInt(process.env.ENERGY_BASELINE_SEC || "2", 10);

interface TestCase {
  args: unknown[];
  expected: unknown;
}

/**
 * Generate wrapper code for energy measurement.
 * Runs the function in a loop for the minimum duration to ensure measurable energy.
 */
function generateEnergyWrapper(userCode: string, functionName: string, args: unknown[]): string {
  const argsJson = JSON.stringify(args);
  return `
import json
import time

${userCode}

_args = json.loads('${argsJson.replace(/'/g, "\\'")}')
_min_duration = ${ENERGY_MIN_DURATION_SEC}

_start = time.time()
_count = 0

while True:
    ${functionName}(*_args)
    _count += 1
    if time.time() - _start >= _min_duration:
        break

_elapsed = time.time() - _start
print(json.dumps({"iterations": _count, "elapsed": _elapsed}))
`;
}

/**
 * Measure baseline (idle) power for the system.
 * This is subtracted from workload measurements to get accurate delta.
 */
async function measureBaseline(): Promise<number> {
  console.log("[Energy] Measuring baseline power for", ENERGY_BASELINE_SEC, "seconds...");

  try {
    const { energy } = await withEnergyMonitoring(async () => {
      await sleep(ENERGY_BASELINE_SEC * 1000);
    });

    const baselineWatts = energy.averageWatts;
    console.log("[Energy] Baseline power:", baselineWatts.toFixed(2), "W");

    return baselineWatts;
  } catch (error) {
    console.error("[Energy] Baseline measurement failed:", error);
    return 0;
  }
}

/**
 * Measure energy consumption for a single code execution.
 * Uses direct execution (after validation) with PowerJoular monitoring.
 */
async function measureEnergy(
  code: string,
  functionName: string,
  testCase: TestCase
): Promise<{ joules: number; iterations: number; error?: string }> {
  const wrappedCode = generateEnergyWrapper(code, functionName, testCase.args);

  const cpuPinned = isCpuPinningEnabled();
  const pinnedCpu = getPinnedCpu();
  console.log("[Energy] Starting measurement...");
  console.log("[Energy] CPU pinning:", cpuPinned ? `enabled (CPU ${pinnedCpu})` : "disabled");
  console.log("[Energy] Min duration:", ENERGY_MIN_DURATION_SEC, "sec");

  try {
    // Small delay for CPU to settle
    await sleep(100);

    const { result: execResult, energy } = await withEnergyMonitoring(async () => {
      const execution = startExecution(wrappedCode);
      console.log("[Energy] Target process PID:", execution.pid);
      return await execution.result;
    });

    console.log("[Energy] Code executed, exit code:", execResult.exitCode);

    // Parse iteration count from output
    let iterations = 0;
    try {
      const output = JSON.parse(execResult.stdout.trim());
      iterations = output.iterations || 0;
      console.log("[Energy] Completed", iterations, "iterations in", output.elapsed?.toFixed(2), "sec");
    } catch {
      console.log("[Energy] Could not parse iteration count");
    }

    console.log("[Energy] Parsed CSV result:", energy);

    return { joules: energy.totalJoules, iterations };
  } catch (error) {
    console.error("[Energy] Measurement error:", error);
    return {
      joules: 0,
      iterations: 0,
      error: error instanceof Error ? error.message : "Unknown error during energy measurement",
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubmitResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      validation: { passed: false, totalTests: 0, passedTests: 0, failedTests: [] },
      error: "Method not allowed",
    });
  }

  const { code, problemId, userId } = req.body;

  if (!code || !problemId || !userId) {
    return res.status(400).json({
      success: false,
      validation: { passed: false, totalTests: 0, passedTests: 0, failedTests: [] },
      error: "code, problemId, and userId are required",
    });
  }

  try {
    const result = await withLock(async () => {
      const [problem] = await db
        .select()
        .from(problems)
        .where(eq(problems.id, Number(problemId)))
        .limit(1);

      if (!problem) {
        return {
          success: false,
          validation: { passed: false, totalTests: 0, passedTests: 0, failedTests: [] },
          error: "Problem not found",
        };
      }

      const functionName = problem.functionName;
      const testCases = problem.testCases as TestCase[];

      if (!functionName || !testCases || testCases.length === 0) {
        return {
          success: false,
          validation: { passed: false, totalTests: 0, passedTests: 0, failedTests: [] },
          error: "Problem configuration error",
        };
      }

      const validation = await validateSolution(code, Number(problemId));

      if (!validation.passed) {
        return {
          success: false,
          validation,
        };
      }

      console.log("[Energy] === Starting energy measurement ===");
      const baselineWatts = await measureBaseline();

      console.log(`[Energy] Performing ${ENERGY_WARMUP_RUNS} warm-up runs...`);
      for (let i = 0; i < ENERGY_WARMUP_RUNS; i++) {
        console.log(`[Energy] Warm-up ${i + 1}/${ENERGY_WARMUP_RUNS}`);
        await measureEnergy(code, functionName, testCases[0]);
      }

      const energyRuns: number[] = [];
      const iterationCounts: number[] = [];
      const microJoulesPerIterationRuns: number[] = [];
      let measurementError: string | undefined;

      for (let i = 0; i < ENERGY_MEASUREMENT_RUNS; i++) {
        console.log(`[Energy] Measurement ${i + 1}/${ENERGY_MEASUREMENT_RUNS}`);
        const measurement = await measureEnergy(code, functionName, testCases[0]);
        if (measurement.error) {
          measurementError = measurement.error;
        }

        const durationSec = ENERGY_MIN_DURATION_SEC;
        const deltaJoules = Math.max(0, measurement.joules - (baselineWatts * durationSec));

        const runMicroJoulesPerIteration = measurement.iterations > 0 
          ? (deltaJoules / measurement.iterations) * 1_000_000 
          : 0;

        console.log(`[Energy] Run ${i + 1}: ${measurement.joules.toFixed(2)}J total, ${deltaJoules.toFixed(2)}J delta (baseline: ${baselineWatts.toFixed(2)}W), ${runMicroJoulesPerIteration.toFixed(4)} µJ/iter`);

        energyRuns.push(deltaJoules);
        iterationCounts.push(measurement.iterations);
        microJoulesPerIterationRuns.push(runMicroJoulesPerIteration);
      }

      const sortedRuns = [...energyRuns].sort((a, b) => a - b);
      const medianJoules = sortedRuns[Math.floor(sortedRuns.length / 2)];

      const totalJoules = energyRuns.reduce((a, b) => a + b, 0);
      const averageJoules = energyRuns.length > 0 ? totalJoules / energyRuns.length : 0;

      const totalIterations = iterationCounts.reduce((a, b) => a + b, 0);
      const avgIterations = iterationCounts.length > 0 ? totalIterations / iterationCounts.length : 0;

      const joulesPerIteration = avgIterations > 0 ? (medianJoules / avgIterations) : 0;
      const microJoulesPerIteration = joulesPerIteration * 1_000_000;

      console.log("[Energy] Summary:", {
        medianJoules: medianJoules.toFixed(2),
        averageJoules: averageJoules.toFixed(2),
        totalIterations,
        microJoulesPerIteration: microJoulesPerIteration.toFixed(4),
        baselineWatts: baselineWatts.toFixed(2),
      });

      const avgDeltaWatts = averageJoules / ENERGY_MIN_DURATION_SEC;

      const [newSubmission] = await db
        .insert(submissions)
        .values({
          userId: Number(userId),
          problemId: Number(problemId),
          energyConsumption: microJoulesPerIteration,
          code: code,
        })
        .returning();

      return {
        success: true,
        validation,
        energy: {
          medianJoules,
          averageJoules,
          microJoulesPerIteration,
          totalIterations,
          avgIterationsPerRun: Math.round(avgIterations),
          deltaWatts: avgDeltaWatts,
          baselineWatts,
          durationSec: ENERGY_MIN_DURATION_SEC,
          runs: energyRuns,
          runsMicroJoulesPerIteration: microJoulesPerIterationRuns,
          warmupRuns: ENERGY_WARMUP_RUNS,
        },
        submission: {
          id: newSubmission.id,
          energyConsumption: microJoulesPerIteration,
        },
        ...(measurementError && { error: `Warning: ${measurementError}` }),
      };
    });

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("Submit error:", error);

    if (error instanceof Error && error.message.includes("queue")) {
      return res.status(503).json({
        success: false,
        validation: { passed: false, totalTests: 0, passedTests: 0, failedTests: [] },
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      validation: { passed: false, totalTests: 0, passedTests: 0, failedTests: [] },
      error: error instanceof Error ? error.message : "Failed to process submission",
    });
  }
}
