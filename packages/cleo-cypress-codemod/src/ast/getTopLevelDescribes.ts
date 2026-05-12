import { Node, CallExpression, SourceFile } from "ts-morph";

/**
 * Extract all top-level `describe(...)` CallExpressions from a source file.
 *
 * A top-level describe is:
 * - an ExpressionStatement
 * - whose expression is a CallExpression
 * - whose callee identifier is named `describe`
 * - whose direct parent is the SourceFile
 */
export function getTopLevelDescribes(
  sourceFile: SourceFile,
): CallExpression[] {
  const results: CallExpression[] = [];

  sourceFile.forEachChild((child) => {
    if (!Node.isExpressionStatement(child)) return;

    const expression = child.getExpression();
    if (!Node.isCallExpression(expression)) return;

    const callee = expression.getExpression();
    if (!Node.isIdentifier(callee)) return;
    if (callee.getText() !== "describe") return;

    results.push(expression);
  });

  return results;
}
``