import { readFileSync, writeFileSync } from "node:fs";

import type { AssuranceSubTask } from "../models/assuranceSubTaskModels.js";

import { generateJiraSubTasks } from "../services/jiraSubTaskGeneratorService.js";

const subTasks = JSON.parse(
  readFileSync("./assurance-subtasks.json", "utf8"),
) as AssuranceSubTask[];

const jiraSubTasks = generateJiraSubTasks(subTasks, "EVA-2583");

writeFileSync("./jira-subtasks.json", JSON.stringify(jiraSubTasks, null, 2));

console.log(`Generated ${jiraSubTasks.length} Jira sub-tasks`);
