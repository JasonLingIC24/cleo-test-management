import { Command } from "commander";
import { getConfig } from "../services/configService.js";
import { buildPipelineExecutionOptions } from "../builders/pipelineExecutionOptionsBuilder.js";
import { buildRuntimeContext } from "../builders/runtimeContextBuilder.js";
import { buildArtifactAcquisitionOptions } from "../builders/artifactAcquisitionOptionsBuilder.js";
import { acquireArtifacts } from "../services/artifactAcquisitionService.js";
import type { PipelineCommandOptions } from "../models/pipelineCommandOptions.js";

export function registerAcquireResultsCommands(program: Command) {
  program
    .command("acquire-results")
    .description("Download and prepare workflow artifacts")
    .option("--runId <id>", "GitHub workflow run id")
    .action(async (opts: PipelineCommandOptions) => {
      try {
        const config = getConfig();

        const executionOptions = buildPipelineExecutionOptions(opts);

        const runtimeContext = buildRuntimeContext(executionOptions, config);

        const acquisitionOptions =
          buildArtifactAcquisitionOptions(runtimeContext);

        await acquireArtifacts(acquisitionOptions);
      } catch (err: any) {
        console.error("❌ Artifact acquisition failed");

        console.error(err.message);

        process.exit(1);
      }
    });
}
