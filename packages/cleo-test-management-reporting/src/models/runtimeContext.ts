export type ExecutionSource = "local" | "github";

export interface RuntimeContext {
  source: ExecutionSource;
  version: string;
  environment: string;
  owner?: string;
  repo?: string;
  sourceTag?: string;
  runId?: number;
  refreshArtifacts?: boolean;
  publish: boolean;
  jiraKey?: string;
  releaseKeys?: string[];
}
