import type { FeatureReport } from "../models/reportModels.js";
import type {
  ManualScenario,
  ManualStep,
  ManualWorkbookData,
} from "../models/manualTestModels.js";

export function mapManualToFeatureReports(
  structuredData: ManualWorkbookData,
): FeatureReport[] {
  const features: FeatureReport[] = [];

  for (const [sheetName, scenarios] of Object.entries(structuredData)) {
    const scenarioList = scenarios.map((sc) => ({
      title: sc.scenarioTitle,
      steps: buildSteps(sc),
      tags: [],
    }));

    const stepCount = scenarioList.reduce(
      (acc, s) => acc + (s.steps?.length || 0),
      0,
    );

    const feature: FeatureReport = {
      file: sheetName.replace(/\s+/g, "-").toLowerCase(),
      domain: "manual", // ✅ consistent domain
      subdomain: sheetName, // ✅ treat sheet as subdomain
      name: sheetName,
      featureId: "",
      tags: ["@manual"],

      scenarios: scenarioList,

      // ✅ ADD THESE (required by type)
      scenarioCount: scenarioList.length,
      stepCount: stepCount,
      taggedSteps: 0,
    };

    features.push(feature);
  }

  return features;
}

function buildSteps(sc: ManualScenario) {
  const steps: ManualStep[] = [];

  sc.givenColSteps.forEach((s: string) => {
    steps.push({ type: "GIVEN", description: stripKeyword(s) });
  });

  sc.whenColSteps.forEach((s: string) => {
    steps.push({ type: "WHEN", description: stripKeyword(s) });
  });

  sc.thenColSteps.forEach((s: string) => {
    steps.push({ type: "THEN", description: stripKeyword(s) });
  });

  return steps;
}

function stripKeyword(text: string): string {
  return text.replace(/^(given|when|then)\s+/i, "").trim();
}
