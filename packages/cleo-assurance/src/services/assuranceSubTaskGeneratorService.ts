import type { AssuranceFramework } from "../models/assuranceFrameworkModels.js";
import type { AssuranceRequirement } from "../models/assuranceRequirementModels.js";
import type { AssuranceSubTask } from "../models/assuranceSubTaskModels.js";

export function generateAssuranceSubTasks(
  framework: AssuranceFramework,
): AssuranceSubTask[] {
  return framework.sections.map((section) => {
    const areaSummary = section.subsections
      .map((subsection) => {
        const requirementList = buildRequirementHierarchy(
          subsection.requirements,
        );

        return `${subsection.title}

Requirements

${requirementList}`;
      })
      .join("\n\n");

    const areaCriteria = section.subsections
      .map(
        (subsection) =>
          `- Review area '${subsection.title}' (${
            subsection.metrics?.requirementCount ??
            subsection.requirements.length
          } requirements)`,
      )
      .join("\n");

    const metrics = section.metrics ?? {
      requirementCount: section.subsections.reduce(
        (count, subsection) => count + subsection.requirements.length,
        0,
      ),
      mustCount: 0,
      shouldCount: 0,
      mayCount: 0,
      completeCount: 0,
      blockedCount: 0,
      readinessPercent: 0,
    };

    const acceptanceCriteria = [
      `Review all ${metrics.requirementCount} requirements`,
      `Assess all ${metrics.mustCount} MUST requirements`,
    ];

    if (metrics.shouldCount > 0) {
      acceptanceCriteria.push(
        `Assess all ${metrics.shouldCount} SHOULD requirements`,
      );
    }

    if (metrics.mayCount > 0) {
      acceptanceCriteria.push(
        `Review all ${metrics.mayCount} MAY requirements`,
      );
    }

    acceptanceCriteria.push(
      "Determine compliance status for each requirement",
      "Identify evidence required for compliance",
      "Complete supplier statements where required",
      "Document implementation gaps and risks",
      "Update assurance readiness status",
      "Ready for assurance review",
    );

    const acceptanceCriteriaText = acceptanceCriteria
      .map((criteria) => `- ${criteria}`)
      .join("\n");

    return {
      summary: `${framework.title} - ${section.title}`,

      description: `Section

${section.title}

Summary

Requirements: ${metrics.requirementCount}
Must Requirements: ${metrics.mustCount}
Should Requirements: ${metrics.shouldCount}
May Requirements: ${metrics.mayCount}

Areas To Review

${areaCriteria}

Requirement Breakdown

${areaSummary}

Acceptance Criteria

${acceptanceCriteriaText}`,

      labels: ["assurance"],

      requirementCount: metrics.requirementCount,

      areaCount: section.subsections.length,

      mustCount: metrics.mustCount,

      shouldCount: metrics.shouldCount,

      mayCount: metrics.mayCount,
    };
  });
}

function buildRequirementHierarchy(
  requirements: AssuranceRequirement[],
): string {
  const requirementMap = new Map(
    requirements.map((requirement) => [requirement.id, requirement]),
  );

  const rootRequirements = requirements.filter(
    (requirement) => !requirement.parentRequirementId,
  );

  function renderRequirement(
    requirement: AssuranceRequirement,
    depth = 0,
  ): string {
    const indent = "  ".repeat(depth);

    let output = `${indent}- ${requirement.id}`;

    if (requirement.title) {
      output += ` - ${requirement.title}`;
    }

    const children =
      requirement.childRequirementIds
        ?.map((childId) => requirementMap.get(childId))
        .filter((child): child is AssuranceRequirement => Boolean(child)) ?? [];

    for (const child of children) {
      output += `\n${renderRequirement(child, depth + 1)}`;
    }

    return output;
  }

  return rootRequirements
    .map((requirement) => renderRequirement(requirement))
    .join("\n");
}
