import { readFileSync, writeFileSync } from "node:fs";

import type { AssuranceDocumentGroup } from "../models/assuranceDocumentGroupModels.js";

import { generateAssuranceSubTasks } from "../services/assuranceSubTaskGeneratorService.js";

const documentGroups = JSON.parse(
  readFileSync("./document-groups.json", "utf8"),
) as AssuranceDocumentGroup[];

const subTasks = generateAssuranceSubTasks(documentGroups);

writeFileSync("./assurance-subtasks.json", JSON.stringify(subTasks, null, 2));

console.log(`Generated ${subTasks.length} assurance subtasks`);
