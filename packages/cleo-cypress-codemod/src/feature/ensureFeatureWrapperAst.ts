import {
  Node,
  SourceFile,
  CallExpression,
  Statement,
} from "ts-morph";

import { getTopLevelDescribes } from "../ast/getTopLevelDescribes.js";
import { deriveFeatureNameFromDescribe } from "./deriveFeatureNameFromDescribe.js";

/**
 * Ensure a canonical Feature wrapper exists.
 */
export function ensureFeatureWrapperAst(
  sourceFile: SourceFile,
  fallbackFeatureName: string,
  featureTags: string[],
): { changed: boolean } {
  const describes = getTopLevelDescribes(sourceFile);
  if (describes.length === 0) {
    return { changed: false };
  }

  const firstDescribe = describes[0];
  const firstTitle = getDescribeTitle(firstDescribe);

  // GIVEN-first → external Feature wrapper
  if (startsWithGiven(firstTitle)) {
    const derivedName =
      deriveFeatureNameFromDescribe(firstTitle);

    return wrapTestsWithFeature(
      sourceFile,
      derivedName,
      featureTags,
    );
  }

  // Single top-level describe → Feature / implicit Feature
  if (describes.length === 1) {
    const featureName = startsWithFeature(firstTitle)
      ? stripFeaturePrefix(firstTitle)
      : normalizeImplicitFeatureTitle(firstTitle);

    return upgradeExistingDescribe(
      firstDescribe,
      featureName,
      featureTags,
    );
  }

  // Multiple top-level describes → external wrapper
  return wrapTestsWithFeature(
    sourceFile,
    fallbackFeatureName,
    featureTags,
  );
}

/* ───────────────────────────────────────────── */
/* Upgrade existing or implicit Feature          */
/* ───────────────────────────────────────────── */

function upgradeExistingDescribe(
  describeCall: CallExpression,
  featureName: string,
  featureTags: string[],
): { changed: boolean } {
  const args = describeCall.getArguments();
  const titleArg = args[0];

  if (
    Node.isStringLiteral(titleArg) ||
    Node.isNoSubstitutionTemplateLiteral(titleArg)
  ) {
    titleArg.replaceWithText(`"Feature: ${featureName}"`);
  }

  if (args.length === 3 && Node.isObjectLiteralExpression(args[1])) {
    const options = args[1];
    const tagsProp = options.getProperty("tags");

    if (tagsProp && Node.isPropertyAssignment(tagsProp)) {
      const init = tagsProp.getInitializer();
      if (init && Node.isArrayLiteralExpression(init)) {
        const existing = init
          .getElements()
          .filter(Node.isStringLiteral)
          .map(el => el.getLiteralText());

        const merged = dedupe([
          ...existing,
          ...featureTags,
        ]);

        init.replaceWithText(
          `[${merged.map(t => `"${t}"`).join(", ")}]`,
        );

        return { changed: true };
      }
    }

    options.addPropertyAssignment({
      name: "tags",
      initializer: JSON.stringify(featureTags, null, 2),
    });

    return { changed: true };
  }

  describeCall.insertArgument(
    1,
    `{ tags: ${JSON.stringify(featureTags, null, 2)} }`,
  );

  return { changed: true };
}

/* ───────────────────────────────────────────── */
/* External Feature wrapper (safe placement)     */
/* ───────────────────────────────────────────── */

function wrapTestsWithFeature(
  sourceFile: SourceFile,
  featureName: string,
  featureTags: string[],
): { changed: boolean } {
  const statements = sourceFile.getStatements();

  const globals: Statement[] = [];
  const tests: Statement[] = [];

  for (const stmt of statements) {
    if (
      Node.isImportDeclaration(stmt) ||
      Node.isVariableStatement(stmt) ||
      Node.isFunctionDeclaration(stmt) ||
      Node.isClassDeclaration(stmt) ||
      Node.isEnumDeclaration(stmt) ||
      Node.isTypeAliasDeclaration(stmt) ||
      Node.isInterfaceDeclaration(stmt)
    ) {
      globals.push(stmt);
      continue;
    }

    if (
      Node.isExpressionStatement(stmt) &&
      Node.isCallExpression(stmt.getExpression())
    ) {
      tests.push(stmt);
      continue;
    }

    globals.push(stmt);
  }

  if (tests.length === 0) {
    return { changed: false };
  }

  const upliftedTags: string[] = [];

  for (const stmt of tests) {
    if (!Node.isExpressionStatement(stmt)) continue;

    const expr = stmt.getExpression();
    if (!Node.isCallExpression(expr)) continue;

    upliftedTags.push(...extractAndStripTags(expr));
  }

  const allTags = dedupe([...upliftedTags, ...featureTags]);

  const testBody = tests.map(s => s.getText()).join("\n\n");

  for (const stmt of tests) {
    stmt.remove();
  }

  sourceFile.insertStatements(
    globals.length,
    buildFeatureWrapper(featureName, allTags, testBody),
  );

  return { changed: true };
}

/* ───────────────────────────────────────────── */
/* Helpers                                      */
/* ───────────────────────────────────────────── */

function extractAndStripTags(call: CallExpression): string[] {
  const args = call.getArguments();

  if (
    args.length === 3 &&
    Node.isObjectLiteralExpression(args[1])
  ) {
    const prop = args[1].getProperty("tags");
    if (prop && Node.isPropertyAssignment(prop)) {
      const init = prop.getInitializer();
      if (init && Node.isArrayLiteralExpression(init)) {
        const tags = init
          .getElements()
          .filter(Node.isStringLiteral)
          .map(e => e.getLiteralText());

        call.removeArgument(1);
        return tags;
      }
    }
  }

  return [];
}

function getDescribeTitle(call: CallExpression): string {
  const arg = call.getArguments()[0];
  if (
    Node.isStringLiteral(arg) ||
    Node.isNoSubstitutionTemplateLiteral(arg)
  ) {
    return arg.getLiteralText();
  }
  return "";
}

function startsWithGiven(title: string): boolean {
  return /^given\b/i.test(title);
}

function startsWithFeature(title: string): boolean {
  return /^feature:/i.test(title);
}

function stripFeaturePrefix(title: string): string {
  return title.replace(/^feature:\s*/i, "").trim();
}

function normalizeImplicitFeatureTitle(title: string): string {
  const t = title.trim();
  const idx = t.indexOf(" - ");
  return idx !== -1 ? t.slice(idx + 3).trim() : t;
}

function buildFeatureWrapper(
  featureName: string,
  tags: string[],
  body: string,
): string {
  const tagArg =
    tags.length > 0
      ? `, { tags: ${JSON.stringify(tags, null, 2)} }`
      : "";

  return `
describe("Feature: ${featureName}"${tagArg}, () => {
${indent(body, 2)}
});
`.trim();
}

function indent(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map(l => (l.trim() ? pad + l : l))
    .join("\n");
}

function dedupe(tags: string[]): string[] {
  return Array.from(new Set(tags));
}

