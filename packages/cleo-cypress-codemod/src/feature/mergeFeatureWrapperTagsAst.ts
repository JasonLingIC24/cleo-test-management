import {
  Node,
  SourceFile,
  CallExpression,
  ObjectLiteralExpression,
  ArrayLiteralExpression,
} from "ts-morph";

/**
 * Merge the provided tags into the Feature wrapper's `{ tags: [...] }` object.
 *
 * - Creates a tags object if missing
 * - Merges and deduplicates tags
 * - Idempotent: no-op if already correct
 */
export function mergeFeatureWrapperTagsAst(
  sourceFile: SourceFile,
  finalTags: string[],
): { changed: boolean } {
  const featureDescribe = findFeatureDescribe(sourceFile);
  if (!featureDescribe) {
    return { changed: false };
  }

  const args = featureDescribe.getArguments();

  // Feature wrapper signature is:
  // describe("Feature: X", [options], callback)

  const optionsArg = args.find(Node.isObjectLiteralExpression);
  const callbackArg = args.find(
    arg => Node.isArrowFunction(arg) || Node.isFunctionExpression(arg),
  );

  if (!callbackArg) {
    // Malformed describe, do not touch
    return { changed: false };
  }

  let changed = false;

  if (!optionsArg) {
    // No options object — create one
    featureDescribe.insertArgument(
      1,
      buildOptionsObject(finalTags),
    );
    return { changed: true };
  }

  changed = mergeTagsIntoOptions(optionsArg, finalTags);

  return { changed };
}

/* ────────────────────────────────────────────────────────── */
/* Helpers                                                   */
/* ────────────────────────────────────────────────────────── */

function findFeatureDescribe(sourceFile: SourceFile): CallExpression | undefined {
  for (const stmt of sourceFile.getStatements()) {
    if (!Node.isExpressionStatement(stmt)) continue;

    const expr = stmt.getExpression();
    if (!Node.isCallExpression(expr)) continue;

    if (!isDescribeCall(expr)) continue;

    const title = getDescribeTitle(expr);
    if (title?.startsWith("Feature:")) {
      return expr;
    }
  }
  return undefined;
}

function isDescribeCall(call: CallExpression): boolean {
  const callee = call.getExpression();
  return Node.isIdentifier(callee) && callee.getText() === "describe";
}

function getDescribeTitle(call: CallExpression): string | undefined {
  const arg = call.getArguments()[0];
  if (
    Node.isStringLiteral(arg) ||
    Node.isNoSubstitutionTemplateLiteral(arg)
  ) {
    return arg.getLiteralText();
  }
  return undefined;
}

function mergeTagsIntoOptions(
  optionsObject: ObjectLiteralExpression,
  finalTags: string[],
): boolean {
  const existingTagsProp = optionsObject.getProperty("tags");

  if (!existingTagsProp) {
    optionsObject.addProperty(
      buildTagsProperty(finalTags),
    );
    return true;
  }

  if (!Node.isPropertyAssignment(existingTagsProp)) {
    return false;
  }

  const initializer = existingTagsProp.getInitializer();
  if (!initializer || !Node.isArrayLiteralExpression(initializer)) {
    return false;
  }

  const existing = initializer.getElements()
    .filter(Node.isStringLiteral)
    .map(el => el.getLiteralText());

  const merged = dedupe([...existing, ...finalTags]);

  if (arraysEqual(existing, merged)) {
    return false;
  }

  initializer.replaceWithText(buildArrayLiteral(merged));
  return true;
}

function buildOptionsObject(tags: string[]): string {
  return `{ tags: ${buildArrayLiteral(tags)} }`;
}

function buildTagsProperty(tags: string[]): string {
  return `tags: ${buildArrayLiteral(tags)}`;
}

function buildArrayLiteral(values: string[]): string {
  return `[\n${values.map(v => `  "${v}"`).join(",\n")}\n]`;
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}