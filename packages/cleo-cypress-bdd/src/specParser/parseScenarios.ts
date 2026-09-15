import { Node, CallExpression } from "ts-morph";
import { SyntaxKind } from "ts-morph";
import type { ScenarioNode } from "./types.js";
import { getDescribeTitle } from "./ast/getDescribeTitle.js";
import { getLocation } from "./ast/getLocation.js";
import { parseWhens } from "./parseWhens.js";

/**
 * Parses GIVEN scenarios that are direct children of a Feature describe.
 *
 * Expected structure:
 *
 * describe("Feature: ...", () => {
 *   describe("GIVEN ...", () => {
 *     context("WHEN ...", () => {});
 *   });
 * });
 */
export function parseScenarios(
  featureCall: CallExpression,
  filePath: string,
): ScenarioNode[] {
  const callback =
    featureCall.getArguments().find(Node.isArrowFunction) ??
    featureCall.getArguments().find(Node.isFunctionExpression);

  if (!callback) {
    return [];
  }

  const body = callback.getBody();
  if (!Node.isBlock(body)) {
    return [];
  }

  const scenarios: ScenarioNode[] = [];

  const statements = body.getStatements();

for (const stmt of statements) {
  if (!Node.isExpressionStatement(stmt)) continue;

  const expr = stmt.getExpression();
  if (!Node.isCallExpression(expr)) continue;

  if (!isDescribeCall(expr)) continue;

  const title = getDescribeTitle(expr);
  if (!startsWithGiven(title)) continue;

  const whenNodes = parseWhens(expr, filePath);

  scenarios.push({
    given: stripGivenPrefix(title),
whens: whenNodes,

    tags: [],
    location: getLocation(expr, filePath),
  });
}



  return scenarios;
}

/* ───────────────────────────────────────────── */
/* Helpers                                      */
/* ───────────────────────────────────────────── */
function isDirectOrNestedUnderFeature(
  node: CallExpression,
  featureCall: CallExpression
): boolean {
  let parent = node.getParent();

  while (parent) {
    if (parent === featureCall) return true;
    parent = parent.getParent();
  }

  return false;
}

function isDescribeCall(call: CallExpression): boolean {
  const expression = call.getExpression();

  if (!Node.isIdentifier(expression)) return false;

  const name = expression.getText();

  return name === "describe" || name === "context";
}

function startsWithGiven(title: string): boolean {
  const t = title.trim().toLowerCase();
  return t.startsWith("given");
}

function stripGivenPrefix(title: string): string {
  return title.replace(/^given\b\s*/i, "").trim();
}