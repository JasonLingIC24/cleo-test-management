import { buildArtifactAcquisitionOptions } from "../builders/artifactAcquisitionOptionsBuilder.js";
import { acquireArtifacts } from "./artifactAcquisitionService.js";
import type { RuntimeContext } from "../models/runtimeContext.js";

export async function acquireArtifactsForRuntimeContext(
  runtimeContext: RuntimeContext,
): Promise<void> {
  const options = buildArtifactAcquisitionOptions(runtimeContext);

  await acquireArtifacts(options);
}
