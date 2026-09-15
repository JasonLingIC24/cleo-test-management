type Scenario = {
  title: string;
  steps: string[];
};

export function buildScenarios(ac: string[]) {

  const scenarios: { title: string; steps: string[] }[] = [];

  let current: string[] = [];

  for (const step of ac) {

    const lower = step.toLowerCase();

    // ✅ Detect scenario boundaries (VERY IMPORTANT)
    if (
      lower.includes("allow creation") ||
      lower.includes("real-time validation") ||
      lower.includes("date picker") ||
      lower.includes("prevent backdoor") ||
      lower.includes("error message") ||
      lower.includes("handling of time zone") ||
      lower.includes("editing existing")
    ) {
      if (current.length) {
        scenarios.push({
          title: getScenarioTitle(current),
          steps: current
        });
        current = [];
      }

      continue; // ✅ skip heading line itself
    }

    current.push(step);
  }

  if (current.length) {
    scenarios.push({
      title: getScenarioTitle(current),
      steps: current
    });
  }

  return scenarios;
}


// ✅ helper: generate titles properly
function getScenarioTitle(steps: string[]): string {

  const text = steps.join(" ").toLowerCase();

  if (text.includes("not create") || text.includes("cannot be in the past"))
    return "Prevent creation of past-dated service";

  if (text.includes("allows me to save"))
    return "Allow creation of future-dated service";

  if (text.includes("blur") || text.includes("focus"))
    return "Validate service date on field blur";

  if (text.includes("picker"))
    return "Restrict date/time picker selection";

  if (text.includes("backend") || text.includes("api"))
    return "Prevent invalid service creation via API";

  if (text.includes("time zone"))
    return "Validate service dates using system time zone";

  if (text.includes("edit"))
    return "Prevent editing service to past date";

  return "Service date validation";
}