import type { ReleaseItem } from "../../types/jira.js";

const FRIENDLY_COMPONENTS: Record<string, string> = {
  RBAC: "User Administration",
  PTL: "Patient Tracking Lists",
  "Case Management": "Case Management",
  Interop: "Integrations",
  API: "Integrations",
  Frontend: "User Interface",
  Backend: "Platform Improvements",
};

const TECHNICAL_COMPONENTS = [
  "Backend",
  "Frontend",
  ".NET",
  "NPM",
  "Infrastructure",
  "DevOps",
];

function getLabel(type: string): string {
  switch (type) {
    case "Feature":
      return "Added";
    case "Fix":
      return "Fixed";
    case "Improvement":
      return "Improved";
    default:
      return "";
  }
}

export function flattenGroups(groups: ComponentGroup[]) {
  return {
    features: groups.flatMap((g) => g.features),
    fixes: groups.flatMap((g) => g.fixes),
    improvements: groups.flatMap((g) => g.improvements),
  };
}

export function formatReleaseText(item: ReleaseItem): string {
  let title = item.summary.replace(/\[.*?\]/g, "").trim();

  title = title
    .replace(/^error while/i, "")
    .replace(/^user can not/i, "Cannot")
    .replace(/^fix/i, "")
    .replace(/^add/i, "")
    .replace(/^update/i, "")
    .trim();

  title = title.charAt(0).toUpperCase() + title.slice(1);

  const label = getLabel(item.type);

  const max = 100; // max length for title
  if (title.length > max) {
    title = title.substring(0, max) + "...";
  }

  return `${label} ${title}`;
}

export interface ComponentGroup {
  name: string;
  features: ReleaseItem[];
  fixes: ReleaseItem[];
  improvements: ReleaseItem[];
}

export function group(items: ReleaseItem[]): ComponentGroup[] {
  const components = new Map<string, ComponentGroup>();

  for (const item of items) {
    const rawComponent = item.component ?? "General";

    const component = TECHNICAL_COMPONENTS.includes(rawComponent)
      ? "Technical Improvements"
      : FRIENDLY_COMPONENTS[rawComponent] || rawComponent;

    if (!components.has(component)) {
      components.set(component, {
        name: component,
        features: [],
        fixes: [],
        improvements: [],
      });
    }

    const group = components.get(component)!;

    switch (item.type) {
      case "Feature":
        group.features.push(item);
        break;

      case "Fix":
        group.fixes.push(item);
        break;

      default:
        group.improvements.push(item);
        break;
    }
  }

  return [...components.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function buildHighlights(grouped: {
  features: ReleaseItem[];
  improvements: ReleaseItem[];
  fixes: ReleaseItem[];
}) {
  const all = [...grouped.features, ...grouped.improvements, ...grouped.fixes];

  // ✅ prioritise important keywords
  const priority = all.filter((i) =>
    /role|permission|interop|integration|performance|security/i.test(i.summary),
  );

  const fallback = all;

  const selected = (priority.length ? priority : fallback).slice(0, 3);

  if (!selected.length) {
    return "General system improvements and maintenance updates";
  }

  return selected.map((i) => formatReleaseText(i)).join("\n");
}
export function buildSummary(grouped: {
  features: ReleaseItem[];
  improvements: ReleaseItem[];
  fixes: ReleaseItem[];
}) {
  const { features, improvements, fixes } = grouped;

  if (!features.length && !improvements.length && !fixes.length) {
    return "This release includes general maintenance updates and system improvements.";
  }

  const parts: string[] = [];

  // ✅ FEATURES
  if (features.length) {
    parts.push(
      `This release introduces ${features.length} feature${features.length > 1 ? "s" : ""}, enhancing key system capabilities and improving user workflows.`,
    );
  }

  // ✅ IMPROVEMENTS
  if (improvements.length) {
    parts.push(
      `A number of improvements have been implemented to optimise performance, usability, and overall system reliability.`,
    );
  }

  // ✅ FIXES
  if (fixes.length) {
    parts.push(
      `Additionally, ${fixes.length} issue${fixes.length > 1 ? "s have" : " has"} been resolved to improve stability and data integrity.`,
    );
  }

  return parts.join("\n\n");
}
