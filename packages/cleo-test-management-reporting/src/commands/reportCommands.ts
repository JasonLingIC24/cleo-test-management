import { Command } from "commander";
import fs from "fs";
import { createTestSummaryReport } from "../services/testSummaryReportService.js";

import { buildTestSummaryContext } from "../services/reportContextService.js";
import { generateReleaseNotesFromKeys } from "../renderers/releaseNotes/releaseNotesService.js";
import { generateReleaseNotesFromVersion } from "../renderers/releaseNotes/releaseNotesService.js";

export function registerReportCommands(program: Command) {
  program
    .command("generate:test-summary-report")
    .description("Generate test summary report from mochawesome data")
    .action(async () => {
      try {
        const reportContext = await buildTestSummaryContext();

        const outputPath = await createTestSummaryReport(reportContext);

        console.log(`✅ Test Summary Report generated: ${outputPath}`);
      } catch (err: any) {
        console.error("❌ Failed to generate Test Summary Report");

        console.error(err.message);

        process.exit(1);
      }
    });

  program
    .command("generate:release-notes-from-keys")
    .description("Generate release notes from Jira tickets")
    .option("--jira <keys>", "Comma-separated Jira keys")
    .option("--file <path>", "Path to CSV file")
    .action(async (opts: { jira?: string; file?: string }) => {
      if (!opts.jira && !opts.file) {
        console.error("❌ Provide either --jira or --file");
        process.exit(1);
      }

      let jiraInput = opts.jira;

      if (opts.file) {
        jiraInput = fs.readFileSync(opts.file, "utf8");
      }

      try {
        console.log("📄 Generating Release Notes...");
        console.log("Jira keys:", jiraInput);

        await generateReleaseNotesFromKeys(jiraInput!);
      } catch (err: any) {
        console.error("❌ Failed to generate Release Notes");
        console.error(err.message);
        process.exit(1);
      }

      console.log("✅ Release Notes document created successfully");
    });

  /* ============================================================
     RELEASE NOTES GENERATOR : FROM JIRA VERSION
    ============================================================ */
  program
    .command("generate:release-notes-from-version")
    .description("Generate Release Notes from Jira version")
    .requiredOption("--version <name>", "Version name")
    .action(async (opts: { version: string }) => {
      let version = opts.version.trim();

      /* =========================
     ✅ NORMALISE INPUT
  ========================= */
      if (!version.startsWith("v")) {
        version = `v${version}`;
      }

      /* =========================
     ✅ VALIDATE NORMALISED VERSION
     ========================= */
      const versionPattern = /^v\d+\.\d+(\.\d+)?$/;

      if (!versionPattern.test(version)) {
        console.error(`❌ Invalid version format: ${opts.version}`);
        console.error("👉 Expected format: v26.10.0 or 26.10.0");
        process.exit(1);
      }

      /* ✅ Use normalised version */
      await generateReleaseNotesFromVersion(version);

      console.log(`✅ Release notes generated for version: ${version}`);
    });
}
