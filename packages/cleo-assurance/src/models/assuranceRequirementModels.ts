import type { AssuranceRequirementStatus } from "./assuranceRequirementStatusModels.js";

export interface AssuranceRequirement {
  trudDocument: string;

  id: string;

  area: string;

  title: string;

  description: string;

  applicability?: string;

  requirementType?: string;

  guidance?: string;

  framework: string;

  source: string;

  status: AssuranceRequirementStatus;
}
