export interface PipelineCommandOptions {
  phase1?: boolean;
  phase2?: boolean;
  phase3?: boolean;
  all?: boolean;
  version?: string;
  jira?: string;
  releaseKeys?: string;
  publish?: boolean;
  attachSummary?: boolean;
  attachReleaseNotes?: boolean;
}
