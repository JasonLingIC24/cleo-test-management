export function buildBaseName(config: any): string {
  const safeProduct = config.product.name
    .replace(/\s+/g, "-")
    .toLowerCase();

  return `${safeProduct}-${config.release.version}`;
}

export function buildFileName(config: any, suffix: string) {
  const base = buildBaseName(config);
  return `${base}-${suffix}`;
}