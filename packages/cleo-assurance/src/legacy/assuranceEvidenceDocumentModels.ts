import type { AssuranceEvidenceImport } from "./assuranceEvidenceImportModels.js";

export interface AssuranceEvidenceDocument {
  framework: string;

  evidence: AssuranceEvidenceImport[];
}
