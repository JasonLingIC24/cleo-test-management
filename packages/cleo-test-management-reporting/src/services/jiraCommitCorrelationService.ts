import { execSync } from "child_process";
import { getRepoPath } from "./gitSourceService.js";

import type {
  CommitReference,
  JiraCommitMapping,
  ReleaseCommitCorrelation,
} from "../models/releaseCorrelationModels.js";

export function correlateJiraCommits(
  previousTag: string,
  currentTag: string,
): ReleaseCommitCorrelation {
  const repoPath = getRepoPath();

  const output = execSync(
    `git -C "${repoPath}" log --pretty=format:"===COMMIT===%n%H%n%s%n%b" ${previousTag}..${currentTag}`,
    {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  const rawCommits = output
    .split("===COMMIT===")
    .map((c) => c.trim())
    .filter(Boolean);

  const commits: CommitReference[] = [];

  for (const raw of rawCommits) {
    const lines = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const hash = lines[0] ?? "";
    const subject = lines[1] ?? "";

    const fullMessage = lines.join("\n");

    const jiraKeys = [...new Set(fullMessage.match(/[A-Z]+-\d+/g) ?? [])];

    commits.push({
      hash,
      subject,
      jiraKeys,
    });
  }

  const jiraMap = new Map<string, CommitReference[]>();

  for (const commit of commits) {
    for (const jiraKey of commit.jiraKeys) {
      if (!jiraMap.has(jiraKey)) {
        jiraMap.set(jiraKey, []);
      }

      jiraMap.get(jiraKey)!.push(commit);
    }
  }

  const jiraMappings: JiraCommitMapping[] = [...jiraMap.entries()]
    .map(([jiraKey, commits]) => ({
      jiraKey,
      commits,
    }))
    .sort((a, b) => a.jiraKey.localeCompare(b.jiraKey));

  return {
    previousTag,
    currentTag,
    commits,
    jiraMappings,
  };
}
