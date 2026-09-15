import { Command } from "commander";
import fs from "fs";
import path from "path";
import { getReleaseStories } from "../services/jiraReleaseService.js";
import { configAccess } from "../services/configAccessService.js";
import { getConfig } from "../services/configService.js";
import { searchIssuesWithFields } from "../services/jiraClient.js";
import {
  runExportRequirementsCommand,
  runGenerateFeaturesCommand,
  runGenerateTestsCommand,
} from "cleo-test-generator";
import { filterIssuesByType } from "../services/jiraIssueFilterService.js";

export function registerJiraCommands(program: Command) {
  const jira = program.command("jira").description("Jira commands");

  jira
    .command("release-data")
    .requiredOption("--version <name>")
    .option("--output <path>", "Output JSON file")
    .option("--type <type>", "Filter by issue type (story, bug, task)") // ✅ NEW
    .action(async (opts) => {
      const stories = await getReleaseStories(opts.version);

      // ✅ Apply filter
      const filtered = filterIssuesByType(stories, opts.type);

      console.log(`📦 Final stories after filter: ${filtered.length}`);

      const outputPath = opts.output;

      if (outputPath) {
        const resolved = path.resolve(outputPath);

        fs.mkdirSync(path.dirname(resolved), { recursive: true });

        fs.writeFileSync(resolved, JSON.stringify(filtered, null, 2));
      } else {
        console.log(JSON.stringify(filtered, null, 2));
      }

      console.log("✅ DONE");
    });

  jira
    .command("generate-tests")
    .requiredOption("--version <name>", "Jira version")
    .option("--type <type>", "Filter issue type (story, bug, task)")
    .option(
      "--output <path>",
      "Output directory",
      configAccess.getAutomatedTestResults(),
    )
    .action(async (opts) => {
      try {
        console.log("🚀 Generating tests from Jira...\n");

        // ✅ STEP 1: fetch stories (YOU ALREADY HAVE THIS)
        const stories = await getReleaseStories(opts.version);

        // ✅ STEP 2: filter (reuse your logic)
        const filtered = filterIssuesByType(stories, opts.type);

        console.log(
          `📦 Filtered Stories going into generator: ${filtered.length}`,
        );

        const baseOutput = opts.output ? path.resolve(opts.output) : undefined;

        const featuresDir = baseOutput
          ? path.join(baseOutput, "features")
          : path.join(configAccess.getOutputFeatures(), "jira");

        const testCasesDir = baseOutput
          ? path.join(baseOutput, "json", "test-cases")
          : path.join(configAccess.getJsonReports(), "jira", "test-cases");

        const summaryDir = baseOutput
          ? path.join(baseOutput, "json", "summary")
          : path.join(configAccess.getJsonReports(), "jira", "summary");

        // ✅ Call generator
        await runGenerateTestsCommand(filtered, {
          featuresDir,
          testCasesDir,
          summaryDir,
        });

        console.log("\n✅ Test generation complete\n");
      } catch (err: any) {
        console.error("❌ Failed to generate tests");
        console.error(err.message);
        process.exit(1);
      }
    });

  jira
    .command("export-requirements")
    .description("Export Jira Epics and Stories to requirements JSON")
    .action(async () => {
      console.log("📦 Exporting Jira requirements...");

      const jira = getConfig().jira;

      const jql = `
    project = ${jira.projectKey}
    AND (
      issuetype = Epic
      OR (issuetype = Story AND parent IS NOT EMPTY)
    )
  `
        .replace(/\s+/g, " ")
        .trim();

      const stories = await searchIssuesWithFields(
        jql,
        ["summary", "description", "parent", "issuetype"],
        jira,
      );

      const outputFile = path.join(
        configAccess.getJsonReports(),
        "jira-requirements.json",
      );
      await runExportRequirementsCommand(stories, outputFile);
      console.log("✅ Jira requirements export complete");
    });

  jira
    .command("generate-features")
    .description("Generate BDD feature files from Jira stories")
    .action(async () => {
      console.log("🚀 generate-features started");

      await runGenerateFeaturesCommand(
        path.join(configAccess.getJsonReports(), "jira-requirements.json"),
        path.join(configAccess.getOutputFeatures(), "generated"),
      );

      console.log("✅ generate-features finished");
    });
}
