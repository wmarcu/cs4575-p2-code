import { spawn, ChildProcess } from "child_process";

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  pid: number;
}

// CPU to pin execution to (undefined = no pinning)
const ENERGY_CPU = process.env.ENERGY_CPU ? parseInt(process.env.ENERGY_CPU, 10) : undefined;
const PYTHON_PATH = process.env.PYTHON_PATH || "python3";
const EXECUTION_TIMEOUT_MS = parseInt(process.env.EXECUTION_TIMEOUT_MS || "30000", 10);

/**
 * Start Python execution and return immediately.
 * Returns process handle and a promise for the result.
 */
export function startExecution(code: string): {
  process: ChildProcess;
  pid: number;
  result: Promise<ExecutionResult>;
} {
  const useCpuPinning = ENERGY_CPU !== undefined;
  const command = useCpuPinning ? "taskset" : PYTHON_PATH;
  const args = useCpuPinning
    ? ["-c", String(ENERGY_CPU), PYTHON_PATH, "-c", code]
    : ["-c", code];

  console.log(`[DirectExec] ${useCpuPinning ? `Pinning to CPU ${ENERGY_CPU}` : "No CPU pinning"}`);

  const proc = spawn(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
  });

  const pid = proc.pid || 0;
  console.log("[DirectExec] Started process with PID:", pid);

  let stdout = "";
  let stderr = "";

  proc.stdout?.on("data", (data) => {
    stdout += data.toString();
  });

  proc.stderr?.on("data", (data) => {
    stderr += data.toString();
  });

  const result = new Promise<ExecutionResult>((resolve) => {
    const timeout = setTimeout(() => {
      proc.kill("SIGKILL");
      resolve({ stdout, stderr: stderr + "\nExecution timed out", exitCode: 1, pid });
    }, EXECUTION_TIMEOUT_MS);

    proc.on("close", (code) => {
      clearTimeout(timeout);
      resolve({ stdout, stderr, exitCode: code || 0, pid });
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      resolve({ stdout, stderr: `Execution error: ${err.message}`, exitCode: 1, pid });
    });
  });

  return { process: proc, pid, result };
}

export function isCpuPinningEnabled(): boolean {
  return ENERGY_CPU !== undefined;
}

export function getPinnedCpu(): number | undefined {
  return ENERGY_CPU;
}
