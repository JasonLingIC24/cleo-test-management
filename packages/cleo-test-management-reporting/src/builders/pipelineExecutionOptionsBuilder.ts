import type { PipelineCommandOptions } from "../models/pipelineCommandOptions.js";
import type { PipelineExecutionOptions } from "../models/pipelineExecutionOptions.js";

export function buildPipelineExecutionOptions(
  commandOptions: PipelineCommandOptions,
): PipelineExecutionOptions {
  const releaseKeys = commandOptions.releaseKeys
    ?.split(",")
    .map((key) => key.trim())
    .filter(Boolean);

  return {
    version: commandOptions.version,
    runId: commandOptions.runId ? Number(commandOptions.runId) : undefined,
    refreshArtifacts: commandOptions.refreshArtifacts,
    publish: commandOptions.publish,
    jiraKey: commandOptions.jira,
    sourceTag: commandOptions.tag,
    releaseKeys:
      releaseKeys && releaseKeys.length > 0 ? releaseKeys : undefined,
  };
}
