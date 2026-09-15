export function generateFeatureFromBDD(issue: any, steps: string[]) {

  const formattedSteps = steps.map((step, index) => {

    if (index === 0) return `    Given ${step}`;
    if (index === 1) return `    When ${step}`;
    if (index === 2) return `    Then ${step}`;

    return `    And ${step}`;
  }).join("\n");

  return `Feature: ${issue.summary || "Feature"}

  @${issue.key}
  Scenario: ${issue.title}

${formattedSteps}
`;
}
