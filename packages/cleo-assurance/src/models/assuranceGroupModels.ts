import type { AssuranceRequirement } from "./assuranceRequirementModels.js";

export type AssuranceGroupStatus =
  "not-started" | "in-progress" | "review" | "complete";

export interface AssuranceGroup {
  id: string;

  title: string;

  framework: string;

  status: AssuranceGroupStatus;

  requirementCount: number;

  mustCount: number;

  shouldCount: number;

  mayCount: number;

  requirements: AssuranceRequirement[];
}
