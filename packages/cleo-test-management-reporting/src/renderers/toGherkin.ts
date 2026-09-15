import type { FeatureReport } from "../models/reportModels.js";
import { cleanText } from "cleo-domain";
import { buildStandardName } from "../utils/naming.js";

export function toGherkinFiles(
  features: FeatureReport[],
  baseName: string
) {
  const files: Record<string, string> = {};
  validateTcIds(features);  // ✅ ADD HERE

  for (const feature of features) {
    const lines: string[] = [];

    // ✅ FEATURE HEADER (CLEAN + FILTERED)

    // ✅ 1. Add ONLY ONE feature ID tag
    if (feature.featureId) {
      lines.push(`@${feature.featureId}`);
    }

    // ✅ 2. Clean runtime tags
    const runtimeTags = (feature.tags ?? []).filter(tag => {
      return (
        !tag.startsWith("@FEATURE-") &&   // ❌ remove all feature IDs
        !tag.startsWith("@FEAT_") &&      // ❌ remove legacy
        tag !== `@${feature.featureId}`   // ❌ remove exact duplicate
      );
    });

    // ✅ 3. Add runtime tags ONCE
    if (runtimeTags.length > 0) {
      lines.push(runtimeTags.join(" "));
    }

    lines.push(`Feature: ${feature.name.replace(/^Feature:\s*/i, "")}`);
    lines.push(buildFeatureOverview(feature));
    lines.push("");

    for (const scenario of feature.scenarios || []) {

      const steps = scenario.steps || [];

      if (!steps.length) continue;

      const given = steps.find((s: any) => s.type === "GIVEN");
      const when = steps.find((s: any) => s.type === "WHEN");

      const thenSteps = steps.filter((s: any) => s.type === "THEN");

      // ✅ collect tcIds
      const tcIds = [...new Set(
        thenSteps
          .map((s: any) => s.tcId)
          .filter(Boolean)
      )].map(id => `@${id}`).join(" ");

      if (tcIds) {
        lines.push(tcIds);
      }

      const givenText = sanitizeStepText(cleanText(given?.description || ""));
      const whenText = sanitizeStepText(cleanText(when?.description || ""));

      lines.push(
        `  Scenario: ${sanitizeStepText(formatScenarioName(cleanText(scenario.title)))}\n\n` +
        `    Given ${givenText}\n` +
        `    When ${whenText}`
      );

      // ✅ handle THEN or fallback
      const effectiveSteps =
        thenSteps.length > 0
          ? thenSteps
          : steps.slice(2); // fallback after GIVEN/WHEN

      effectiveSteps.forEach((step: any, index: number) => {
        const text = sanitizeStepText(cleanText(step.description || ""));

        if (!text || text.length < 3) return; // ✅ skip junk steps

        const keyword = index === 0 ? "Then" : "And";

        lines.push(`    ${keyword} ${text}`);
      });

      lines.push("");
    }

    const fileName = buildStandardName({
      baseName,
      feature: feature.name
    });

    files[fileName] = lines.join("\n").trim();
  }

  return files;
}

/* ============================================================
   HELPERS
============================================================ */

function buildFeatureOverview(feature: FeatureReport): string {
  const givens = new Set<string>();
  const whens = new Set<string>();

  for (const scenario of feature.scenarios || []) {
    const steps = scenario.steps || [];

    const given = steps.find((s: any) => s.type === "GIVEN");
    const when = steps.find((s: any) => s.type === "WHEN");

    if (given?.description) {
      givens.add(cleanText(given.description));
    }

    if (when?.description) {
      whens.add(cleanText(when.description));
    }
  }

  return [
    "  # Description:",
    `  # ${feature.name.replace(/^Feature:\\s*/i, "")}`,
    "",
    "  # Scope:",
    ...Array.from(whens).map(w => `  # - ${w}`),
    "",
    "  # Preconditions:",
    ...Array.from(givens).map(g => `  # - ${g}`)
  ].join("\n");
}

function formatScenarioName(title: string): string {
  return (title || "Unnamed Scenario")
    .split("→")
    .pop()!
    .replace(/\$\{\$?\{?([\w\.]+)\}?/g, (_, v) => {
      return `{${v.split(".").pop()}}`;
    })
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeStepText(text: string): string {
  if (!text) return "";

  let cleaned = text
    .replace(/`/g, "")                 // remove backticks
    .replace(/[“”]/g, '"')             // smart double quotes
    .replace(/[‘’]/g, "'")             // smart single quotes
    .replace(/\\"/g, '"')              // fix escaped quotes
    .replace(/\s+/g, " ")              // collapse whitespace
    .trim();

  // ✅ FIX UNBALANCED QUOTES
  const quoteCount = (cleaned.match(/"/g) || []).length;

  if (quoteCount % 2 !== 0) {
    // remove all quotes if broken
    cleaned = cleaned.replace(/"/g, "");
  }

  // ✅ REMOVE BROKEN TRAILING TOKENS
  if (cleaned.endsWith("And") || cleaned.endsWith("Then")) {
    cleaned = cleaned.replace(/(And|Then)$/, "").trim();
  }

  return cleaned;
}

function validateTcIds(features: FeatureReport[]) {
  const seen = new Map<string, string>();
  const duplicates: string[] = [];

  for (const feature of features) {
    for (const scenarioNode of feature.scenarios || []) {
      for (const whenNode of scenarioNode.whens || []) {
        for (const scenario of whenNode.scenarios || []) {
          for (const step of scenario.steps || []) {

            const tcId = (step as any).tcId;

            if (!tcId) continue;

            if (seen.has(tcId)) {
              const first = seen.get(tcId);

              duplicates.push(
                `❌ ${tcId}\n   First: ${first}\n   Second: ${scenario.title}`
              );
            } else {
              seen.set(tcId, scenario.title);
            }
          }
        }
      }
    }
  }

  if (duplicates.length > 0) {
    console.error("\n🚨 Duplicate TC IDs detected:\n");
    duplicates.forEach(d => console.error(d));
    console.error("\n⚠️ Pipeline continuing, but IDs must be fixed.\n");
  }
}
