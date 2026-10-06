import type { AssuranceRequirementStatus } from "./assuranceRequirementStatusModels.js";

export interface AssuranceRequirement {
  trudDocument: string;

  id: string;

  parentRequirementId?: string;

  childRequirementIds?: string[];

  area: string;

  title: string;

  description: string;

  applicability?: string;

  requirementType?: string;

  guidance?: string;

  status: AssuranceRequirementStatus;

  evidenceIds: string[];

  framework: string;

  source: string;
}
