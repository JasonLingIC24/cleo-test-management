import type { ArtifactAcquisitionOptions } from "../models/artifactAcquisitionOptions.js";

export async function acquireArtifacts(
  options: ArtifactAcquisitionOptions,
): Promise<void> {
  console.log("📦 Acquire Results");

  console.log(`Owner : ${options.owner}`);
  console.log(`Repo  : ${options.repo}`);
  console.log(`RunId : ${options.runId}`);

  console.log("⚠️ Artifact acquisition not yet implemented");
}
