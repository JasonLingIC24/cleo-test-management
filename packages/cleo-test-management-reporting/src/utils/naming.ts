export function buildStandardName(options: {
  baseName: string;
  domain?: string;
  subdomain?: string;
  feature?: string;
  extension?: string;
}) {
  const {
    baseName,
    domain,
    subdomain,
    feature,
    extension = ".feature",
  } = options;

  const cleanDomain = safeName(domain);
  const cleanSubdomain = safeName(subdomain);
  const cleanFeature = safeName(feature);

  // ✅ build parts list safely
  const parts: string[] = [];

  if (cleanDomain) {
    parts.push(cleanDomain);
  }

  if (cleanSubdomain && cleanSubdomain !== cleanDomain) {
    parts.push(cleanSubdomain);
  }

  if (
    cleanFeature &&
    cleanFeature !== cleanDomain &&
    cleanFeature !== cleanSubdomain
  ) {
    parts.push(cleanFeature);
  }

  // ✅ final filename
  const name = [baseName, ...parts].filter(Boolean).join("-");

  return `${name}${extension}`;
}

function safeName(value?: string): string {
  if (!value) return "";

  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces → hyphen
    .replace(/-+/g, "-"); // collapse doubles
}
