import path from "path";
import fs from "fs";
import { buildBaseName } from "../utils/fileNaming.js";
import { getConfig } from "./configService.js";
import { configAccess } from "./configAccessService.js";
import { generateTestSummaryReport } from "./reportService.js";
import type { TestSummaryContext } from "../models/testSummaryContext.js";

export async function createTestSummaryReport(
  reportContext: TestSummaryContext,
): Promise<string> {
  const cfg = getConfig();

  const baseName = buildBaseName(cfg);

  const docsDir = configAccess.getDocsReleaseDir();

  fs.mkdirSync(docsDir, { recursive: true });

  const outputPath = path.join(docsDir, `${baseName}-test-summary-report.docx`);

  const templatePath = configAccess.getTemplate("summaryReport");

  await generateTestSummaryReport(
    {
      ...reportContext.results,

      bugMetrics: reportContext.bugMetrics,

      bugSummary: reportContext.bugSummary,

      releaseMetrics: reportContext.releaseMetrics,

      sprintInfo: reportContext.sprintInfo,
    },
    templatePath,
    outputPath,
  );

  return outputPath;
}
