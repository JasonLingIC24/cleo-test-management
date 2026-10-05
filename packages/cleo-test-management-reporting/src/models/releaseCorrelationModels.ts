export interface CommitReference {
  hash: string;
  subject: string;
  jiraKeys: string[];
}

export interface JiraCommitMapping {
  jiraKey: string;
  commits: CommitReference[];
}

export interface ReleaseCommitCorrelation {
  previousTag: string;
  currentTag: string;

  commits: CommitReference[];

  jiraMappings: JiraCommitMapping[];
}
