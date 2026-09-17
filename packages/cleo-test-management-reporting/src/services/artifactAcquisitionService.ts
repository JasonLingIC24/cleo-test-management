import { GithubArtifactService } from "./githubArtifactService.js";
import { configAccess } from "./configAccessService.js";
import { stageArtifactFiles } from "./artifactStagingService.js";

import type { ArtifactAcquisitionOptions } from "../models/artifactAcquisitionOptions.js";

export async function acquireArtifacts(
  options: ArtifactAcquisitionOptions,
): Promise<void> {
  console.log("📦 Acquire Results");

  console.log(`Owner : ${options.owner}`);
  console.log(`Repo  : ${options.repo}`);
  console.log(`RunId : ${options.runId}`);

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is required");
  }

  const github = new GithubArtifactService({
    owner: options.owner,
    repo: options.repo,
    token,
  });

  await github.validateRunArtifacts(options.runId);

  const runDirectory = github.getRunResultsDirectory(options.runId);

  const downloads = await github.downloadRunArtifacts(
    options.runId,
    runDirectory,
  );

  console.log(`✅ Downloaded ${downloads.length} artifact(s)`);

  downloads.forEach((file) => {
    console.log(` - ${file}`);
  });

  stageArtifactFiles(downloads, {
    backend: configAccess.getBackendResults(),
    frontend: configAccess.getFrontendResults(),
    cypress: configAccess.getCypressResults(),
  });

  console.log("✅ Artifacts staged for Phase 2 processing");
}
