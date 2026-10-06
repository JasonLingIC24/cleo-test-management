import type { AssuranceRequirement } from "../models/assuranceRequirementModels.js";

import type { AssuranceGroup } from "../legacy/models/assuranceGroupModels.js";

export function generateAssuranceGroups(
  requirements: AssuranceRequirement[],
): AssuranceGroup[] {
  const groups = new Map<string, AssuranceRequirement[]>();

  for (const requirement of requirements) {
    const groupRequirements = groups.get(requirement.area) ?? [];

    groupRequirements.push(requirement);

    groups.set(requirement.area, groupRequirements);
  }

  return Array.from(groups.entries()).map(([title, groupedRequirements]) => ({
    id: title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"),

    title,

    framework: groupedRequirements[0]?.framework ?? "unknown",

    status: "not-started",

    requirementCount: groupedRequirements.length,

    mustCount: groupedRequirements.filter(
      (requirement) => requirement.requirementType === "Must",
    ).length,

    shouldCount: groupedRequirements.filter(
      (requirement) => requirement.requirementType === "Should",
    ).length,

    mayCount: groupedRequirements.filter(
      (requirement) => requirement.requirementType === "May",
    ).length,

    requirements: groupedRequirements,
  }));
}
