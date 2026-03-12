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