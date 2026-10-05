import type { AssuranceRequirement } from "./assuranceRequirementModels.js";

export interface AssuranceSection {
  id: string;

  title: string;

  requirements: AssuranceRequirement[];
}
