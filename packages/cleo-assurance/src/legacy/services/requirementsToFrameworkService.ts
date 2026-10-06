import type { AssuranceDocumentGroup } from "../legacy/models/assuranceDocumentGroupModels.js";

import type {
  AssuranceFramework,
  AssuranceSection,
  AssuranceSubsection,
} from "../models/assuranceFrameworkModels.js";

export function assembleFramework(
  frameworkId: string,
  frameworkTitle: string,
  documentGroups: AssuranceDocumentGroup[],
): AssuranceFramework {
  const sections: AssuranceSection[] = documentGroups.map((documentGroup) => {
    const subsections: AssuranceSubsection[] = documentGroup.groups.map(
      (group) => ({
        id: group.id,

        title: group.title,

        requirementCount: group.requirementCount,

        requirements: group.requirements,
      }),
    );

    return {
      id: documentGroup.id,

      title: documentGroup.title,

      requirementCount: documentGroup.requirementCount,

      subsections,
    };
  });

  return {
    id: frameworkId,

    title: frameworkTitle,

    version: "2.0",

    requirementCount: documentGroups.reduce(
      (count, documentGroup) => count + documentGroup.requirementCount,
      0,
    ),

    sections,
  };
}
