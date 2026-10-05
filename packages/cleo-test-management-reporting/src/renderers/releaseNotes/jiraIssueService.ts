import pLimit from "p-limit";
import { getIssue } from "../../services/jiraClient.js";
import type { JiraConfig, ReleaseItem, NoteType } from "../../types/jira.js";
import { extractJiraText } from "../../services/jiraAdfParserService.js";

function classify(jiraType: string): NoteType {
  const type = jiraType.toLowerCase();

  if (["bug", "defect"].includes(type)) return "Fix";

  if (["story", "feature", "new feature"].includes(type)) return "Feature";

  return "Improvement";
}

export async function fetchReleaseItems(
  keys: string[],
  config: JiraConfig,
): Promise<ReleaseItem[]> {
  const limit = pLimit(5);

  const issues = await Promise.all(
    keys.map((k) =>
      limit(async () => {
        try {
          return await getIssue(k, config);
        } catch {
          console.warn(`⚠️ Failed to fetch ${k}`);
          return null;
        }
      }),
    ),
  );

  return issues.filter(Boolean).map((issue) => {
    const type = classify(issue!.type);

    return {
      key: issue!.key,
      summary: buildDetailedSummary(issue!.title, issue!.description),
      type,
      component: issue!.components?.[0] || "General",
    };
  });
}

function buildDetailedSummary(title: string, description: any): string {
  const cleanTitle = title.replace(/\[.*?\]/g, "").trim();

  const descText = extractJiraText(description);

  if (!descText) {
    return cleanTitle;
  }

  const firstSentence = descText.split(".")[0].substring(0, 180).trim();

  return `${cleanTitle}. ${firstSentence}`;
}
