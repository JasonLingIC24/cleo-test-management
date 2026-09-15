import type { PipelineCommandOptions } from "../models/pipelineCommandOptions.js";

import type { PublishOptions } from "../models/publishOptions.js";

export function buildPublishOptions(
  commandOptions: PipelineCommandOptions,
): PublishOptions {
  return {
    publish: commandOptions.publish ?? false,
    jiraKey: commandOptions.jira,
    attachSummary: commandOptions.attachSummary,
    attachReleaseNotes: commandOptions.attachReleaseNotes,
  };
}
