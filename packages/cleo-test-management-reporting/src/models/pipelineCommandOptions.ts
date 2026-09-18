export interface PipelineCommandOptions {
  phase1?: boolean;
  phase2?: boolean;
  phase3?: boolean;
  prepare?: boolean;
  analyse?: boolean;
  release?: boolean;
  all?: boolean;
  version?: string;
  runId?: string;
  refreshArtifacts?: boolean;
  jira?: string;
  releaseKeys?: string;
  publish?: boolean;
  attachSummary?: boolean;
  attachReleaseNotes?: boolean;
  attachBundle?: boolean;
}
