export function normalizeIssueType(type?: string): string {
  if (!type) {
    return "";
  }

  const t = type.toLowerCase();

  if (t.includes("story")) {
    return "story";
  }

  if (t.includes("bug") || t.includes("defect")) {
    return "bug";
  }

  if (t.includes("task")) {
    return "task";
  }

  return t;
}

export function filterIssuesByType(issues: any[], typeFilter?: string) {
  if (!typeFilter) {
    return issues;
  }

  const types = typeFilter.split(",").map((t) => t.trim().toLowerCase());

  const filtered = issues.filter((issue) =>
    types.includes(normalizeIssueType(issue.type)),
  );

  console.log(`🔍 Filtering by type: ${types.join(", ")}`);

  return filtered;
}
