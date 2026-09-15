/* Domain-facing shapes only — no parser imports */
export interface ParsedSpec {
  feature: {
    name: string;
    tags: string[];
    scenarios: ScenarioNode[];
  };
  filePath: string; // ✅ REQUIRED
}

export interface ScenarioNode {
  given: string;
  whens: WhenNode[];
}

export interface ThenNode {
  description: string;
  tags: string[];
  tcId?: string;
}

export interface ScenarioReport {
  title: string;
  steps: ThenNode[];
}
export interface SourceLocation {
  filePath: string;
  line: number;
  column: number;
}

export interface WhenNode {
  description: string;
  scenarios: ScenarioReport[];
  location: SourceLocation;
}

/* Test‑management domain entities */

export interface Feature {
  id: string;
  name: string;
  domain?: string;
  subdomain?: string;
  tags: string[];
  scenarios: Scenario[];
}

export interface Scenario {
  id: string;
  title: string;
  steps: Step[];
  tags?: string[]; // ✅ ADD THIS
}

export interface Step {
  type: "GIVEN" | "WHEN" | "THEN";
  description: string;
  tags: string[];
  tcId?: string; // ✅ ADD THIS
}

/* ---------------------------------------------------------------- */

function id(): string {
  return Math.random().toString(36).slice(2);
}

/**
 * Converts parsed BDD data into test‑management entities.
 */
export function mapParsedSpecToFeature(parsed: ParsedSpec): Feature {
  const feature = parsed.feature;

  const pathInfo = extractDomainFromPath(parsed.filePath);
  return {
    id: id(),
    name: feature.name,

    // ✅ Priority: path > tag
    domain: pathInfo.domain || extract(feature.tags, "@domain:"),

    subdomain: pathInfo.subdomain || extract(feature.tags, "@subdomain:"),

    tags: [...feature.tags],
    scenarios: feature.scenarios.map(mapScenario),
  };
}

function mapScenario(node: ScenarioNode): Scenario {
  const when = node.whens[0];

  const title = buildScenarioTitle(node.given, when?.description);

  const steps: Step[] = [];

  // ✅ GIVEN
  if (node.given) {
    steps.push({
      type: "GIVEN",
      description: cleanText(node.given),
      tags: [],
    });
  }

  // ✅ ADD THIS (YOU MISSED IT)
  steps.push(...node.whens.flatMap(mapWhen));

  return {
    id: id(),
    title,
    steps,
    tags: [], // ✅ keep IF you added it to interface
  };
}

function mapWhen(whenNode: WhenNode): Step[] {
  const steps: Step[] = [
    {
      type: "WHEN",
      description: whenNode.description,
      tags: [],
    },
  ];

  for (const scenario of whenNode.scenarios) {
    for (const step of scenario.steps) {
      steps.push(mapThen(step));
    }
  }

  return steps;
}

function mapThen(thenNode: ThenNode): Step {
  return {
    type: "THEN",
    description: cleanThenText(thenNode.description),
    tags: [...thenNode.tags],
    tcId: thenNode.tcId ?? undefined,
  };
}

function cleanThenText(text: string): string {
  return text
    .replace(/^then\s+/i, "")
    .replace(/^and\s+/i, "")
    .trim();
}

function extract(tags: string[], prefix: string): string | undefined {
  const tag = tags.find((t) => t.startsWith(prefix));
  return tag ? tag.slice(prefix.length) : undefined;
}

function buildScenarioTitle(given?: string, when?: string): string {
  const cleanGiven = cleanText(given);
  const cleanWhen = cleanText(when);

  if (cleanGiven && cleanWhen) {
    return `${cleanGiven} → ${cleanWhen}`;
  }

  return cleanGiven || cleanWhen || "Unnamed scenario";
}

function cleanText(text?: string): string {
  if (!text) return "";

  return text
    .replace(/^given\s+/i, "")
    .replace(/^when\s+/i, "")
    .replace(/^and when\s+/i, "")
    .trim();
}

function extractDomainFromPath(filePath?: string): {
  domain?: string;
  subdomain?: string;
} {
  if (!filePath) return {};

  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const versionRegex = /^\d+\.\d+\.\d+$/;
  const idx = parts.findIndex((p: string) => p === "tests");

  if (idx < 0) {
    return {};
  }

  const remaining = parts.slice(idx + 1);

  // Skip release folder like 26.14.0
  if (versionRegex.test(remaining[0])) {
    remaining.shift();
  }

  return {
    domain: remaining[0],
    subdomain: remaining[1],
  };
}
