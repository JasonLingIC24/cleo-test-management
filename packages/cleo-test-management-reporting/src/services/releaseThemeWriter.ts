import fs from "fs";
import path from "path";
import { configAccess } from "./configAccessService.js";
import type { ReleaseTheme } from "../models/releaseThemeModels.js";

export function saveReleaseThemes(themes: ReleaseTheme[]): string {
  const outputDir = path.join(configAccess.getJsonReports(), "release");

  fs.mkdirSync(outputDir, {
    recursive: true,
  });

  const outputPath = path.join(outputDir, "release-themes.json");

  fs.writeFileSync(outputPath, JSON.stringify(themes, null, 2));

  return outputPath;
}
