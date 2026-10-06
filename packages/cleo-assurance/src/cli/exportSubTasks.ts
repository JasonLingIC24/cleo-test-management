import { readFileSync, writeFileSync } from "node:fs";

import type { AssuranceFramework } from "../models/assuranceFrameworkModels.js";

import { generateAssuranceSubTasks } from "../services/assuranceSubTaskGeneratorService.js";

const framework = JSON.parse(
  readFileSync("./reports/assurance/framework.json", "utf8"),
) as AssuranceFramework;

const subTasks = generateAssuranceSubTasks(framework);

writeFileSync(
  "./reports/assurance/assurance-subtasks.json",
  JSON.stringify(subTasks, null, 2),
);

console.log(`Generated ${subTasks.length} assurance subtasks`);
