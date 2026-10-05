import { execSync } from "child_process";
import { getRepoPath } from "./gitSourceService.js";

export type CommitAnalysis = {
  previousTag: string;
  currentTag: string;
  commits: string[];
  jiraKeys: string[];
};

export function getCommitsBetweenTags(
  previousTag: string,
  currentTag: string,
): CommitAnalysis {
  const repoPath = getRepoPath();

  const output = execSync(
    `git -C "${repoPath}" log --oneline ${previousTag}..${currentTag}`,
    {
      encoding: "utf8",
    },
  );

  const commits = output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const jiraKeys = new Set<string>();

  for (const commit of commits) {
    const matches = commit.match(/[A-Z]+-\d+/g);

    if (matches) {
      matches.forEach((key) => jiraKeys.add(key));
    }
  }

  return {
    previousTag,
    currentTag,
    commits,
    jiraKeys: [...jiraKeys].sort(),
  };
}
