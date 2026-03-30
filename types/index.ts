export interface RunResponse {
  stdout: string | null;
  stderr: string | null;
  exitCode: number;
}

export interface EnergyMeasurement {
  medianJoules: number;
  averageJoules: number;
  microJoulesPerIteration: number;
  totalIterations: number;
  avgIterationsPerRun: number;
  deltaWatts: number;
  baselineWatts: number;
  durationSec: number;
  runs: number[];
  runsMicroJoulesPerIteration: number[];
  warmupRuns: number;
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

export interface SubmitResponse {
  success: boolean;
  validation: ValidationResult;
  energy?: EnergyMeasurement;
  submission?: { id: number; energyConsumption: number };
  error?: string;
}

export interface TestCase {
  args: unknown[];
  expected: unknown;
}

export interface ChallengeExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface Challenge {
  title: string;
  difficulty: string;
  description: string;
  examples: ChallengeExample[];
  constraints: string[];
  starterCode: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  energyConsumption: number;
  submittedAt: string;
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  starterCode: string;
  complexity: { time: string, space: string };
  createdAt: string;
}

export const LANGUAGE = "python";
export const LANGUAGE_VERSION = "3.12.0";
