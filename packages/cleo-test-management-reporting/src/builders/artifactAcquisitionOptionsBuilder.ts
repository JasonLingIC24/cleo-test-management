import type { RuntimeContext } from "../models/runtimeContext.js";

import type { ArtifactAcquisitionOptions } from "../models/artifactAcquisitionOptions.js";

export function buildArtifactAcquisitionOptions(
  runtimeContext: RuntimeContext,
): ArtifactAcquisitionOptions {
  if (!runtimeContext.owner) {
    throw new Error(
      "RuntimeContext owner is required for artifact acquisition",
    );
  }

  if (!runtimeContext.repo) {
    throw new Error("RuntimeContext repo is required for artifact acquisition");
  }

  if (!runtimeContext.runId) {
    throw new Error(
      "RuntimeContext runId is required for artifact acquisition",
    );
  }

  return {
    owner: runtimeContext.owner,
    repo: runtimeContext.repo,
    runId: runtimeContext.runId,
    refreshArtifacts: runtimeContext.refreshArtifacts,
  };
}
