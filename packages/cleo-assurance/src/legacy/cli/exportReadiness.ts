import { readFileSync } from "node:fs";

import type { AssuranceRequirementsDocument } from "../models/assuranceRequirementsDocumentModels.js";

import { calculateReadiness } from "../services/assuranceReadinessService.js";

const document = JSON.parse(
  readFileSync("./requirements.json", "utf8"),
) as AssuranceRequirementsDocument;

const readiness = calculateReadiness(document.requirements);

console.log(JSON.stringify(readiness, null, 2));
