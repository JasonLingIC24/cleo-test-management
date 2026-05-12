/**
 * Configuration options for the Cypress codemod.
 *
 * This type is part of the public API and should remain backward-compatible.
 */
export interface CodemodOptions {
  /**
   * When true, ensures exactly one Feature wrapper exists per file.
   */
  ensureFeatureWrapper: boolean;

  /**
   * When true, moves `{ tags: [...] }` from former top-level describes
   * onto the Feature wrapper.
   */
  moveTopLevelTags: boolean;

  /**
   * When true, derive and add domain/subdomain tags from the file path.
   */
  addDomainTags: boolean;

  /**
   * Root directory used to derive domain and subdomain.
   *
   * Example:
   *   domainRoot = "cypress/e2e"
   *   file       = "cypress/e2e/patients/timeline/foo.spec.ts"
   *   → domain    = patients
   *   → subdomain = timeline
   */
  domainRoot: string;

  /**
   * When true, AST is updated in memory but files are not written.
   */
  dryRun?: boolean;
}