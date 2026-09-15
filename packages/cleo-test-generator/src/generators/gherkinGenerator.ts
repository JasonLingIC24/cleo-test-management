import { buildScenarios } from "../parsers/scenarioBuilder.js";
import { extractActor } from "../utils/actorExtractor.js";

type Scenario = {
  title: string;
  steps: string[];
};



function toGherkinSteps(steps: string[], actor: string): string[] {
  return steps.map((step, index) => {

    const lower = step.toLowerCase();

    // ✅ GIVEN (setup / state)
    if (index === 0) {
      if (lower.includes("logged in"))
        return `Given the ${actor} is logged in`;

      return `Given the ${actor} is using the system`;
    }

    // ✅ WHEN (user actions)
    if (lower.includes("click")) {
      const buttonMatch = step.match(/click(?:ing)? (.+)/i);
      if (buttonMatch) {
        return `When the ${actor} clicks "${buttonMatch[1].trim()}"`;
      }
      return `When the ${actor} performs an action`;
    }

    // ✅ DIALOGS / UI
    if (lower.includes("dialog")) {
      return `Then a confirmation dialog is displayed`;
    }

    // ✅ SUCCESS
    if (lower.includes("success") || lower.includes("removed")) {
      return `Then the action is completed successfully`;
    }

    // ✅ FAILURE
    if (lower.includes("fail") || lower.includes("error")) {
      return `Then an error message is displayed`;
    }

    // ✅ BUTTONS
    if (lower.includes("cancel")) {
      return `When the ${actor} clicks "Cancel"`;
    }

    if (lower.includes("continue")) {
      return `When the ${actor} clicks "Continue"`;
    }

    return `And ${step}`;
  });
}

export function generateFeatureFromIssue(issue: any, text: string, ac: string[]) {

  const scenarios: Scenario[] = buildScenarios(ac);
const actor = extractActor(text);

  const featureName = issue.components?.[0] || "General";

  const scenarioText = scenarios.map(s => {

    const steps = toGherkinSteps(s.steps, actor)
      .map(step => `    ${step}`)
      .join("\n");

    return `
  @${issue.key}
  Scenario: ${s.title}
${steps}
`;
  }).join("\n");

  return `Feature: ${featureName}

${scenarioText}
`;
}