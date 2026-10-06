import type { AssuranceGroup } from "./assuranceGroupModels.js";

export interface AssuranceDocumentGroup {
  id: string;

  title: string;

  framework: string;

  requirementCount: number;

  groups: AssuranceGroup[];
}
