import fs from "fs";
import { configAccess } from "./configAccessService.js";
import { buildReleaseBundle } from "./releaseBundleService.js";
import { publishReleaseToJira } from "./releasePublishingService.js";
import { generateBugMetricFiles } from "./bugMetricsService.js";
import { createTestSummaryReport } from "./testSummaryReportService.js";
import { buildTestSummaryContext } from "./reportContextService.js";
import {
  generateReleaseNotesFromVersion,
  generateReleaseNotesFromKeys,
} from "../renderers/releaseNotes/releaseNotesService.js";
import type { RuntimeContext } from "../models/runtimeContext.js";

import type { PublishOptions } from "../models/publishOptions.js";

export async function runPhase3Workflow(
  runtimeContext: RuntimeContext,
  publishOptions: PublishOptions,
) {
  let version = runtimeContext.version;

  if (!version.startsWith("v")) {
    version = `v${version}`;
  }

  const docsDir = configAccess.getDocsReleaseDir();

  cleanDirectory(docsDir);
  fs.mkdirSync(docsDir, { recursive: true });

  /* =========================
     RELEASE NOTES
  ========================= */

  if (runtimeContext.releaseKeys?.length) {
    await generateReleaseNotesFromKeys(runtimeContext.releaseKeys.join(","));
  } else {
    console.log("📄 Generating Release Notes (version)...");

    await generateReleaseNotesFromVersion(version);
  }

  /* =========================
     TEST SUMMARY
  ========================= */

  console.log("📄 Generating Test Summary Report...");

  const reportContext = await buildTestSummaryContext();

  const outputPath = await createTestSummaryReport(reportContext);

  console.log(`✅ Summary created: ${outputPath}`);

  await generateBugMetricFiles(reportContext);

  /* =========================
     OPTIONAL PUBLISH
  ========================= */

  if (publishOptions.publish) {
    if (!publishOptions.jiraKey) {
      console.log("⚠️ Cannot publish (missing --jira)");
      return;
    }

    console.log(`📤 Publishing to Jira: ${publishOptions.jiraKey}`);

    await publishReleaseToJira({
      jiraKey: publishOptions.jiraKey,
      attachSummary: publishOptions.attachSummary,
      attachReleaseNotes: publishOptions.attachReleaseNotes,
      version,
    });
  }

  /* =========================
     BUNDLE
  ========================= */

  await buildReleaseBundle();
}

function cleanDirectory(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, {
      recursive: true,
      force: true,
    });
  }
}
