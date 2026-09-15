import { Node, CallExpression, SyntaxKind } from "ts-morph";
import { cleanText } from "cleo-domain";
import type { SourceLocation } from "./types.js";
import { getDescribeTitle } from "./ast/getDescribeTitle.js";
import { getTagsFromDescribe } from "./ast/getTagsFromDescribe.js";
import { getLocation } from "./ast/getLocation.js";

export interface ThenNode {
  description: string;
  tags: string[];
  location: SourceLocation;
  tcId?: string;   // ✅ ADD
}
export interface ScenarioReport {
  title: string;
  steps: ThenNode[];
}
/**
 * Parses THEN / AND assertions inside a WHEN block.
 */
export function parseThens(
  whenCall: CallExpression,
  filePath: string,
): ScenarioReport[] {

  const scenarios: Record<string, ThenNode[]> = {};

  const callExpressions = whenCall.getDescendantsOfKind(
    SyntaxKind.CallExpression,
  );

  for (const call of callExpressions) {
    if (!Node.isCallExpression(call)) continue;

    // ✅ Only process `it(...)`
    if (!isExactItCall(call)) continue;

    const title = getDescribeTitle(call);
    const tcId = extractTcIdFromTitle(title);

    // console.log("🔥 RAW TITLE:", title);
    // console.log("🧪 TC ID EXTRACTED:", tcId);

    // ✅ Ensure this belongs to THIS WHEN block
    if (!isInsideWhen(call, whenCall)) continue;


    const scenarioTitle = getScenarioTitle(call, whenCall);

    if (!scenarios[scenarioTitle]) {
      scenarios[scenarioTitle] = [];
    }

    scenarios[scenarioTitle].push({
      description: cleanText(title),
      tags: getTagsFromDescribe(call),
      location: getLocation(call, filePath),
      tcId,
    });
  }
    return Object.entries(scenarios).map(([title, steps]) => ({
  title: cleanText(title),
      steps,
    }));
  }
  /* ───────────────────────────────────────────── */
  /* Helpers                                      */
  /* ───────────────────────────────────────────── */

  function getScenarioTitle(
    call: CallExpression,
    whenCall: CallExpression
  ): string {

    let parent = call.getParent();

    while (parent) {
      if (
        Node.isCallExpression(parent) &&
        Node.isIdentifier(parent.getExpression()) &&
        parent.getExpression().getText() === "context"
      ) {
        const title = getDescribeTitle(parent);

        if (title.toLowerCase().startsWith("when")) {
          return title.replace(/^when\s+/i, "").trim();
        }
      }

      if (parent === whenCall) break;

      parent = parent.getParent();
    }

    return "Default Scenario";
  }



function isExactItCall(call: CallExpression): boolean {
  const expr = call.getExpression();

  return Node.isIdentifier(expr) && expr.getText() === "it";
}


/**
 * Checks whether a node is inside the given WHEN context
 */
function isInsideWhen(
  node: CallExpression,
  whenCall: CallExpression,
): boolean {
  let parent = node.getParent();

  while (parent) {
    if (parent === whenCall) return true;
    parent = parent.getParent();
  }

  return false;
}

function extractTcIdFromTitle(title: string): string | undefined {
  const match = title.match(/\[([A-Z]+-[A-Z]+-TC-\d+)\]/);
  return match ? match[1] : undefined;
}
