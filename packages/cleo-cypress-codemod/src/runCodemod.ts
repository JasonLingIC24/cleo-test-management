import fs from "fs";
import path from "path";
import { Project, SyntaxKind, Node } from "ts-morph";

import { ensureFeatureWrapper } from "./feature/ensureFeatureWrapper.js";
import { deriveDomainTags } from "./tags/deriveDomainTags.js";
import type { CodemodOptions } from "./types/options.js";
import type {
  CodemodResult,
  CodemodFileReport,
} from "./types/report.js";
import { validateNoNestedTagsAst } from "./feature/validateNoNestedTagsAst.js";


const TOOL_NAME = "cleo-cypress-codemod";
const VERSION = "0.1.0";

/**
 * Executes the Cypress codemod.
 *
 * - Reads input files
 * - Applies AST transforms in memory
 * - Derives domain/subdomain tags
 * - Returns a canonical CodemodResult
 *
 * IMPORTANT:
 * This function NEVER writes files to disk.
 * All side effects belong in the CLI layer.
 */
export async function runCodemod(
  filePaths: string[],
  options: CodemodOptions,
): Promise<CodemodResult> {
  const project = new Project({
    useInMemoryFileSystem: true,
  });

  const files: CodemodFileReport[] = [];

  let featuresCreated = 0;
  let tagsLifted = 0;
  let domainTagsAdded = 0;
  let subdomainTagsAdded = 0;
  const nestedTagViolations: string[] = [];

  for (const filePath of filePaths) {


    const originalSource = fs.readFileSync(filePath, "utf8");

    const sourceFile = project.createSourceFile(
      path.resolve(filePath),
      originalSource,
      { overwrite: true },
    );

    let warnings: string[] = [];
    let violations: string[] = [];

const validation = validateNoNestedTagsAst(sourceFile);

warnings = validation.warnings || [];
violations = validation.violations || [];

if (options.failOnNestedTags) {


      if (validation.warnings?.length) {
        validation.warnings.forEach((w: string) => {
          console.warn(`⚠️ ${w}`);
        });
      }

      if (!validation.valid) {
        nestedTagViolations.push(
          `📄 ${filePath}\n` +
          validation.violations
            .map((v: string) => `   - ${v}`)
            .join("\n")
        );
      }

    }


    /* ─────────────────────────────────────────────
     * Domain / subdomain tags (taxonomy)
     * ───────────────────────────────────────────── */

    const domainTags =
      options.addDomainTags
        ? deriveDomainTags(filePath, options.domainRoot)
        : [];

    const domain = extractTagValue(domainTags, "@domain:");
    const subdomain = extractTagValue(domainTags, "@subdomain:");

    if (domain) domainTagsAdded++;
    if (subdomain) subdomainTagsAdded++;

    /* ─────────────────────────────────────────────
     * Feature wrapper (AST transform)
     * ───────────────────────────────────────────── */

    const featureResult = ensureFeatureWrapper({
      sourceFile,
      filePath,
      featureTags: domainTags, // ✅ domain tags flow into AST
    });
    const cleanFeatureName = formatFeatureName(filePath);
    const describeCalls = sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression
    );

    for (const call of describeCalls) {
      const expr = call.getExpression();

      if (!Node.isIdentifier(expr)) continue;
      if (expr.getText() !== "describe") continue;

      const firstArg = call.getArguments()[0];

      if (!firstArg) continue;

      const newTitle = `"Feature: ${cleanFeatureName}"`;

      firstArg.replaceWithText(newTitle);

      break; // ✅ only top-level describe
    }

    if (featureResult.changed) {
      featuresCreated++;
    }

    tagsLifted += featureResult.originalTopLevelTags.length;

    /* ─────────────────────────────────────────────
     * Capture transformed output
     * ───────────────────────────────────────────── */
    const transformedSource = sourceFile.getFullText();

    files.push({
      filePath,

      source: {
        original: originalSource,
        transformed: transformedSource,
      },

      before: {
        hadFeatureWrapper: false,
        topLevelTags: featureResult.originalTopLevelTags,
      },

      after: {
        hasFeatureWrapper: true,
        featureName: featureResult.featureName,
        featureTags: [
          ...featureResult.originalTopLevelTags,
          ...domainTags,
        ],
      },

      derivation: {
        domain,
        subdomain,
        source: domainTags.length > 0 ? "directory" : "none",
      },

      changes: {
        featureWrapperAdded: featureResult.changed,
        tagsLifted: featureResult.originalTopLevelTags.length > 0,
        domainTagAdded: Boolean(domain),
        subdomainTagAdded: Boolean(subdomain),
      },
      diagnostics: [],
      warnings,
      violations,
    });
  }
  if (options.failOnNestedTags && nestedTagViolations.length > 0) {
    console.error("\n❌ Nested tag violations detected:\n");

    nestedTagViolations.forEach(v => {
      console.error(v);
      console.error("");
    });

    console.error(`❌ Total files with violations: ${nestedTagViolations.length}`);

    process.exit(1); // ✅ stop execution
  }
  return {
    metadata: {
      tool: TOOL_NAME,
      version: VERSION,
      runAt: new Date().toISOString(),
      domainRoot: options.domainRoot,
      dryRun: Boolean(options.dryRun),
      mappingConfigUsed: false,
    },

    summary: {
      filesScanned: filePaths.length,
      filesChanged: files.filter(f => f.changes.featureWrapperAdded).length,
      featuresCreated,
      tagsLifted,
      domainTagsAdded,
      subdomainTagsAdded,
      warnings: 0,
    },

    files,
  };
}

/* ───────────────────────────────────────────── */
/* Helpers                                      */
/* ───────────────────────────────────────────── */

function extractTagValue(
  tags: string[],
  prefix: string,
): string | undefined {
  const tag = tags.find(t => t.startsWith(prefix));
  return tag ? tag.slice(prefix.length) : undefined;
}

function formatFeatureName(filePath: string): string {
  const fileName = path.basename(filePath, path.extname(filePath));

  return fileName
    .replace(/\.spec$/, "")

    // ✅ split camelCase / PascalCase
    .replace(/([a-z])([A-Z])/g, "$1 $2")

    // ✅ replace separators with space
    .replace(/[-_.]/g, " ")

    // ✅ capitalize words
    .replace(/\b\w/g, (c) => c.toUpperCase())

    // ✅ fix common acronyms (optional but nice)
    .replace(/\bPds\b/g, "PDS")
    .replace(/\bLpi\b/g, "LPI")
    .replace(/\bNhs\b/g, "NHS")

    .trim();
}
