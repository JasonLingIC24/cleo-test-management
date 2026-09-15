import path from "path";

/**
 * Derive domain and subdomain tags from a file path.
 *
 * Rules:
 * - Only directories contribute to domain/subdomain
 * - The filename is ignored
 * - domain    = first directory under domainRoot
 * - subdomain = second directory under domainRoot (if present)
 */
export function deriveDomainTags(
  filePath: string,
  domainRoot: string,
): string[] {
  const absoluteFilePath = path.resolve(filePath);
  const absoluteDomainRoot = path.resolve(domainRoot);

  // Directory containing the file
  const fileDir = path.dirname(absoluteFilePath);

  if (!fileDir.startsWith(absoluteDomainRoot)) {
    return [];
  }

  const relativeDir = path
    .relative(absoluteDomainRoot, fileDir)
    .replace(/\\/g, "/");

  const segments = relativeDir.split("/").filter(Boolean);

  const tags: string[] = [];

  if (segments.length >= 1) {
    tags.push(`@domain:${normalizeSegment(segments[0])}`);
  }

  if (segments.length >= 2) {
    tags.push(`@subdomain:${normalizeSegment(segments[1])}`);
  }

  return tags;
}

/* ───────────────────────────────────────── */

function normalizeSegment(segment: string): string {
  return segment.toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");
}
