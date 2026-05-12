import { Node, SourceFile, CallExpression, ObjectLiteralExpression } from "ts-morph";

/**
 * Removes `{ tags: [...] }` from describes that are
 * direct children of the Feature wrapper.
 */
export function liftAndRemoveTopLevelTagsAst(
  sourceFile: SourceFile,
): { changed: boolean } {
  const featureDescribe = findFeatureDescribe(sourceFile);
  if (!featureDescribe) {
    return { changed: false };
  }

  let changed = false;

  const featureCallback = getDescribeCallback(featureDescribe);
  if (!featureCallback) {
    return { changed: false };
  }

  const statements = featureCallback.getStatements();

  for (const stmt of statements) {
    if (!Node.isExpressionStatement(stmt)) continue;

    const expr = stmt.getExpression();
    if (!Node.isCallExpression(expr)) continue;

    if (!isDescribeCall(expr)) continue;

    const removed = removeTagsArgument(expr);
    if (removed) {
      changed = true;
    }
  }

  return { changed };
}

/* ────────────────────────────────────────────────────────── */
/* Helpers                                                   */
/* ────────────────────────────────────────────────────────── */

function findFeatureDescribe(sourceFile: SourceFile): CallExpression | undefined {
  for (const stmt of sourceFile.getStatements()) {
    if (!Node.isExpressionStatement(stmt)) continue;
    const expr = stmt.getExpression();
    if (Node.isCallExpression(expr) && isDescribeCall(expr)) {
      const title = getDescribeTitle(expr);
      if (title?.startsWith("Feature:")) {
        return expr;
      }
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

function getDescribeCallback(call: CallExpression) {
  return call.getArguments().find(arg =>
    Node.isArrowFunction(arg) || Node.isFunctionExpression(arg)
  );
}

function removeTagsArgument(call: CallExpression): boolean {
  const args = call.getArguments();

  if (args.length < 2) return false;
  if (!Node.isObjectLiteralExpression(args[1])) return false;

  const optionsObject = args[1] as ObjectLiteralExpression;
  const tagsProp = optionsObject.getProperty("tags");

  if (!tagsProp) {
    return false;
  }

  // Remove tags property only
  tagsProp.remove();

  // If the object is now empty, remove the entire options argument
  if (optionsObject.getProperties().length === 0) {
    call.removeArgument(1);
  }

  return true;
}
