import { Command } from "commander";
import {
  runPhase1,
  runPhase2,
  runPhase3,
} from "../services/pipelineService.js";
import { getConfig } from "../services/configService.js";
import { buildPipelineExecutionOptions } from "../builders/pipelineExecutionOptionsBuilder.js";
import { buildRuntimeContext } from "../builders/runtimeContextBuilder.js";
import type { PipelineCommandOptions } from "../models/pipelineCommandOptions.js";
import { buildPublishOptions } from "../builders/publishOptionsBuilder.js";

export function registerPipelineCommands(program: Command) {
  /* ============================================================
   RELEASE-PACK COMMAND - Run full release pack generation 
============================================================ */
  program
    .command("pipeline")
    .description("Run full release pipeline in phases")
    .option("--phase1", "Run validation & codemod")
    .option("--phase2", "Run transforms & reporting")
    .option("--phase3", "Run release + summary")
    .option("--prepare", "Run preparation workflow")
    .option("--analyse", "Run analysis workflow")
    .option("--release", "Run release workflow")
    .option("--all", "Run all phases")
    .option("--version <name>", "Release version")
    .option("--runId <id>", "GitHub workflow run id")
    .option("--refresh-artifacts", "Force re-download of workflow artifacts")
    .option("--jira <key>", "Jira issue key")
    .option("--releaseKeys <keys>", "Comma-separated Jira keys")
    .option("--publish", "Publish to Jira (phase3)")
    .option("--attach-summary")
    .option("--attach-release-notes")
    .action(async (opts: PipelineCommandOptions) => {
      try {
        const config = getConfig();
        const executionOptions = buildPipelineExecutionOptions(opts);
        const runtimeContext = buildRuntimeContext(executionOptions, config);
        const publishOptions = buildPublishOptions(opts);

        const runPrepare = opts.prepare || opts.phase1 || opts.all;
        const runAnalyse = opts.analyse || opts.phase2 || opts.all;
        const runRelease = opts.release || opts.phase3 || opts.all;

        if (!runPrepare && !runAnalyse && !runRelease) {
          console.log("❌ No workflow selected");
          process.exit(1);
        }

        if (runPrepare) {
          await runPhase1(runtimeContext);
        }

        if (runAnalyse) {
          await runPhase2(runtimeContext);
        }

        if (runRelease) {
          await runPhase3(runtimeContext, publishOptions);
        }
        console.log("🎉 Pipeline complete ✅");
      } catch (err: any) {
        console.error("❌ Pipeline failed");
        console.error(err.message);
        process.exit(1);
      }
    });
}
