import fs from "fs";
import path from "path";
import { searchIssuesByVersion } from "../../services/jiraClient.js";
import { configAccess } from "../../services/configAccessService.js";
import { getConfig } from "../../services/configService.js";
import { fetchReleaseItems } from "./jiraIssueService.js";
import { group } from "./releaseNotesBuilder.js";
import { generateReleaseNotesDoc } from "./releaseNotesDocService.js";
import { buildReleaseThemes } from "../../services/releaseThemeService.js";
import { generateThemeReleaseNotesDoc } from "./releaseNotesDocService.js";

export async function generateReleaseNotesFromThemes() {
  const config = getConfig();

  const templatePath = configAccess.getTemplate("releaseNotes");

  const themesPath = path.join(
    configAccess.getJsonReports(),
    "release",
    "release-themes.json",
  );

  if (!fs.existsSync(themesPath)) {
    throw new Error("release-themes.json not found");
  }

  const themes = JSON.parse(fs.readFileSync(themesPath, "utf8"));

  const outputPath = await generateThemeReleaseNotesDoc(themes, templatePath);

  console.log(`✅ Theme Release Notes created: ${outputPath}`);

  return outputPath;
}

export async function generateReleaseNotesFromVersion(version: string) {
  const config = getConfig();
  const jiraConfig = config.jira;

  const templatePath = configAccess.getTemplate("releaseNotes");

  const keys = await searchIssuesByVersion(version, jiraConfig);

  const items = await fetchReleaseItems(keys, jiraConfig);
  const grouped = group(items);

  const outputPath = await generateReleaseNotesDoc(grouped, templatePath);

  console.log(`✅ Release Notes from Version created: ${outputPath}`);

  return outputPath;
}

export async function generateReleaseNotesFromKeys(csv: string) {
  const config = getConfig();
  const jiraConfig = config.jira;

  const templatePath = configAccess.getTemplate("releaseNotes");

  const keys = csv
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const items = await fetchReleaseItems(keys, jiraConfig);

  const grouped = group(items);

  const outputPath = await generateReleaseNotesDoc(grouped, templatePath);

  console.log(`✅ Release Notes from Keys created: ${outputPath}`);

  return outputPath;
}
