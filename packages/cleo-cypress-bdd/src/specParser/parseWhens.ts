import { Node, CallExpression } from "ts-morph";
import { SyntaxKind } from "ts-morph";
import type { ScenarioReport } from "./parseThens.js";

import type { SourceLocation } from "./types.js";
import { getDescribeTitle } from "./ast/getDescribeTitle.js";
import { getLocation } from "./ast/getLocation.js";
import { parseThens } from "./parseThens.js";

export interface WhenNode {
  description: string;
  scenarios: ScenarioReport[];
  location: SourceLocation;
}

/**
 * Parses WHEN blocks that are direct children of a GIVEN describe.
 *
 * Expected shape:
 *
 * describe("GIVEN ...", () => {
 *   context("WHEN ...", () => {
 *     it("THEN ...");
 *   });
 * });
 */
export function parseWhens(
  givenCall: CallExpression,
  filePath: string,
): WhenNode[] {

  const whens: WhenNode[] = [];

  // ✅ Traverse FROM the givenCall node, not just its body
  const callExpressions =
    givenCall.getDescendantsOfKind(SyntaxKind.CallExpression);

  for (const expression of callExpressions) {
    if (!Node.isCallExpression(expression)) continue;

    if (!isWhenBlock(expression)) continue;

    const title = getDescribeTitle(expression);
    if (!startsWithWhen(title)) continue;

    // ✅ Ensure this WHEN belongs to THIS GIVEN (correct containment)
    if (!isInsideGiven(expression, givenCall)) continue;

    whens.push({
      description: stripWhenPrefix(title),
      scenarios: parseThens(expression, filePath),
      location: getLocation(expression, filePath),
    });
  }

  return mergeWhenChain(whens);
}

/* ───────────────────────────────────────────── */
/* Helpers                                      */
/* ───────────────────────────────────────────── */


function isInsideGiven(
  node: CallExpression,
  givenCall: CallExpression
): boolean {
  let parent = node.getParent();

  while (parent) {
    if (parent === givenCall) return true;
    parent = parent.getParent();
  }

  return false;
}

function isWhenBlock(call: CallExpression): boolean {
  const expr = call.getExpression();

  if (!Node.isIdentifier(expr)) {
    return false;
  }

  const name = expr.getText();

  return name === "context" || name === "describe";
}

function startsWithWhen(title: string): boolean {
  const t = title.trim().toLowerCase();

  return t.startsWith("when") || t.startsWith("and when");
}

function stripWhenPrefix(title: string): string {
  return title
    .trim()
    .replace(/^(when|and when)\s*/i, "");
}

function mergeWhenChain(whens: WhenNode[]): WhenNode[] {
  if (whens.length <= 1) return whens;

  const merged: WhenNode[] = [];

  let current = whens[0];

  for (let i = 1; i < whens.length; i++) {
    const next = whens[i];

    const isAndWhen = next.description.trim().toLowerCase().startsWith("and");

    if (isAndWhen) {
current = {
  ...current,
  description: `${current.description} → ${next.description}`,
  scenarios: [...current.scenarios, ...next.scenarios],
};
    } else {
      merged.push(current);
      current = next;
    }
  }

  merged.push(current);

  return merged;
}
