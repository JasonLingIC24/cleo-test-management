import { formatReleaseBullet } from "./releaseNoteFormatterService.js";

export function buildReleaseNoteBullets(commitSubjects: string[]): string[] {
  const ignorePatterns = [
    "swagger",
    "prettier",
    "copilot",
    "unit test",
    "integration test",
    "review",
    "conflict",
    "conflit",
    "missing file",
    "mock",
    "ods mock",
    "regenerate",
    "types",
    "docs",
  ];

  return [
    ...new Set(
      commitSubjects
        .filter((subject) => {
          const lower = subject.toLowerCase();

          if (subject.startsWith("TEST:")) {
            return false;
          }

          return !ignorePatterns.some((pattern) => lower.includes(pattern));
        })
        .map(normaliseBullet)
        .map(collapseBullet)
        .map(formatReleaseBullet)
        .filter(isStakeholderRelevant)
        .filter(Boolean),
    ),
  ];
}

function normaliseBullet(subject: string): string {
  let bullet = subject
    .replace(/^FEATURE:\s*/i, "")
    .replace(/^FIX:\s*/i, "")
    .trim();

  bullet = bullet
    .replace(/^Add\s+/i, "Added ")
    .replace(/^Capture\s+/i, "Added ")
    .replace(/^Launch\s+/i, "Added ")
    .replace(/^Show\s+/i, "Added ")
    .replace(/^Persist\s+/i, "Added ")
    .replace(/^Allow\s+/i, "Improved ")
    .replace(/^Keep\s+/i, "Improved ")
    .replace(/^Restore\s+/i, "Improved ")
    .replace(/^Remove\s+/i, "Improved ");

  return sentenceCase(bullet);
}

function collapseBullet(bullet: string): string {
  const lower = bullet.toLowerCase();

  if (lower.includes("gp practice")) {
    return "Added GP Practice capture and persistence.";
  }

  if (lower.includes("postcode")) {
    return "Added postcode address lookup support.";
  }

  if (lower.includes("pds status") || lower.includes("pds shield")) {
    return "Added PDS status indicators within patient search.";
  }

  if (lower.includes("address") && lower.includes("pds")) {
    return "Improved patient address handling for PDS-matched patients.";
  }

  if (lower.includes("pathways")) {
    return bullet;
  }

  return bullet;
}

function sentenceCase(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function isStakeholderRelevant(bullet: string): boolean {
  const lower = bullet.toLowerCase();

  const ignored = [
    "config",
    "endpoint",
    "variable",
    "swagger",
    "review",
    "mock",
    "types",
    "docs",
    "conflict",
    "conflit",
    "missing file",
    "copilot",
    "prettier",
  ];

  return !ignored.some((pattern) => lower.includes(pattern));
}
