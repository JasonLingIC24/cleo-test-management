import { searchIssuesByVersion } from "./jiraClient.js";
import { getConfig } from "./configService.js";
import type { JiraReleaseComparison } from "../models/jiraReleaseComparisonModels.js";
import type { JiraReleaseAnalysis } from "../models/jiraReleaseAnalysisModels.js";

export async function compareReleaseAgainstGit(
  version: string,
  analysis: JiraReleaseAnalysis,
): Promise<JiraReleaseComparison> {
  const jiraConfig = getConfig().jira;

  const versionKeys = await searchIssuesByVersion(version, jiraConfig);

  const referencedInGit = analysis.validIssues.map((i) => i.key);

  const missingFromGit = versionKeys.filter(
    (key) => !referencedInGit.includes(key),
  );

  const invalidReferences = analysis.invalidReferences.map((i) => i.jiraKey);

  return {
    releaseVersion: version,
    jiraVersionIssues: versionKeys,
    referencedInGit,
    missingFromGit,
    invalidReferences,
  };
}
