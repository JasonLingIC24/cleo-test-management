import { Command } from "commander";
import { publishReleaseToJira } from "../services/releasePublishingService.js";

export function registerPublishCommands(program: Command) {
  /* ============================================================
   PUBLISH JIRA COMMAND - Attach reports to Jira issue
============================================================ */
  program
    .command("publish:jira")
    .requiredOption("--jira <key>", "Jira issue key")
    .option("--attach-summary", "Attach test summary report")
    .option("--attach-release-notes", "Attach release notes")
    .option("--version <name>", "Version (for auto-generating release notes)")
    .action(async (opts) => {
      try {
        await publishReleaseToJira({
          jiraKey: opts.jira,
          attachSummary: opts.attachSummary,
          attachReleaseNotes: opts.attachReleaseNotes,
          version: opts.version,
        });
      } catch (err: any) {
        console.error("❌ Jira publish failed");
        console.error(err.message);
        process.exit(1);
      }
    });
}
