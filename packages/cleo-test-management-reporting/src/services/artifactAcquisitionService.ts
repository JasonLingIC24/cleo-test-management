import { GithubArtifactService } from "./githubArtifactService.js";

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

  const directories = await github.fetchRunArtifacts(options.runId);

  console.log(`✅ Downloaded and extracted ${directories.length} artifact(s)`);

  directories.forEach((dir) => {
    console.log(` - ${dir}`);
  });

  console.log(
    `📁 Results directory: ${github.getRunResultsDirectory(options.runId)}`,
  );
}
