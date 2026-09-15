import fs from "fs";
import path from "path";
import { getConfig } from "./configService.js";
import { configAccess } from "./configAccessService.js";
import { buildDashboardADF } from "./jiraDashboardService.js";
import { updateJiraDescription, attachFileToJira } from "./jiraClient.js";
import { generateTestSummaryReport } from "./reportService.js";
import { generateReleaseNotesFromVersion } from "../renderers/releaseNotes/releaseNotesService.js";
import { buildFileName } from "../utils/fileNaming.js";

type PublishOptions = {
  jiraKey: string;
  attachSummary?: boolean;
  attachReleaseNotes?: boolean;
  version?: string; // ✅ optional fallback for generation
};

export async function publishReleaseToJira(options: PublishOptions) {
  const config = getConfig();
  const jiraConfig = config.jira;

  const docsDir = configAccess.getDocsReleaseDir();

  const releaseNotesPath = path.join(
    docsDir,
    buildFileName(config, "release-notes.docx"),
  );

  const summaryPath = path.join(
    docsDir,
    buildFileName(config, "test-summary.docx"),
  );

  /* =========================
     AUTO-GENERATE REPORTS
  ========================= */

  // ✅ Release Notes (only if needed)
  if (options.attachReleaseNotes && !fs.existsSync(releaseNotesPath)) {
    console.log("⚠️ Missing release notes — generating...");

    if (!options.version) {
      console.warn("⚠️ Cannot generate release notes (no version provided)");
    } else {
      await generateReleaseNotesFromVersion(options.version);
    }
  }

  // ✅ Summary Report (only if needed)
  if (options.attachSummary && !fs.existsSync(summaryPath)) {
    console.log("⚠️ Missing summary report — generating...");

    const resultsPath = configAccess.getCompleteResultsPath();

    if (!fs.existsSync(resultsPath)) {
      console.log("⚠️ No completeResults found — cannot generate summary");
    } else {
      const templatePath = configAccess.getTemplate("summaryReport");

      const results = JSON.parse(fs.readFileSync(resultsPath, "utf8"));

      await generateTestSummaryReport(results, templatePath, summaryPath);

      console.log(`✅ Summary generated: ${summaryPath}`);
    }
  }

  /* =========================
     BUILD DASHBOARD
  ========================= */
  const adf = buildDashboardADF();

  /* =========================
     PUSH TO JIRA
  ========================= */
  console.log(`📤 Updating Jira: ${options.jiraKey}`);

  await updateJiraDescription(options.jiraKey, adf, jiraConfig);

  /* ===== Attach release notes ===== */
  if (options.attachReleaseNotes && fs.existsSync(releaseNotesPath)) {
    await attachFileToJira(options.jiraKey, releaseNotesPath, jiraConfig);

    console.log("📎 Attached release notes");
  }

  /* ===== Attach summary ===== */
  if (options.attachSummary && fs.existsSync(summaryPath)) {
    await attachFileToJira(options.jiraKey, summaryPath, jiraConfig);

    console.log("📎 Attached summary report");
  }

  if (!options.attachSummary && !options.attachReleaseNotes) {
    console.log("ℹ️ Dashboard only (no attachments)");
  }

  console.log("✅ Jira fully updated");
}
``;
