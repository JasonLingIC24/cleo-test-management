import { readFileSync } from "node:fs";

import type { AssuranceRequirement } from "../models/assuranceRequirementModels.js";

import type { AssuranceRequirementsDocument } from "../models/assuranceRequirementsDocumentModels.js";

import type { OnlineScalImportOptions } from "../models/onlineScalImportModels.js";

export async function importOnlineScal(
  filePath: string,
  options: OnlineScalImportOptions,
): Promise<AssuranceRequirementsDocument> {
  const content = readFileSync(filePath, "utf8");

  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const requirements: AssuranceRequirement[] = [];

  let currentSection = "General";

  let currentQuestionId: string | undefined;
  let parentRequirementId: string | undefined;
  let currentQuestionText: string[] = [];

  function flushQuestion(): void {
    if (!currentQuestionId || currentQuestionText.length === 0) {
      return;
    }

    requirements.push({
      trudDocument: currentSection,

      id: currentQuestionId,

      parentRequirementId,

      area: currentSection,

      title: extractTitle(currentQuestionText.join(" ")),

      description: currentQuestionText.join(" "),

      status: "not-started",

      evidenceIds: [],

      framework: options.framework,

      source: "online",
    });

    currentQuestionId = undefined;

    currentQuestionText = [];
  }

  for (const line of lines) {
    const questionMatch = line.match(/^Q\.(\d+)(?:\.(\d+))?$/);

    if (questionMatch) {
      flushQuestion();

      currentQuestionId = line;

      if (questionMatch[2]) {
        parentRequirementId = `Q.${questionMatch[1]}`;
      } else {
        parentRequirementId = undefined;
      }

      continue;
    }

    if (!currentQuestionId && !line.startsWith("Q.")) {
      currentSection = line;

      continue;
    }

    currentQuestionText.push(line);
  }

  flushQuestion();

  return {
    framework: options.framework,

    version: "1.0",

    requirements,
  };
}

function extractTitle(questionText: string): string {
  const firstSentence = questionText.split("?")[0].trim();

  return firstSentence;
}
