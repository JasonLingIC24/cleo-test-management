export type ExecutionSource = "local" | "github";

export interface RuntimeContext {
  source: ExecutionSource;
  version: string;
  environment: string;
  owner?: string;
  repo?: string;
  runId?: number;
  publish: boolean;
  jiraKey?: string;
  releaseKeys?: string[];
}
