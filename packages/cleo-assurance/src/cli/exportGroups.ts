import { readFileSync, writeFileSync } from "node:fs";

import type { AssuranceRequirementsDocument } from "../models/assuranceRequirementsDocumentModels.js";

import { generateAssuranceGroups } from "../services/assuranceGroupGeneratorService.js";

const document = JSON.parse(
  readFileSync("./requirements.json", "utf8"),
) as AssuranceRequirementsDocument;

const groups = generateAssuranceGroups(document.requirements);

writeFileSync("./groups.json", JSON.stringify(groups, null, 2));

console.log(`Generated ${groups.length} groups`);
