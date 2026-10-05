import type { AssuranceRequirement } from "./assuranceRequirementModels.js";

export interface AssuranceRequirementsDocument {
  framework: string;

  version: string;

  requirements: AssuranceRequirement[];
}
