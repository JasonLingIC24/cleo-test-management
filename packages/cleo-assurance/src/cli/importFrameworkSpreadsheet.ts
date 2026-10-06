import { writeFileSync } from "node:fs";

import { importFrameworkSpreadsheet } from "../importers/frameworkSpreadsheetImporter.js";

const inputFile = process.argv[2];

if (!inputFile) {
  throw new Error(
    "Spreadsheet path required. Example:\n" +
      "node dist/cli/importFrameworkSpreadsheet.js ./itk-compliance-rcs-original.xlsx",
  );
}

const framework = await importFrameworkSpreadsheet(inputFile);

writeFileSync(
  "./reports/assurance/framework.json",
  JSON.stringify(framework, null, 2),
);

console.log(`Generated framework with ${framework.sections.length} sections`);
