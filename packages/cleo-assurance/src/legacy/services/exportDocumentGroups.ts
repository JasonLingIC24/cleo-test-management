import { readFileSync, writeFileSync } from "node:fs";

import type { AssuranceGroup } from "../models/assuranceGroupModels.js";

import { generateDocumentGroups } from "./assuranceDocumentGroupGeneratorService.js";

const groups = JSON.parse(
  readFileSync("./groups.json", "utf8"),
) as AssuranceGroup[];

const documentGroups = generateDocumentGroups(groups);

writeFileSync(
  "./document-groups.json",
  JSON.stringify(documentGroups, null, 2),
);

console.log(`Generated ${documentGroups.length} document groups`);
