import { importEvidence } from "../importers/evidenceImporter.js";

const evidence = await importEvidence("./evidence");

console.log(JSON.stringify(evidence, null, 2));
