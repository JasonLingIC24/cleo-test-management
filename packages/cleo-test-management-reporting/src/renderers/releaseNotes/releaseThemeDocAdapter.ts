import type { ReleaseTheme } from "../../models/releaseThemeModels.js";

export interface ThemeSection {
  title: string;

  items: {
    key: string;
    text: string;
  }[];
}

export function adaptThemesToSections(themes: ReleaseTheme[]): ThemeSection[] {
  return themes.map((theme) => ({
    title: theme.title,

    items: [
      {
        key: "",

        text: [
          theme.stakeholderNarrative,
          "",
          "Key Changes",
          "",
          ...theme.userFacingBullets.map((bullet) => `• ${bullet}`),
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ],
  }));
}
