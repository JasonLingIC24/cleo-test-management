import fs from "fs";
import path from "path";

export function resolveFiles(inputPath: string): string[] {
  
  if (!inputPath) {
    throw new Error("resolveFiles: inputPath was undefined");
  }
  
  const resolved = path.resolve(inputPath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Path does not exist: ${inputPath}`);
  }

  if (fs.statSync(resolved).isFile()) {
    return [resolved];
  }

  return collectSpecFiles(resolved);
}

function collectSpecFiles(dir: string): string[] {
  const results: string[] = [];

  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...collectSpecFiles(fullPath));
    } else if (/\.(spec|cy)\.[tj]s$/.test(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}
