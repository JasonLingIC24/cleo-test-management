import { buildScenarios } from "../parsers/scenarioBuilder.js";

export function generateTestCase(issue: any, ac: string[], text: string) {

  const scenarios = buildScenarios(ac);

  return {
    key: issue.key,
    title: issue.title,
    scenarios: scenarios.map(s => ({
      name: s.title,
      steps: s.steps
    }))
  };
}
