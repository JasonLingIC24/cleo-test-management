import { writeFileSync } from "node:fs";

import { importOnlineScal } from "../importers/onlineScalImporter.js";

const document = await importOnlineScal("./pds-scal.txt", {
  framework: "PDS",
});

writeFileSync("./pds-requirements.json", JSON.stringify(document, null, 2));

console.log(`Imported ${document.requirements.length} requirements`);
