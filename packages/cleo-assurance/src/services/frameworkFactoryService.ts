import type {
  AssuranceFramework,
  AssuranceSection,
  AssuranceSubsection,
} from "../models/assuranceFrameworkModels.js";
import { buildHierarchy } from "./frameworkHierarchyService.js";
import type { AssuranceRequirement } from "../models/assuranceRequirementModels.js";
import type { AssuranceMetrics } from "../models/assuranceMetricsModels.js";

function createMetrics(requirements: AssuranceRequirement[]): AssuranceMetrics {
  const requirementCount = requirements.length;

  const mustCount = requirements.filter(
    (requirement) => requirement.requirementType === "Must",
  ).length;

  const shouldCount = requirements.filter(
    (requirement) => requirement.requirementType === "Should",
  ).length;

  const mayCount = requirements.filter(
    (requirement) => requirement.requirementType === "May",
  ).length;

  const completeCount = requirements.filter(
    (requirement) => requirement.status === "complete",
  ).length;

  const blockedCount = requirements.filter(
    (requirement) => requirement.status === "blocked",
  ).length;

  const readinessPercent =
    requirementCount === 0
      ? 0
      : Math.round((completeCount / requirementCount) * 100);

  return {
    requirementCount,

    mustCount,

    shouldCount,

    mayCount,

    completeCount,

    blockedCount,

    readinessPercent,
  };
}

export function createFramework(
  frameworkId: string,
  frameworkTitle: string,
  requirements: AssuranceRequirement[],
): AssuranceFramework {
  const sectionMap = new Map<string, AssuranceRequirement[]>();

  for (const requirement of requirements) {
    const group = sectionMap.get(requirement.trudDocument) ?? [];

    group.push(requirement);

    sectionMap.set(requirement.trudDocument, group);
  }

  const sections: AssuranceSection[] = Array.from(sectionMap.entries()).map(
    ([sectionTitle, sectionRequirements]) => {
      const subsectionMap = new Map<string, AssuranceRequirement[]>();

      for (const requirement of sectionRequirements) {
        const subsectionRequirements =
          subsectionMap.get(requirement.area) ?? [];

        subsectionRequirements.push(requirement);

        subsectionMap.set(requirement.area, subsectionRequirements);
      }

      const subsections: AssuranceSubsection[] = Array.from(
        subsectionMap.entries(),
      ).map(([subsectionTitle, subsectionRequirements]) => ({
        id: subsectionTitle.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"),

        title: subsectionTitle,

        metrics: createMetrics(subsectionRequirements),

        requirements: subsectionRequirements,
      }));

      return {
        id: sectionTitle.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"),

        title: sectionTitle,

        metrics: createMetrics(sectionRequirements),

        subsections,
      };
    },
  );

  const framework: AssuranceFramework = {
    id: frameworkId,

    title: frameworkTitle,

    version: "2.0",

    metrics: createMetrics(requirements),

    sections,
  };

  return buildHierarchy(framework);
}
