import type { AssuranceEvidenceDocument } from "./assuranceEvidenceDocumentModels.js";

export async function importEvidence(
  evidenceDirectory: string,
): Promise<AssuranceEvidenceDocument> {
  console.log(`Importing evidence from ${evidenceDirectory}`);

  return {
    framework: "unknown",

    evidence: [],
  };
}
