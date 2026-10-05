export interface JiraSubTask {
  summary: string;

  description: string;

  issueType: "Sub-task";

  labels: string[];

  parentIssue: string;
}
