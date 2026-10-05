export function cleanUserNarrative(narrative: string): string {
  let text = narrative;

  text = text.replace(/AS A .*? SO THAT .*?\./gi, "");

  text = text.replace(/Acceptance Criteria:.*$/gi, "");

  text = text.replace(/Testing:.*$/gi, "");

  text = text.replace(/\s+/g, " ");

  return text.trim();
}
