import { db } from "@/db";
import { problems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LANGUAGE, LANGUAGE_VERSION } from "@/types";

export interface TestCase {
  args: unknown[];       // Arguments to pass to the function
  expected: unknown;     // Expected return value
}

export interface TestFailure {
  testIndex: number;
  input: string;
  expected: string;
  actual: string;
}

export interface ValidationResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: TestFailure[];
  error?: string;
}

const PISTON_URL = "http://localhost:2000/api/v2/execute";
const EXECUTION_TIMEOUT_MS = parseInt(process.env.EXECUTION_TIMEOUT_MS || "30000", 10);

/**
 * Execute code via Piston sandbox.
 */
async function executeCode(code: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXECUTION_TIMEOUT_MS);

  try {
    const response = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: LANGUAGE,
        version: LANGUAGE_VERSION,
        files: [{ content: code }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return { stdout: "", stderr: `Piston error: ${response.statusText}`, exitCode: 1 };
    }

    const json = await response.json();
    return {
      stdout: json.run.stdout || "",
      stderr: json.run.stderr || "",
      exitCode: json.run.code || 0,
    };
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      return { stdout: "", stderr: "Execution timed out", exitCode: 1 };
    }
    return { stdout: "", stderr: `Execution error: ${error}`, exitCode: 1 };
  }
}

/**
 * Generate wrapper code that calls the user's function with test arguments.
 */
function generateTestWrapper(userCode: string, functionName: string, args: unknown[]): string {
  const argsJson = JSON.stringify(args);
  return `
import json

# User code
${userCode}

# Test wrapper
_args = json.loads('${argsJson.replace(/'/g, "\\'")}')
_result = ${functionName}(*_args)
print(json.dumps(_result))
`;
}

/**
 * Normalize JSON output for comparison.
 */
function normalizeJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 0);
  } catch {
    return String(value);
  }
}

/**
 * Validate a solution against test cases for a given problem.
 */
export async function validateSolution(
  code: string,
  problemId: number
): Promise<ValidationResult> {
  // Fetch problem with test cases
  const [problem] = await db
    .select()
    .from(problems)
    .where(eq(problems.id, problemId))
    .limit(1);

  if (!problem) {
    return {
      passed: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: [],
      error: "Problem not found",
    };
  }

  // Get function name and test cases from problem
  const problemData = problem as {
    functionName?: string;
    testCases?: TestCase[];
  };

  const functionName = problemData.functionName;
  const testCases = problemData.testCases;

  if (!functionName) {
    return {
      passed: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: [],
      error: "Problem missing function name configuration",
    };
  }

  if (!testCases || testCases.length === 0) {
    return {
      passed: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: [],
      error: "No test cases available for this problem",
    };
  }

  const failedTests: TestFailure[] = [];
  let passedTests = 0;

  const validationPromises = testCases.map(async (testCase, i) => {
    const wrappedCode = generateTestWrapper(code, functionName, testCase.args);
    const result = await executeCode(wrappedCode);

    if (result.exitCode !== 0 || result.stderr) {
      return {
        passed: false,
        failure: {
          testIndex: i + 1,
          input: JSON.stringify(testCase.args),
          expected: JSON.stringify(testCase.expected),
          actual: `Error: ${result.stderr || "Runtime error"}`,
        }
      };
    }

    const actualOutput = result.stdout.trim();
    const expectedNormalized = normalizeJson(testCase.expected);

    let actualNormalized: string;
    try {
      actualNormalized = normalizeJson(JSON.parse(actualOutput));
    } catch {
      actualNormalized = actualOutput;
    }

    if (actualNormalized === expectedNormalized) {
      return { passed: true };
    } else {
      return {
        passed: false,
        failure: {
          testIndex: i + 1,
          input: JSON.stringify(testCase.args),
          expected: expectedNormalized,
          actual: actualOutput || "(no output)",
        }
      };
    }
  });

  const results = await Promise.all(validationPromises);

  for (const res of results) {
    if (res.passed) {
      passedTests++;
    } else if (res.failure) {
      failedTests.push(res.failure);
    }
  }

  // Sort failed tests to maintain consistent order
  failedTests.sort((a, b) => a.testIndex - b.testIndex);

  return {
    passed: failedTests.length === 0,
    totalTests: testCases.length,
    passedTests,
    failedTests,
  };
}

/**
 * Quick validation - only checks if code runs without errors.
 * Used for "Run Code" button without full test case validation.
 */
export async function quickValidate(code: string): Promise<{
  success: boolean;
  stdout: string;
  stderr: string;
}> {
  const result = await executeCode(code);
  return {
    success: result.exitCode === 0,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}
