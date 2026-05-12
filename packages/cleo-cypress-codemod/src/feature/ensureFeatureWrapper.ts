import { CallExpression, Node, SourceFile } from "ts-morph";
import { getTopLevelDescribes } from "../ast/getTopLevelDescribes.js";
import { ensureFeatureWrapperAst } from "./ensureFeatureWrapperAst.js";
import { deriveFeatureNameFromDescribe } from "./deriveFeatureNameFromDescribe.js";
import { deriveFeatureNameFromFile } from "./deriveFeatureNameFromFile.js";

/**
 * High-level orchestration for ensuring a Feature wrapper exists.
 *
 * Responsibilities:
 * - Inspect top-level describes
 * - Extract original top-level tags (for reporting)
 * - Derive the final Feature name
 * - Delegate all AST mutations to ensureFeatureWrapperAst
 *
 * This function performs NO direct AST mutations itself.
 */
export function ensureFeatureWrapper(params: {
  sourceFile: SourceFile;
  filePath: string;
  featureTags: string[];
}): {
  changed: boolean;
  featureName: string;
  originalTopLevelTags: string[];
} {
  const { sourceFile, filePath, featureTags } = params;

  const topLevelDescribes = getTopLevelDescribes(sourceFile);

  // ─────────────────────────────────────────────
  // Extract existing top-level tags for reporting
  // ─────────────────────────────────────────────

  const originalTopLevelTags: string[] = [];

  for (const describeCall of topLevelDescribes) {
    originalTopLevelTags.push(
      ...extractTagsFromDescribe(describeCall),
    );
  }

  // ─────────────────────────────────────────────
  // Resolve final Feature name
  // ─────────────────────────────────────────────

  const featureName = resolveFeatureName(
    filePath,
    topLevelDescribes,
  );

  // ─────────────────────────────────────────────
  // Delegate AST mutation
  // ─────────────────────────────────────────────

  const { changed } = ensureFeatureWrapperAst(
    sourceFile,
    featureName,
    featureTags,
  );

  return {
    changed,
    featureName,
    originalTopLevelTags,
  };
}

/* ───────────────────────────────────────────── */
/* Feature name resolution                      */
/* ───────────────────────────────────────────── */

function resolveFeatureName(
  filePath: string,
  describes: CallExpression[],
): string {
  if (describes.length > 0) {
    const firstTitle = getDescribeTitle(describes[0]);

    // GIVEN-first specs auto-derive feature name
    if (startsWithGiven(firstTitle)) {
      return deriveFeatureNameFromDescribe(firstTitle);
    }
  }

  // Fallback to filename-based feature name
  return deriveFeatureNameFromFile(filePath);
}

/* ───────────────────────────────────────────── */
/* Helpers                                      */
/* ───────────────────────────────────────────── */

function getDescribeTitle(call: CallExpression): string {
  const arg = call.getArguments()[0];
  return Node.isStringLiteral(arg) ? arg.getLiteralText() : "";
}

function extractTagsFromDescribe(
  call: CallExpression,
): string[] {
  const args = call.getArguments();

  if (
    args.length === 3 &&
    Node.isObjectLiteralExpression(args[1])
  ) {
    const tagsProp = args[1].getProperty("tags");

    if (
      tagsProp &&
      Node.isPropertyAssignment(tagsProp)
    ) {
      const initializer = tagsProp.getInitializer();
      if (
        initializer &&
        Node.isArrayLiteralExpression(initializer)
      ) {
        return initializer
          .getElements()
          .filter(Node.isStringLiteral)
          .map(el => el.getLiteralText());
      }
    }
  }

  return [];
}

function startsWithGiven(title: string): boolean {
  return /^given\b/i.test(title);
}