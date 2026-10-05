import type { ReleaseTheme } from "../models/releaseThemeModels.js";
import { selectPrimaryNarrative } from "./releaseThemeNarrativeSelector.js";

export function generateThemeNarrative(theme: ReleaseTheme): string {
  const primary = selectPrimaryNarrative(theme.narratives);

  if (!primary) {
    return "";
  }

  return primary.narrative;
}
