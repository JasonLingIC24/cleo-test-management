import type { Feature } from "cleo-domain";
import type {
  FeatureReport,
  ReportSummary,
} from "../models/reportModels.js";
import type { ScenarioNode } from "../models/reportModels.js";
/**
 * Convert a test-management Feature into a reporting DTO.
 */
export function featureToReport(
  feature: Feature,
): FeatureReport {
  let taggedSteps = 0;

  const seen = new Set();

  const scenarios = feature.scenarios
    .filter(s => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    }).map((scenario: any) => {
      const steps = scenario.steps.map((step: any) => {
        if (step.tags?.length) {
          taggedSteps++;
        }

        return {
          type: step.type,
          description: step.description,
          tags: step.tags ?? [],
          tcId: (step as any).tcId ?? ""
        };
      });

      return {
        title: cleanThenTitle(scenario.title),
        steps,
        stepCount: steps.length,
        tags: scenario.tags ?? [],
      };
    });


  const totalStepCount = scenarios.reduce(
    (sum, s) => sum + s.stepCount,
    0,
  );

  const featureId = `FEATURE-${feature.name
    .replace(/^Feature:\s*/i, "")
    .replace(/[^\w]/g, "-")
    .toUpperCase()}`;

  return {
    file: (feature as any).file ?? "",
    name: feature.name,
    featureId,   // ✅ NEW
    domain: feature.domain,
    tags: feature.tags ?? [],   // ✅ ADD THIS
    subdomain: feature.subdomain,
    scenarioCount: feature.scenarios.length,
    stepCount: totalStepCount,
    taggedSteps,
    scenarios: scenarios,
  };
}

/**
 * Build an aggregate summary for CLI / CI output.
 */
export function buildSummary(
  reports: FeatureReport[],
): ReportSummary {
  const domains: Record<string, number> = {};
  let scenarioCount = 0;
  let stepCount = 0;

  for (const report of reports) {
    scenarioCount += report.scenarioCount;
    stepCount += report.stepCount;

    if (report.domain) {
      domains[report.domain] =
        (domains[report.domain] ?? 0) + 1;
    }
  }

  return {
    featureCount: reports.length,
    scenarioCount,
    stepCount,
    domains,
  };
}
function cleanThenTitle(text: string): string {
  return (text || "")

    // ✅ remove backticks from template literals
    .replace(/^`+|`+$/g, "")

    // ✅ convert newlines → spaces
    .replace(/\n\s*/g, " ")

    // ✅ join concatenated strings: "foo" + "bar"
    .replace(/"\s*\+\s*"/g, " ")

    // ✅ remove stray quotes
    .replace(/^"+|"+$/g, "")

    // ✅ convert template vars ${x} → {x}
    .replace(/\$\{([\w\.]+)\}/g, (_, v) => {
      return `{${v.split(".").pop()}}`;
    })

    // ✅ remove TC IDs like [PAT-XXX]
    .replace(/\[[^\]]+\]\s*/, "")

    // ✅ collapse whitespace
    .replace(/\s+/g, " ")

    .trim();
}