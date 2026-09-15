import { GithubArtifactService } from "../services/githubArtifactService.js";

export async function downloadArtifactsCommand(runId: number): Promise<void> {
  const service = new GithubArtifactService({
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
    token: process.env.GITHUB_TOKEN!,
  });

  const files = await service.downloadRunArtifacts(runId, "./artifacts");

  console.log(`Downloaded ${files.length} artifacts`);
}
