import fs from "fs";
import path from "path";
import { generateFromTemplate } from "../templateGenerator.js";
import { configAccess } from "../../services/configAccessService.js";
import { getConfig } from "../../services/configService.js";
import { buildFileName } from "../../utils/fileNaming.js";
import {
  buildHighlights,
  buildSummary,
  formatReleaseText,
  flattenGroups,
} from "./releaseNotesBuilder.js";

import type { ComponentGroup } from "./releaseNotesBuilder.js";

function getSectionOrder(name: string): number {
  switch (name) {
    case "Case Management":
      return 1;

    case "User Administration":
      return 2;

    case "Patient Tracking Lists":
      return 3;

    case "Integrations":
      return 4;

    case "User Interface":
      return 5;

    case "Technical Improvements":
      return 6;

    case "General":
      return 7;

    default:
      return 99;
  }
}

/* =========================
   DOC GENERATION
========================= */
export async function generateReleaseNotesDoc(
  grouped: any,
  templatePath: string,
) {
  const config = getConfig();

  const docsDir = configAccess.getDocsReleaseDir();
  fs.mkdirSync(docsDir, { recursive: true });

  const fileName = buildFileName(config, "release-notes.docx");
  const outputPath = path.join(docsDir, fileName);

  /* =========================
     CONTENT (RESTORED)
  ========================= */
  const flattened = flattenGroups(grouped);

  const highlights = buildHighlights(flattened);
  const summary = buildSummary(flattened);

  const data = {
    BASE_URL: config.jira?.baseUrl,

    TITLE: `${config.product.name} Release Notes`,
    VERSION: config.release.version,
    ENV: config.release.environment,

    SUMMARY: summary,
    HIGHLIGHTS: highlights,

    FILENAME: fileName,
    TEAM: config.owners?.qaTeam,
    PRODUCT: config.product.name,
    DOC_VERSION: `v${config.release.version}`,

    OWNER: config.owners?.productOwner || "TBC",
    DIRECTOR: config.owners?.director || "TBC",
    AUTHORS: config.owners?.author || "TBC",

    DATE: new Date().toLocaleDateString(),
  };

  const componentGroups: ComponentGroup[] = grouped;

  /* =========================
     STRUCTURED SECTIONS (RESTORED)
  ========================= */
  const sections = componentGroups
    .sort(
      (a: ComponentGroup, b: ComponentGroup) =>
        getSectionOrder(a.name) - getSectionOrder(b.name),
    )
    .map((component: ComponentGroup) => ({
      title: component.name,
      items: [
        ...component.features,
        ...component.improvements,
        ...component.fixes,
      ].map((i) => ({
        key: i.key,
        text: formatReleaseText(i),
      })),
    }));

  await generateFromTemplate(templatePath, outputPath, data, sections);

  return outputPath;
}
