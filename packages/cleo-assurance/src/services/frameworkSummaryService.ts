import type { AssuranceFramework } from "../models/assuranceFrameworkModels.js";

import type { AssuranceFrameworkSummary } from "../models/assuranceFrameworkSummaryModels.js";

export function buildFrameworkSummary(
  framework: AssuranceFramework,
): AssuranceFrameworkSummary {
  const requirementCount = framework.sections.reduce(
    (count, section) => count + section.requirements.length,
    0,
  );

  return {
    frameworkId: framework.id,
    frameworkTitle: framework.title,
    sectionCount: framework.sections.length,
    requirementCount,
  };
}
