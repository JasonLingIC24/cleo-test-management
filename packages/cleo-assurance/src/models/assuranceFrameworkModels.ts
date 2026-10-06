import type { AssuranceRequirement } from "./assuranceRequirementModels.js";

import type { AssuranceMetrics } from "./assuranceMetricsModels.js";

export interface AssuranceSubsection {
  id: string;

  title: string;

  metrics: AssuranceMetrics;

  requirements: AssuranceRequirement[];
}

export interface AssuranceSection {
  id: string;

  title: string;

  metrics: AssuranceMetrics;

  subsections: AssuranceSubsection[];
}

export interface AssuranceFramework {
  id: string;

  title: string;

  version: string;

  metrics: AssuranceMetrics;

  sections: AssuranceSection[];
}
