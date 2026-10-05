import type { ReleaseNarrative } from "./releaseNarrativeModels.js";

export interface ReleaseTheme {
  key: string;
  title: string;
  themeNarrative: string;
  jiraKeys: string[];
  commitCount: number;
  capability: string;
  featureCount: number;
  fixCount: number;
  userFacingBullets: string[];
  narratives: ReleaseNarrative[];
  stakeholderNarrative: string;
}

export interface ReleaseThemeCollection {
  releaseVersion: string;
  themes: ReleaseTheme[];
}
