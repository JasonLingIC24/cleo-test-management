import fs from "fs";
import path from "path";

import { configAccess } from "../../services/configAccessService.js";

import { generateThemeReleaseNotesDoc } from "./releaseNotesDocService.js";

export async function generateReleaseNotesFromThemes() {
  const templatePath = configAccess.getTemplate("releaseNotes");

  const themesPath = path.join(
    configAccess.getJsonReports(),
    "release",
    "release-themes.json",
  );

  const themes = JSON.parse(fs.readFileSync(themesPath, "utf8"));

  return generateThemeReleaseNotesDoc(themes, templatePath);
}
