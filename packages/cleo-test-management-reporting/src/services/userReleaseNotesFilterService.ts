export function isUserFacingBullet(bullet: string): boolean {
  const lower = bullet.toLowerCase();

  const technicalTerms = [
    "api",
    "endpoint",
    "/api/",
    "payload",
    "json",
    "swagger",
    "request",
    "response",
    "refactor",
    "refactoring",
    "internal",
    "database",
    "migration",
    "schema",
    "unit test",
    "integration test",
    "mock",
    "types",
    "review",
    "copilot",
    "prettier",
    "conflict",
    "conflit",
  ];

  return !technicalTerms.some((x) => lower.includes(x));
}
