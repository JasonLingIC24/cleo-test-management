import type { AssuranceDocumentGroup } from "../legacy/models/assuranceDocumentGroupModels.js";

import type { AssuranceGroup } from "../legacy/models/assuranceGroupModels.js";

export function generateDocumentGroups(
  groups: AssuranceGroup[],
): AssuranceDocumentGroup[] {
  const groupedDocuments = new Map<string, AssuranceGroup[]>();

  for (const group of groups) {
    const firstRequirement = group.requirements[0];

    const trudDocument = firstRequirement?.trudDocument ?? "Unknown";

    const documentGroups = groupedDocuments.get(trudDocument) ?? [];

    documentGroups.push(group);

    groupedDocuments.set(trudDocument, documentGroups);
  }

  return Array.from(groupedDocuments.entries()).map(
    ([title, groupedAreas]) => ({
      id: title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"),

      title,

      framework: groupedAreas[0]?.framework ?? "unknown",

      requirementCount: groupedAreas.reduce(
        (count, group) => count + group.requirementCount,
        0,
      ),

      groups: groupedAreas,
    }),
  );
}
