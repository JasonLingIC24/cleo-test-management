import { getIssue } from "./jiraClient.js";
import { getConfig } from "./configService.js";
import { extractJiraText } from "./jiraAdfParserService.js";
import type { ReleaseCommitCorrelation } from "../models/releaseCorrelationModels.js";

import type {
  JiraReleaseAnalysis,
  EnrichedJiraIssue,
  InvalidJiraReference,
} from "../models/jiraReleaseAnalysisModels.js";

export async function enrichReleaseIssues(
  correlation: ReleaseCommitCorrelation,
): Promise<JiraReleaseAnalysis> {
  const jiraConfig = getConfig().jira;

  const validIssues: EnrichedJiraIssue[] = [];
  const invalidReferences: InvalidJiraReference[] = [];

  for (const mapping of correlation.jiraMappings) {
    try {
      const issue = await getIssue(mapping.jiraKey, jiraConfig);

      validIssues.push({
        key: mapping.jiraKey,
        title: issue.title,
        description: issue.description,
        descriptionText: extractJiraText(issue.description),
        type: issue.type,
        components: issue.components ?? [],
        parent: issue.parent,
        commits: mapping.commits,
      });
    } catch (err) {
      invalidReferences.push({
        jiraKey: mapping.jiraKey,
        reason: "Issue not found in Jira",
        commits: mapping.commits,
      });
    }
  }

  return {
    previousTag: correlation.previousTag,
    currentTag: correlation.currentTag,
    validIssues,
    invalidReferences,
  };
}
