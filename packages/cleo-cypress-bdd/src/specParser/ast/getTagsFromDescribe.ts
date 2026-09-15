// src/specParser/ast/getTagsFromDescribe.ts

import { Node, CallExpression } from "ts-morph";

export function getTagsFromDescribe(
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
      const init = tagsProp.getInitializer();

      if (init && Node.isArrayLiteralExpression(init)) {
        return init
          .getElements()
          .filter(Node.isStringLiteral)
          .map(el => el.getLiteralText());
      }
    }
  }

  return [];
}