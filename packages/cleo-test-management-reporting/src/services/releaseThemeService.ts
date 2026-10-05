import type { ReleaseNarrative } from "../models/releaseNarrativeModels.js";
import type { ReleaseTheme } from "../models/releaseThemeModels.js";
import { buildReleaseNoteBullets } from "./releaseThemeBulletService.js";
import { filterReleaseNoteBullets } from "./releaseNoteBulletFilterService.js";
import { resolveCapability } from "./releaseThemeCapabilityService.js";
import { generateThemeNarrative } from "./themeNarrativeGeneratorService.js";
import { isUserFacingBullet } from "./userReleaseNotesFilterService.js";

export function buildReleaseThemes(
  narratives: ReleaseNarrative[],
): ReleaseTheme[] {
  const themeMap = new Map<string, ReleaseNarrative[]>();

  for (const narrative of narratives) {
    const key = narrative.parentKey ?? narrative.jiraKey;

    const existing = themeMap.get(key) ?? [];

    existing.push(narrative);

    themeMap.set(key, existing);
  }

  const themes: ReleaseTheme[] = [];

  for (const [key, items] of themeMap) {
    const first = items[0];
    const commitSubjects = items.flatMap((n) => n.commitSubjects);
    const releaseNoteBullets = filterReleaseNoteBullets(
      buildReleaseNoteBullets(commitSubjects),
    );

    const userFacingBullets = releaseNoteBullets.filter(isUserFacingBullet);

    const temporaryTheme: ReleaseTheme = {
      key,
      title: first.parentTitle ?? first.title,
      capability: resolveCapability(first.parentTitle ?? first.title),
      themeNarrative: "",
      jiraKeys: [],
      commitCount: 0,
      featureCount: 0,
      fixCount: 0,
      userFacingBullets,
      narratives: items,
      stakeholderNarrative: "",
    };

    const themeNarrative = generateThemeNarrative(temporaryTheme);
    const stakeholderNarrative = themeNarrative;
    themes.push({
      key,
      title: first.parentTitle ?? first.title,
      capability: resolveCapability(first.parentTitle ?? first.title),
      themeNarrative,
      jiraKeys: items.map((n) => n.jiraKey),
      commitCount: items.reduce((total, n) => total + n.commitCount, 0),
      featureCount: items.filter((n) =>
        n.commitSubjects.some((c) => c.startsWith("FEATURE:")),
      ).length,
      fixCount: items.filter((n) =>
        n.commitSubjects.some((c) => c.startsWith("FIX:")),
      ).length,
      userFacingBullets,
      stakeholderNarrative,
      narratives: items,
    });
  }

  return themes.sort((a, b) => b.commitCount - a.commitCount);
}
