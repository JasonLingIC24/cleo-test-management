/**
 * Derive a Feature name from a top-level describe title.
 *
 * Rules:
 * - If the title starts with "GIVEN", strip it
 * - Normalize spacing
 * - Capitalize the first letter
 *
 * Examples:
 * - "GIVEN the user logs in" → "The user logs in"
 * - "Given a doctor views cases" → "A doctor views cases"
 */
export function deriveFeatureNameFromDescribe(title: string): string {
  const trimmed = title.trim();

  const match = trimmed.match(/^given\s+(.*)$/i);
  if (match) {
    return capitalize(match[1]);
  }

  return trimmed;
}

function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}