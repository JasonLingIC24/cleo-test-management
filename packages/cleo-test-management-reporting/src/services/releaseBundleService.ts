import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

import type { RuntimeContext } from "../models/runtimeContext.js";

import { configAccess } from "./configAccessService.js";

interface BundleManifest {
  version: string;
  generatedAt: string;
  source: string;
  runId?: number;
}

export async function buildReleaseBundle(
  runtimeContext: RuntimeContext,
): Promise<string> {
  const version = runtimeContext.version;

  const reportsDir = configAccess.getVersionedReportsRoot();

  const bundleDir = path.join(reportsDir, "bundle");

  cleanDirectory(bundleDir);

  fs.mkdirSync(bundleDir, { recursive: true });

  console.log("📦 Building Release Bundle...");

  /* =========================
     COPY DOCS
  ========================= */

  copyDirectoryIfExists(
    configAccess.getDocsReleaseDir(),
    path.join(bundleDir, "docs"),
  );

  /* =========================
     COPY JSON
  ========================= */

  copyDirectoryIfExists(
    configAccess.getJsonReports(),
    path.join(bundleDir, "json"),
  );

  /* =========================
     COPY EXECUTION REPORTS
  ========================= */

  copyDirectoryIfExists(
    configAccess.getExecutionReports(),
    path.join(bundleDir, "execution-reports"),
  );

  /* =========================
     COPY AUTOMATED REPORTS
  ========================= */

  copyDirectoryIfExists(
    configAccess.getAutomatedReportsDir(),
    path.join(bundleDir, "automated"),
  );

  /* =========================
     MANIFEST
  ========================= */

  const manifest: BundleManifest = {
    version,
    generatedAt: new Date().toISOString(),
    source: runtimeContext.source,
    runId: runtimeContext.runId,
  };

  fs.writeFileSync(
    path.join(bundleDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  /* =========================
     ZIP
  ========================= */

  const zipPath = path.join(
    reportsDir,
    "bundle",
    `elevate-${version}-release-bundle.zip`,
  );

  const zip = new AdmZip();

  zip.addLocalFolder(bundleDir);

  zip.writeZip(zipPath);

  console.log(`✅ Release Bundle: ${zipPath}`);

  return zipPath;
}

function copyDirectoryIfExists(source: string, destination: string): void {
  if (!fs.existsSync(source)) {
    console.log(`⚠️ Skipping missing directory: ${source}`);

    return;
  }

  fs.cpSync(source, destination, {
    recursive: true,
  });

  console.log(`✅ Added: ${path.basename(source)}`);
}

function cleanDirectory(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, {
      recursive: true,
      force: true,
    });
  }
}
