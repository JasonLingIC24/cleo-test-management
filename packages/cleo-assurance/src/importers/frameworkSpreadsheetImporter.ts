import { importScalSpreadsheet } from "./requirementsSpreadsheetImporter.js";
import { createFramework } from "../services/frameworkFactoryService.js";
import type { AssuranceFramework } from "../models/assuranceFrameworkModels.js";

export async function importFrameworkSpreadsheet(
  filePath: string,
): Promise<AssuranceFramework> {
  const document = await importScalSpreadsheet(filePath);

  return createFramework("rcs", "RCS", document.requirements);
}
