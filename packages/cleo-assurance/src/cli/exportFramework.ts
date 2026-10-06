import { writeFileSync } from "node:fs";

import { importFrameworkSpreadsheet } from "../importers/frameworkSpreadsheetImporter.js";

const framework = await importFrameworkSpreadsheet(
  "./requirements/rcs/itk-compliance-rcs-original.xlsx",
);

writeFileSync(
  "./reports/assurance/framework.json",
  JSON.stringify(framework, null, 2),
);

console.log(`Generated framework with ${framework.sections.length} sections`);
