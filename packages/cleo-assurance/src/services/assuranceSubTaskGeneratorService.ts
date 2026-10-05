import type { AssuranceDocumentGroup } from "../models/assuranceDocumentGroupModels.js";

import type { AssuranceSubTask } from "../models/assuranceSubTaskModels.js";

export function generateAssuranceSubTasks(
  documentGroups: AssuranceDocumentGroup[],
): AssuranceSubTask[] {
  return documentGroups.map((documentGroup) => {
    const mustCount = documentGroup.groups.reduce(
      (count, group) => count + group.mustCount,
      0,
    );

    const shouldCount = documentGroup.groups.reduce(
      (count, group) => count + group.shouldCount,
      0,
    );

    const mayCount = documentGroup.groups.reduce(
      (count, group) => count + group.mayCount,
      0,
    );

    const areaSummary = documentGroup.groups
      .map((group) => {
        const requirementList = group.requirements
          .map((requirement) => `  - ${requirement.id} - ${requirement.title}`)
          .join("\n");

        return `${group.title}

Requirements

${requirementList}`;
      })
      .join("\n\n");

    const areaCriteria = documentGroup.groups
      .map(
        (group) =>
          `- Review area '${group.title}' (${group.requirementCount} requirements)`,
      )
      .join("\n");

    const acceptanceCriteria = [
      `Review all ${documentGroup.requirementCount} requirements`,
      `Assess all ${mustCount} MUST requirements`,
    ];

    if (shouldCount > 0) {
      acceptanceCriteria.push(`Assess all ${shouldCount} SHOULD requirements`);
    }

    if (mayCount > 0) {
      acceptanceCriteria.push(`Review all ${mayCount} MAY requirements`);
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
      summary: `PDS SCAL - ${documentGroup.title}`,

      description: `TRUD Document

${documentGroup.title}

Summary

Requirements: ${documentGroup.requirementCount}
Areas: ${documentGroup.groups.length}
Must Requirements: ${mustCount}
Should Requirements: ${shouldCount}
May Requirements: ${mayCount}

Areas To Review

${areaCriteria}

Requirement Breakdown

${areaSummary}

Acceptance Criteria

${acceptanceCriteriaText}`,

      labels: ["assurance", "pds", "scal"],

      requirementCount: documentGroup.requirementCount,

      areaCount: documentGroup.groups.length,

      mustCount,

      shouldCount,

      mayCount,
    };
  });
}
