import { readFileSync, writeFileSync } from "node:fs";

import type { AssuranceRequirementsDocument } from "../models/assuranceRequirementsDocumentModels.js";

import { createFramework } from "../services/frameworkFactoryService.js";

const document = JSON.parse(
  readFileSync("./reports/assurance/pds-requirements.json", "utf8"),
) as AssuranceRequirementsDocument;

const framework = createFramework("pds-fhir-api", "PDS FHIR API", []);

writeFileSync(
  "./reports/assurance/pds-framework.json",
  JSON.stringify(framework, null, 2),
);
