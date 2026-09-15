export interface PipelineExecutionOptions {
  version?: string;
  environment?: string;
  runId?: number;
  publish?: boolean;
  jiraKey?: string;
  releaseKeys?: string[];
}
