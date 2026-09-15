import fs from "fs";
import path from "path";

import { parseJiraDescription } from "../parsers/jiraDescriptionParser.js";

export async function exportEpicRequirements(
  issues: any[],
  outputFile: string,
) {
  const epicMap = new Map<string, any>();

  for (const issue of issues) {
    if (issue.fields.issuetype?.name !== "Epic") {
      continue;
    }

    epicMap.set(issue.key, {
      key: issue.key,
      summary: issue.fields.summary,
      description: parseJiraDescription(issue.fields.description),
      stories: [],
    });
  }

  // =============================
  // Attach Stories
  // =============================

  let orphanCount = 0;

  for (const issue of issues) {
    if (issue.fields.issuetype?.name === "Epic" || !issue.fields.parent) {
      continue;
    }

    const parentKey = issue.fields.parent.key;

    const epic = epicMap.get(parentKey);

    if (!epic) {
      orphanCount++;

      console.warn(`⚠️ Orphan Story: ${issue.key} -> ${parentKey}`);

      continue;
    }

    epic.stories.push({
      key: issue.key,

      // ✅ ADD THIS
      parentKey,

      summary: issue.fields.summary,

      description: parseJiraDescription(issue.fields.description),
    });
  }

  // =============================
  // Build Output
  // =============================

  const output = [...epicMap.values()];

  const storyCount = output.reduce(
    (total, epic) => total + epic.stories.length,
    0,
  );

  // =============================
  // Validation Summary
  // =============================

  const orphanPct =
    storyCount > 0
      ? ((orphanCount / (storyCount + orphanCount)) * 100).toFixed(2)
      : "0.00";

  console.log(`
📊 Requirements Export Summary

   Epics      : ${output.length}
   Stories    : ${storyCount}
   Orphans    : ${orphanCount}
   Orphan %   : ${orphanPct}%
`);

  // =============================
  // Optional Debug
  // =============================

  const largestEpic = output.sort(
    (a, b) => b.stories.length - a.stories.length,
  )[0];

  if (largestEpic) {
    console.log(
      `📌 Largest Epic: ${largestEpic.key} (${largestEpic.stories.length} stories)`,
    );
  }

  // =============================
  // Write Output
  // =============================

  const file = path.resolve(outputFile);

  fs.mkdirSync(path.dirname(file), { recursive: true });

  fs.writeFileSync(file, JSON.stringify(output, null, 2));

  console.log(`📄 Exported: ${file}`);

  return output;
}
