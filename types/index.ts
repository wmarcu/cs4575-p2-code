export interface Project {
  id: string;
  projectName: string;
}

export interface RunResponse {
  stdout: string | null;
  stderr: string | null;
  exitCode: number;
}