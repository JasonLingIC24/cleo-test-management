import type { AssuranceFramework } from "../models/assuranceFrameworkModels.js";

import { importOnlineScal } from "./onlineScalImporter.js";

import { createFramework } from "../services/frameworkFactoryService.js";

export async function importFrameworkOnlineScal(
  filePath: string,
): Promise<AssuranceFramework> {
  const document = await importOnlineScal(filePath, {
    framework: "PDS",
  });

  return createFramework("pds-fhir-api", "PDS FHIR API", document.requirements);
}
