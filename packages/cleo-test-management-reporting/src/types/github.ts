export interface GithubConfig {
  owner: string;
  repo: string;
  token: string;
}

export interface WorkflowArtifact {
  id: number;
  name: string;
  sizeInBytes: number;
  createdAt: string | null;
  expired: boolean;
}

export interface DownloadArtifactsOptions {
  runId: number;
  outputDir: string;
}
