import path from "path";

/**
 * Derive a human-friendly Feature name from a spec filename.
 *
 * Examples:
 * - casesFilters.spec.ts      → "Cases Filters"
 * - casesDefaultView.spec.ts  → "Cases Default View"
 * - login_page.spec.ts        → "Login Page"
 */
export function deriveFeatureNameFromFile(
  filePath: string,
): string {
  const base = path.basename(filePath);

  // Strip common test suffixes
  const withoutExtension = base
    .replace(/\.spec\.tsx?$/i, "")
    .replace(/\.test\.tsx?$/i, "")
    .replace(/\.cy\.tsx?$/i, "");

  return toTitleCase(
    splitWords(withoutExtension),
  );
}

/* ───────────────────────────────────────────── */
/* Helpers                                      */
/* ───────────────────────────────────────────── */

function splitWords(input: string): string {
  return input
    // camelCase / PascalCase → spaces
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    // snake_case / kebab-case → spaces
    .replace(/[_-]+/g, " ")
    .trim();
}

function toTitleCase(input: string): string {
  return input.replace(/\b\w/g, char => char.toUpperCase());
}
