import {
  Node,
  CallExpression,
  SyntaxKind,
  BinaryExpression,
} from "ts-morph";

/**
 * Extracts the title string from a describe/context/it call.
 * Handles:
 *  - "string"
 *  - `template`
 *  - `template with ${vars}`
 *  - "string" + "string" (critical case)
 */

export function getDescribeTitle(call: CallExpression): string {
  const arg = call.getArguments()[0];
  if (!arg) return "";

  // ✅ simple string
  if (Node.isStringLiteral(arg) || Node.isNoSubstitutionTemplateLiteral(arg)) {
    return arg.getLiteralText();
  }

  // ✅ template string
  if (Node.isTemplateExpression(arg)) {
    let result = "";

    // head
    result += arg.getHead().getText().replace(/^`|`$/g, "");

    // spans
    for (const span of arg.getTemplateSpans()) {
      const exprText = span.getExpression().getText();

// ✅ ALWAYS use raw expression text (no wrapping)

      exprText.replace(/^\$\{|\}$/g, "");



result += "${" + exprText.replace(/^\$\{|\}$/g, "") + "}";
    }

    return result;
  }

  // fallback
  return arg.getText().replace(/^['"`]|['"`]$/g, "");
}

/* ───────────────────────────────────────────── */
/* Helpers                                      */
/* ───────────────────────────────────────────── */

/**
 * Flattens a binary expression like:
 * "GIVEN ..." + " and ..."
 */
function flattenBinaryExpression(node: BinaryExpression): string {
  const left = node.getLeft();
  const right = node.getRight();

  return (
    extractText(left) +
    extractText(right)
  );
}

/**
 * Extracts text from different node types
 */
function extractText(node: Node): string {
  if (Node.isStringLiteral(node)) {
    return node.getLiteralText();
  }

  if (Node.isNoSubstitutionTemplateLiteral(node)) {
    return node.getLiteralText();
  }

  if (Node.isTemplateExpression(node)) {
    return flattenTemplateExpression(node);
  }

  if (Node.isBinaryExpression(node)) {
    return flattenBinaryExpression(node);
  }

  // Ignore non-string content (like variables)
  return "";
}

/**
 * Flattens template expressions:
 * `GIVEN user has ${n} items`
 * → "GIVEN user has  items"
 */
function flattenTemplateExpression(node: any): string {
  let result = node.getHead().getLiteralText();

  for (const span of node.getTemplateSpans()) {
    result += span.getLiteral().getLiteralText();
  }

  return result;
}
