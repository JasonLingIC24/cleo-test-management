import { execSync } from "child_process";
import { getRepoPath } from "./gitSourceService.js";

export type ChangeAnalysis = {
  previousTag: string;
  currentTag: string;
  changedFiles: string[];
  devopsFiles: string[];
  backendFiles: string[];
  frontendFiles: string[];
  cypressFiles: string[];
  mockServerFiles: string[];
  otherFiles: string[];
};

export function getChangedFiles(
  previousTag: string,
  currentTag: string,
): ChangeAnalysis {
  const repoPath = getRepoPath();

  const output = execSync(
    `git -C "${repoPath}" diff --name-only ${previousTag}..${currentTag}`,
    { encoding: "utf8" },
  );

  const changedFiles = output
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean);

  const devopsFiles = changedFiles.filter((file) => file.startsWith("devops/"));

  const frontendFiles = changedFiles.filter((file) =>
    file.startsWith("frontend/"),
  );

  const backendFiles = changedFiles.filter((file) =>
    file.startsWith("backend/"),
  );

  const cypressFiles = changedFiles.filter((file) =>
    file.includes("cypress/tests/"),
  );

  const mockServerFiles = changedFiles.filter((file) =>
    file.startsWith("mockserver/"),
  );

  const otherFiles = changedFiles.filter(
    (file) =>
      !devopsFiles.includes(file) &&
      !backendFiles.includes(file) &&
      !frontendFiles.includes(file) &&
      !cypressFiles.includes(file) &&
      !mockServerFiles.includes(file),
  );

  return {
    previousTag,
    currentTag,
    changedFiles,
    cypressFiles,
    frontendFiles,
    backendFiles,
    devopsFiles,
    mockServerFiles,
    otherFiles,
  };
}
