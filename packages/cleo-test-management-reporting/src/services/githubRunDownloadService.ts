import { GithubArtifactService } from "./githubArtifactService.js";
import { configAccess } from "./configAccessService.js";

export async function downloadRunOutputs(
  runId: number,
  outputDir: string,
): Promise<void> {
  const github = configAccess.getGithubConfig();

  const service = new GithubArtifactService({
    ...github,
    token: process.env.GITHUB_TOKEN ?? "",
  });

  await service.downloadRunArtifacts(runId, outputDir);
}
