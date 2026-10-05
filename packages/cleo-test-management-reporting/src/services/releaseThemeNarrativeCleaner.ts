export function cleanThemeNarrative(
  themeTitle: string,
  rawNarrative: string,
): string {
  let text = rawNarrative;

  // Remove repeated theme prefixes
  const escapedTitle = escapeRegExp(themeTitle);

  text = text.replace(new RegExp(`${escapedTitle}\\.\\s*`, "gi"), "");

  // Remove common Jira story language
  text = text.replace(/AS A .*? I WANT .*? SO THAT .*?\./gis, "");

  text = text.replace(/Acceptance Criteria:.*$/gis, "");

  text = text.replace(/Testing:.*$/gis, "");

  // Normalise whitespace
  text = text.replace(/\s+/g, " ");

  // Split into sentences
  const sentences = text
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean);

  // Deduplicate sentences
  const unique = [...new Set(sentences)];

  // Keep useful content only
  return unique.slice(0, 4).join(". ").trim().concat(".");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
