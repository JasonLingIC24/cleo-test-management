/**
 * Canonical codemod output model.
 *
 * This file defines the ONLY valid shape of codemod output.
 * The CLI, specParser, CI checks, and future reporting tools
 * MUST rely on these definitions.
 */

/* ───────────────────────────────────────────── */
/* Top-level result                              */
/* ───────────────────────────────────────────── */

export interface CodemodResult {
  metadata: CodemodMetadata;
  summary: CodemodSummary;
  files: CodemodFileReport[];
}

/* ───────────────────────────────────────────── */
/* Metadata                                     */
/* ───────────────────────────────────────────── */

export interface CodemodMetadata {
  tool: "cleo-cypress-codemod";
  version: string;
  runAt: string; // ISO string
  domainRoot: string;
  dryRun: boolean;
  mappingConfigUsed: boolean;
}

/* ───────────────────────────────────────────── */
/* Summary                                      */
/* ───────────────────────────────────────────── */

export interface CodemodSummary {
  filesScanned: number;
  filesChanged: number;

  featuresCreated: number;
  tagsLifted: number;

  domainTagsAdded: number;
  subdomainTagsAdded: number;

  warnings: number;
}

/* ───────────────────────────────────────────── */
/* Per-file report                              */
/* ───────────────────────────────────────────── */

export interface CodemodFileReport {
  filePath: string;
  
  source: {
    original: string;
    transformed: string;
  };

  before: {
    hadFeatureWrapper: boolean;
    topLevelTags: string[];
  };

  after: {
    hasFeatureWrapper: boolean;
    featureName: string;
    featureTags: string[];
  };

  derivation: {
    domain?: string;
    subdomain?: string;
    source: "mapping" | "directory" | "none";
  };

  changes: {
    featureWrapperAdded: boolean;
    tagsLifted: boolean;
    domainTagAdded: boolean;
    subdomainTagAdded: boolean;
  };

  diagnostics: CodemodDiagnostic[];
}

/* ───────────────────────────────────────────── */
/* Diagnostics                                  */
/* ───────────────────────────────────────────── */

export interface CodemodDiagnostic {
  level: "info" | "warning" | "error";
  message: string;
}