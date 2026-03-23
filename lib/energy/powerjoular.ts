import { spawn, ChildProcess } from "child_process";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export interface EnergyResult {
  totalJoules: number;
  averageWatts: number;
  durationMs: number;
  samples: number;
}

const POWERJOULAR_PATH = process.env.POWERJOULAR_PATH || "/usr/bin/powerjoular";
const SAMPLE_INTERVAL_MS = 1000; // PowerJoular samples every ~1 second

/**
 * Start PowerJoular monitoring and write output to CSV file.
 * Requires sudo permissions configured for passwordless execution.
 *
 * @param outputPath - Path to write CSV output
 * @param pid - Optional PID to monitor (uses -p flag for process-specific monitoring)
 */
async function startMonitoring(outputPath: string, pid?: number): Promise<ChildProcess> {
  console.log("[Energy] Starting PowerJoular at path:", POWERJOULAR_PATH);
  console.log("[Energy] Output will be written to:", outputPath);
  if (pid) {
    console.log("[Energy] Monitoring specific PID:", pid);
  } else {
    console.log("[Energy] Monitoring system-wide power");
  }

  return new Promise((resolve, reject) => {
    // Build args: with -p for process monitoring, without for system-wide
    const args = pid
      ? [POWERJOULAR_PATH, "-p", String(pid), "-f", outputPath]
      : [POWERJOULAR_PATH, "-f", outputPath];

    const process = spawn("sudo", args, {
      detached: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let started = false;

    process.on("error", (err) => {
      console.error("[Energy] PowerJoular process error:", err);
      if (!started) {
        reject(new Error(`Failed to start PowerJoular: ${err.message}`));
      }
    });

    process.stdout?.on("data", (data) => {
      console.log("[Energy] PowerJoular stdout:", data.toString());
    });

    process.stderr?.on("data", (data) => {
      const output = data.toString();
      console.log("[Energy] PowerJoular stderr:", output);
      // PowerJoular outputs to stderr when it starts
      if (output.includes("Started") || output.includes("power")) {
        started = true;
        resolve(process);
      }
    });

    // Give it a moment to start up
    setTimeout(() => {
      if (!started && process.pid) {
        console.log("[Energy] PowerJoular started via timeout, PID:", process.pid);
        started = true;
        resolve(process);
      } else if (!started) {
        reject(new Error("PowerJoular failed to start within timeout"));
      }
    }, 500);
  });
}

/**
 * Stop PowerJoular monitoring gracefully with SIGTERM.
 */
async function stopMonitoring(process: ChildProcess): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!process.pid) {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      // Force kill if graceful shutdown fails
      try {
        process.kill("SIGKILL");
      } catch {
        // Process may have already exited
      }
      resolve();
    }, 5000);

    process.on("exit", () => {
      clearTimeout(timeout);
      resolve();
    });

    process.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    // Send SIGTERM for graceful shutdown
    try {
      // Use process.kill which sends to the process group
      spawn("sudo", ["kill", "-TERM", String(process.pid)], {
        stdio: "ignore",
      });
    } catch {
      // Try direct kill as fallback
      process.kill("SIGTERM");
    }
  });
}

/**
 * Parse PowerJoular CSV output and calculate energy consumption.
 *
 * PowerJoular CSV format:
 * Date,CPU Utilization,Total Power,CPU Power,GPU Power
 *
 * We sum (CPU Power * sample_interval) to get total energy in Joules.
 */
async function parseEnergyCSV(csvPath: string): Promise<EnergyResult> {
  console.log("[Energy] Parsing CSV at:", csvPath);

  if (!existsSync(csvPath)) {
    console.log("[Energy] CSV file does not exist");
    return {
      totalJoules: 0,
      averageWatts: 0,
      durationMs: 0,
      samples: 0,
    };
  }

  const content = await readFile(csvPath, "utf-8");
  const lines = content.trim().split("\n");
  console.log("[Energy] CSV has", lines.length, "lines");

  if (lines.length < 2) {
    console.log("[Energy] CSV has no data rows");
    return {
      totalJoules: 0,
      averageWatts: 0,
      durationMs: 0,
      samples: 0,
    };
  }

  // Parse header to find CPU Power column
  const header = lines[0].split(",");
  console.log("[Energy] CSV header:", header);

  const cpuPowerIndex = header.findIndex(
    (col) => col.toLowerCase().includes("cpu power") || col.toLowerCase() === "cpu"
  );

  // Fallback: if no specific CPU Power column, use column index 3 (typical position)
  const powerColumnIndex = cpuPowerIndex !== -1 ? cpuPowerIndex : 3;
  console.log("[Energy] CPU Power column index:", powerColumnIndex);

  let totalPower = 0;
  let samples = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    if (values.length > powerColumnIndex) {
      const power = parseFloat(values[powerColumnIndex]);
      if (!isNaN(power) && power >= 0) {
        totalPower += power;
        samples++;
      }
    }
  }

  console.log("[Energy] Total power sum:", totalPower, "from", samples, "samples");

  if (samples === 0) {
    return {
      totalJoules: 0,
      averageWatts: 0,
      durationMs: 0,
      samples: 0,
    };
  }

  const averageWatts = totalPower / samples;
  const durationMs = samples * SAMPLE_INTERVAL_MS;
  // Energy (Joules) = Power (Watts) * Time (seconds)
  const totalJoules = totalPower * (SAMPLE_INTERVAL_MS / 1000);

  return {
    totalJoules,
    averageWatts,
    durationMs,
    samples,
  };
}

/**
 * Clean up temporary CSV files (needs sudo since files are created by root).
 */
async function cleanupFiles(...paths: string[]): Promise<void> {
  for (const path of paths) {
    try {
      if (existsSync(path)) {
        spawn("sudo", ["rm", "-f", path], { stdio: "ignore" });
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Generate a unique CSV path for energy measurement.
 */
function generateCsvPath(): string {
  const uuid = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  return `/tmp/jouleduel_energy_${timestamp}_${uuid}.csv`;
}

/**
 * Utility function to wait for a specified duration.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute an action while monitoring its system energy consumption.
 * Encapsulates the precise setup/teardown timing required for PowerJoular.
 */
export async function withEnergyMonitoring<T>(
  action: () => Promise<T>,
  pid?: number
): Promise<{ result: T; energy: EnergyResult }> {
  const csvPath = generateCsvPath();
  let powerjoularProcess: ChildProcess | undefined;
  
  try {
    powerjoularProcess = await startMonitoring(csvPath, pid);
    await sleep(500);

    const result = await action();

    await sleep(500);

    await stopMonitoring(powerjoularProcess);
    powerjoularProcess = undefined;

    await sleep(100);

    const energy = await parseEnergyCSV(csvPath);
    return { result, energy };
  } finally {
    if (powerjoularProcess) {
       try { await stopMonitoring(powerjoularProcess); } catch (e) {}
    }
    await cleanupFiles(csvPath);
  }
}
