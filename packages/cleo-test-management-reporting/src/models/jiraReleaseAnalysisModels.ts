import type { CommitReference } from "./releaseCorrelationModels.js";

export interface EnrichedJiraIssue {
  key: string;
  title: string;
  description?: any;
  descriptionText: string;
  type: string;
  components: string[];
  parent?: {
    key: string;
    title: string;
  };
  commits: CommitReference[];
}

export interface InvalidJiraReference {
  jiraKey: string;
  reason: string;
  commits: CommitReference[];
}

export interface JiraReleaseAnalysis {
  previousTag: string;
  currentTag: string;
  validIssues: EnrichedJiraIssue[];
  invalidReferences: InvalidJiraReference[];
}
