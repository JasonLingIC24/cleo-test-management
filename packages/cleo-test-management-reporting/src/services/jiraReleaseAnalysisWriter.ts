import fs from "fs";
import path from "path";

import { configAccess } from "./configAccessService.js";

import type { JiraReleaseAnalysis } from "../models/jiraReleaseAnalysisModels.js";

export function saveJiraReleaseAnalysis(analysis: JiraReleaseAnalysis) {
  const outputDir = path.join(configAccess.getJsonReports(), "release");

  fs.mkdirSync(outputDir, {
    recursive: true,
  });

  const outputPath = path.join(outputDir, "jira-release-analysis.json");

  fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));

  return outputPath;
}
