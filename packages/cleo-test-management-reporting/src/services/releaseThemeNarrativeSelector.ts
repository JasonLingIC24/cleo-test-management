import type { ReleaseNarrative } from "../models/releaseNarrativeModels.js";

export function selectPrimaryNarrative(
  narratives: ReleaseNarrative[],
): ReleaseNarrative | undefined {
  const stories = narratives.filter((n) => n.type === "Story");

  if (stories.length > 0) {
    return stories[0];
  }

  const bugs = narratives.filter(
    (n) => n.type === "Bug" || n.type?.includes("BUG"),
  );

  if (bugs.length > 0) {
    return bugs[0];
  }

  return narratives[0];
}
