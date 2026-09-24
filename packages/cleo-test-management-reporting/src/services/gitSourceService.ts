import { configAccess } from "./configAccessService.js";
import { execSync } from "child_process";
import os from "os";
import path from "path";

export function getSourceTag(sourceTag?: string): string {
  if (sourceTag) {
    return sourceTag;
  }

  const version = configAccess.getReleaseVersion();

  return `v${version}`;
}

export function tagExists(tag: string): boolean {
  const repoPath =
    process.env.ELEVATE_MONOREPO ??
    path.join(os.homedir(), "debian-src", "elevate-monorepo");

  const output = execSync(`git -C "${repoPath}" tag -l "${tag}"`, {
    encoding: "utf8",
  }).trim();

  return output === tag;
}

export function getCurrentBranch(): string {
  const repoPath = getRepoPath();

  return execSync(`git -C "${repoPath}" branch --show-current`, {
    encoding: "utf8",
  }).trim();
}

export function getPreviousTag(currentTag: string): string | undefined {
  const repoPath = getRepoPath();

  const output = execSync(`git -C "${repoPath}" tag --sort=version:refname`, {
    encoding: "utf8",
  });

  const tags = output
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

  const currentIndex = tags.indexOf(currentTag);

  if (currentIndex <= 0) {
    return undefined;
  }

  return tags[currentIndex - 1];
}

export function checkoutTag(tag: string): void {
  const repoPath = getRepoPath();
  execSync(`git -C "${repoPath}" checkout ${tag}`, { stdio: "pipe" });
}

export function checkoutBranch(branch: string): void {
  const repoPath = getRepoPath();
  execSync(`git -C "${repoPath}" checkout ${branch}`, { stdio: "pipe" });
}

export function getRepoPath(): string {
  return (
    process.env.ELEVATE_MONOREPO ??
    path.join(os.homedir(), "debian-src", "elevate-monorepo")
  );
}
