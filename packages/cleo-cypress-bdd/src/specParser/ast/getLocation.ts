// src/specParser/ast/getLocation.ts// src/specParser/ 
import { CallExpression } from "ts-morph";
import type { SourceLocation } from "../types.js";

export function getLocation(
  call: CallExpression,
  filePath: string,
): SourceLocation {
  const sourceFile = call.getSourceFile();
  const pos = sourceFile.getLineAndColumnAtPos(
    call.getStart(),
  );

  return {
    filePath,
    line: pos.line,
    column: pos.column,
  };
}

