import type { AssuranceFramework } from "../models/assuranceFrameworkModels.js";

export function buildHierarchy(
  framework: AssuranceFramework,
): AssuranceFramework {
  const requirementMap = new Map<string, string[]>();

  for (const section of framework.sections) {
    for (const subsection of section.subsections) {
      for (const requirement of subsection.requirements) {
        if (requirement.parentRequirementId) {
          const children =
            requirementMap.get(requirement.parentRequirementId) ?? [];

          children.push(requirement.id);

          requirementMap.set(requirement.parentRequirementId, children);
        }
      }
    }
  }

  for (const section of framework.sections) {
    for (const subsection of section.subsections) {
      for (const requirement of subsection.requirements) {
        requirement.childRequirementIds =
          requirementMap.get(requirement.id) ?? [];
      }
    }
  }

  return framework;
}
