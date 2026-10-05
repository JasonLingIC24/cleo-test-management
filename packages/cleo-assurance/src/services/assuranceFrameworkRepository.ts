import { writeFileSync, readFileSync } from "node:fs";

import type { AssuranceFramework } from "../models/assuranceFrameworkModels.js";

export function saveFramework(
  framework: AssuranceFramework,
  outputPath: string,
): void {
  writeFileSync(outputPath, JSON.stringify(framework, null, 2), "utf-8");
}

export function loadFrameworkFromRepository(
  frameworkPath: string,
): AssuranceFramework {
  const contents = readFileSync(frameworkPath, "utf8");

  return JSON.parse(contents) as AssuranceFramework;
}
