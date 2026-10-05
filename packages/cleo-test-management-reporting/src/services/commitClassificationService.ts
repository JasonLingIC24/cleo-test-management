import type { CommitAnalysis } from "./commitAnalysisService.js";

export type CommitClassification = {
  features: string[];
  fixes: string[];
  tests: string[];
  others: string[];
};

export function classifyCommits(
  analysis: CommitAnalysis,
): CommitClassification {
  const features: string[] = [];
  const fixes: string[] = [];
  const tests: string[] = [];
  const others: string[] = [];

  for (const commit of analysis.commits) {
    const cleaned = stripCommitHash(commit);

    if (cleaned.startsWith("FEATURE:")) {
      features.push(cleaned.replace(/^FEATURE:\s*/, ""));
      continue;
    }

    if (cleaned.startsWith("FIX:")) {
      fixes.push(cleaned.replace(/^FIX:\s*/, ""));
      continue;
    }

    if (cleaned.startsWith("TEST:")) {
      tests.push(cleaned.replace(/^TEST:\s*/, ""));
      continue;
    }

    others.push(cleaned);
  }

  return {
    features,
    fixes,
    tests,
    others,
  };
}

function stripCommitHash(commit: string): string {
  return commit.replace(/^[a-f0-9]+\s+/, "");
}
