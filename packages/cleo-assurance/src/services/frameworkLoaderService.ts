import { readFileSync } from "node:fs";
import type { AssuranceFramework } from "../models/assuranceFrameworkModels.js";
import type { AssuranceRequirement } from "../models/assuranceRequirementModels.js";

export function getRequirements(
  framework: AssuranceFramework,
): AssuranceRequirement[] {
  return framework.sections.flatMap((section) => section.requirements);
}

export function loadFramework(frameworkPath: string): AssuranceFramework {
  const fileContents = readFileSync(frameworkPath, "utf-8");

  const framework = JSON.parse(fileContents) as AssuranceFramework;

  validateFramework(framework);

  return framework;
}

function validateFramework(framework: AssuranceFramework): void {
  if (!framework.id) {
    throw new Error("Framework id is required.");
  }

  if (!framework.title) {
    throw new Error("Framework title is required.");
  }

  if (!framework.version) {
    throw new Error("Framework version is required.");
  }

  if (!Array.isArray(framework.sections)) {
    throw new Error("Framework sections are required.");
  }

  for (const section of framework.sections) {
    if (!section.id) {
      throw new Error("Section id is required.");
    }

    if (!section.title) {
      throw new Error(`Section '${section.id}' title is required.`);
    }

    if (!Array.isArray(section.requirements)) {
      throw new Error(`Section '${section.id}' requirements are required.`);
    }

    for (const requirement of section.requirements) {
      if (!requirement.id) {
        throw new Error(`Requirement id missing in section '${section.id}'.`);
      }

      if (!requirement.title) {
        throw new Error(`Requirement '${requirement.id}' title is required.`);
      }

      if (!requirement.description) {
        throw new Error(
          `Requirement '${requirement.id}' description is required.`,
        );
      }
    }
  }
}
