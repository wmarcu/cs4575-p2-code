export interface RunResponse {
  stdout: string | null;
  stderr: string | null;
  exitCode: number;
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
  createdAt: string;
}

export const LANGUAGE = "python";
export const LANGUAGE_VERSION = "3.12.0";
