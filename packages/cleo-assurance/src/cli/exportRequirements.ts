import { writeFileSync } from "node:fs";

import { importScalSpreadsheet } from "../importers/requirementsSpreadsheetImporter.js";

const document = await importScalSpreadsheet(
  "./requirements/rcs/itk-compliance-rcs-original.xlsx",
);

writeFileSync("./requirements.json", JSON.stringify(document, null, 2));

console.log(`Exported ${document.requirements.length} requirements`);
