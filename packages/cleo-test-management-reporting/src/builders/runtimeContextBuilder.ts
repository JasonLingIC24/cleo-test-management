import type { CleoConfig } from "../models/configModels.js";
import type { RuntimeContext } from "../models/runtimeContext.js";
import type { PipelineExecutionOptions } from "../models/pipelineExecutionOptions.js";

export function buildRuntimeContext(
  executionOptions: PipelineExecutionOptions,
  config: CleoConfig,
): RuntimeContext {
  const version = executionOptions.version ?? config.release.version;

  const environment =
    executionOptions.environment ?? config.release.environment;

  const publish = executionOptions.publish ?? false;

  const source = executionOptions.runId !== undefined ? "github" : "local";

  return {
    source,
    version,
    environment,
    owner: config.github.owner,
    repo: config.github.repo,
    runId: executionOptions.runId,
    publish,
    jiraKey: executionOptions.jiraKey,
    releaseKeys: executionOptions.releaseKeys,
  };
}
