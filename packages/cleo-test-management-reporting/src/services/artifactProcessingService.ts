import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { JSDOM } from "jsdom";

export function extractZip(zipPath: string, outputPath: string): string | null {
  if (!fs.existsSync(zipPath)) {
    console.warn(`⚠️ ZIP not found: ${zipPath}`);
    return null;
  }

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(outputPath, true);

  return outputPath;
}

function findFileRecursive(baseDir: string, fileName: string): string | null {
  const entries = fs.readdirSync(baseDir);

  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isFile() && entry === fileName) {
      return fullPath;
    }

    if (stat.isDirectory()) {
      const found = findFileRecursive(fullPath, fileName);
      if (found) return found;
    }
  }

  return null;
}

// Frontend
export function processFrontendTestAssets(baseDir: string) {
  const zipPath = findLatestArtifact(baseDir, "frontend");
  if (!zipPath) return null;

  const extractDir = path.join(".tmp", "frontend");

  extractZip(zipPath, extractDir);

  const file = findFileRecursive(extractDir, "test-results.json");
  if (!file) return null;

  const raw = JSON.parse(fs.readFileSync(file, "utf8"));

  return {
    total: raw.numTotalTests ?? 0,
    passed: raw.numPassedTests ?? 0,
    failed: raw.numFailedTests ?? 0,
    skipped: raw.numPendingTests ?? 0
  };
}

//Backend
export function processBackendTestAssets(baseDir: string) {
  const integrationZip = findLatestArtifact(baseDir, "backend-integration");
  const unitZip = findLatestArtifact(baseDir, "backend-unit");

  const zipToUse = integrationZip || unitZip;
  if (!zipToUse) return null;

  const extractDir = path.join(".tmp", "backend");
  extractZip(zipToUse, extractDir);

  const htmlPath = findFileRecursive(extractDir, "index.html");
  if (!htmlPath) return null;

  const html = fs.readFileSync(htmlPath, "utf8");
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const total = Number(doc.querySelector("#junit_info_test_count_count")?.textContent || 0);
  const passed = Number(doc.querySelector("#junit_info_test_passed_count")?.textContent || 0);
  const skipped = Number(doc.querySelector("#junit_info_test_skipped_count")?.textContent || 0);

  return {
    total,
    passed,
    skipped,
    failed: total - passed - skipped
  };
}

//Cypress
export function processCypressTestAssets(baseDir: string) {
  const zipPath = findLatestArtifact(baseDir, "cypress");
  if (!zipPath) return null;

  const extractDir = path.join(".tmp", "cypress");

  extractZip(zipPath, extractDir);

  const file = findFileRecursive(extractDir, "mochawesome.json");

  if (!file) {
    console.warn("⚠️ mochawesome.json not found in Cypress artifact");
    return null;
  }

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function findLatestArtifact(dir: string, keyword: string): string | null {

    if (!fs.existsSync(dir)) return null;

    const files = fs.readdirSync(dir)
        .filter(f => f.includes(keyword) && f.endsWith(".zip"))
        .map(f => ({
            name: f,
            path: path.join(dir, f),
            time: fs.statSync(path.join(dir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

    return files.length > 0 ? files[0].path : null;
}