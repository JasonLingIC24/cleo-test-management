// src/specParser/ast/getTopLevelDescribes.ts

import { Node, CallExpression, SourceFile } from "ts-morph";

/**
 * Returns all top-level describe(...) calls in a source file.
 *
 * Top-level means:
 * - direct children of the SourceFile
 * - not nested inside other describes, blocks, or functions
 */
export function getTopLevelDescribes(
  sourceFile: SourceFile,
): CallExpression[] {
  const describes: CallExpression[] = [];

  for (const stmt of sourceFile.getStatements()) {
    if (!Node.isExpressionStatement(stmt)) continue;

    const expr = stmt.getExpression();
    if (!Node.isCallExpression(expr)) continue;

    if (isDescribeCall(expr)) {
      describes.push(expr);
    }
  }

  return describes;
}

function isDescribeCall(call: CallExpression): boolean {
  const expr = call.getExpression();
  return Node.isIdentifier(expr) && expr.getText() === "describe";
}