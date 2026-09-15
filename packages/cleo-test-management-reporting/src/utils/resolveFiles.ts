import fs from "fs";
import path from "path";

/**
 * Resolve spec files from a file or directory
 */
export function resolveFiles(inputPath: string): string[] {
  if (!inputPath) {
    throw new Error("resolveFiles: inputPath was undefined");
  }

  const resolved = path.resolve(inputPath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Path does not exist: ${resolved}`);
  }

  const stat = fs.statSync(resolved);

  // ✅ Single file
  if (stat.isFile()) {
    if (isSpecFile(resolved)) {
      return [resolved];
    } else {
      return [];
    }
  }

  // ✅ Directory
  return walkDirectory(resolved);
}

/* ============================================================
   RECURSIVE DIRECTORY WALK
============================================================ */

function walkDirectory(dir: string): string[] {
  const results: string[] = [];

  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    // ✅ ignore hidden/system folders
    if (entry.startsWith(".")) continue;

    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...walkDirectory(fullPath));
    } else if (isSpecFile(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

/* ============================================================
   FILE FILTER
============================================================ */

function isSpecFile(filePath: string): boolean {
  return /\.(spec|cy)\.[tj]s$/.test(filePath);
}

