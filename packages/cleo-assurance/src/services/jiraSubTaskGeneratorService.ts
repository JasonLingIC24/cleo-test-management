import type { AssuranceSubTask } from "../models/assuranceSubTaskModels.js";

import type { JiraSubTask } from "../models/jiraSubTaskModels.js";

export function generateJiraSubTasks(
  subTasks: AssuranceSubTask[],
  parentIssue: string,
): JiraSubTask[] {
  return subTasks.map((subTask) => ({
    summary: subTask.summary,

    description: subTask.description,

    issueType: "Sub-task",

    labels: subTask.labels,

    parentIssue,
  }));
}
