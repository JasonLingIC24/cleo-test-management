export function filterReleaseNoteBullets(bullets: string[]): string[] {
  const ignoredPatterns = [
    "swagger",
    "config",
    "lambda",
    "script",
    "endpoint",
    "types",
    "review",
    "copilot",
    "prettier",
    "mock",
    "variable",
    "regenerate",
    "missing file",
    "conflict",
    "conflit",
  ];

  const filtered = bullets.filter((bullet) => {
    const lower = bullet.toLowerCase();

    return !ignoredPatterns.some((pattern) => lower.includes(pattern));
  });

  const normalised = filtered.map(normaliseStakeholderBullet);

  return [...new Set(normalised)];
}

function normaliseStakeholderBullet(bullet: string): string {
  const lower = bullet.toLowerCase();

  // GP Practice
  if (lower.includes("gp practice")) {
    return "Added GP Practice capture and persistence.";
  }

  // Postcode
  if (lower.includes("postcode")) {
    return "Added postcode address lookup support.";
  }

  // PDS
  if (lower.includes("pds")) {
    return "Added PDS status indicators within patient search.";
  }

  // Address handling
  if (lower.includes("address")) {
    return "Improved patient address handling.";
  }

  // Pathways launch
  if (lower.includes("pathways") && lower.includes("launch")) {
    return "Added NHS Pathways launch capability.";
  }

  // Pathways outcome
  if (lower.includes("pathways") && lower.includes("outcome")) {
    return "Added NHS Pathways outcome capture.";
  }

  // PEM
  if (lower.includes("pem")) {
    return "Enhanced Patient Event Messaging functionality.";
  }

  return bullet;
}
