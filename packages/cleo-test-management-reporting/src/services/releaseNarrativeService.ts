import type {
  JiraReleaseAnalysis,
  EnrichedJiraIssue,
} from "../models/jiraReleaseAnalysisModels.js";

import type { ReleaseNarrative } from "../models/releaseNarrativeModels.js";

export function buildReleaseNarratives(
  analysis: JiraReleaseAnalysis,
): ReleaseNarrative[] {
  return analysis.validIssues.map((issue: EnrichedJiraIssue) => ({
    jiraKey: issue.key,

    title: issue.title,

    narrative: issue.descriptionText ?? issue.title,

    commitCount: issue.commits.length,

    commitSubjects: issue.commits.map((c) => c.subject),

    type: issue.type,

    parentKey: issue.parent?.key,

    parentTitle: issue.parent?.title,

    components: issue.components,
  }));
}
