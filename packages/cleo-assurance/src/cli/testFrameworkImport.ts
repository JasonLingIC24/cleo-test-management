import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { loadFramework } from "../services/frameworkLoaderService.js";

import { buildFrameworkSummary } from "../services/frameworkSummaryService.js";

const currentFile = fileURLToPath(import.meta.url);

const currentDirectory = dirname(currentFile);

const frameworkPath = resolve(
  currentDirectory,
  "../../src/frameworks/pds-fhir-api/framework.json",
);

const framework = loadFramework(frameworkPath);

const summary = buildFrameworkSummary(framework);

console.log(JSON.stringify(summary, null, 2));
