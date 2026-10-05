import fs from "fs";
import path from "path";
import { configAccess } from "./configAccessService.js";
import type { ReleaseNarrative } from "../models/releaseNarrativeModels.js";

export function saveReleaseNarratives(narratives: ReleaseNarrative[]): string {
  const outputDir = path.join(configAccess.getJsonReports(), "release");

  fs.mkdirSync(outputDir, {
    recursive: true,
  });

  const outputPath = path.join(outputDir, "release-narratives.json");

  fs.writeFileSync(outputPath, JSON.stringify(narratives, null, 2));

  return outputPath;
}
