import type { AssuranceRequirement } from "../models/assuranceRequirementModels.js";

import type { AssuranceReadiness } from "../models/assuranceReadinessModels.js";

export function calculateReadiness(
  requirements: AssuranceRequirement[],
): AssuranceReadiness {
  const totalRequirements = requirements.length;

  const completeRequirements = requirements.filter(
    (requirement) => requirement.status === "complete",
  ).length;

  const inProgressRequirements = requirements.filter(
    (requirement) => requirement.status === "in-progress",
  ).length;

  const blockedRequirements = requirements.filter(
    (requirement) => requirement.status === "blocked",
  ).length;

  const notStartedRequirements = requirements.filter(
    (requirement) => requirement.status === "not-started",
  ).length;

  const readinessPercent =
    totalRequirements === 0
      ? 0
      : Math.round((completeRequirements / totalRequirements) * 100);

  return {
    totalRequirements,

    completeRequirements,

    inProgressRequirements,

    blockedRequirements,

    notStartedRequirements,

    readinessPercent,
  };
}
