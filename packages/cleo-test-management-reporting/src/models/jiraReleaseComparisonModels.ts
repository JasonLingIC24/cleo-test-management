export interface JiraReleaseComparison {
  releaseVersion: string;
  jiraVersionIssues: string[];
  referencedInGit: string[];
  missingFromGit: string[];
  invalidReferences: string[];
}
