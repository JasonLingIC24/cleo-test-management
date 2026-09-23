export interface PipelineExecutionOptions {
  version?: string;
  environment?: string;
  sourceTag?: string;
  runId?: number;
  refreshArtifacts?: boolean;
  publish?: boolean;
  jiraKey?: string;
  releaseKeys?: string[];
}
