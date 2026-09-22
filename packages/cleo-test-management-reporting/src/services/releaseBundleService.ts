import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

import { configAccess } from "./configAccessService.js";
import type { RuntimeContext } from "../models/runtimeContext.js";

interface BundleManifest {
  version: string;
  generatedAt: string;
  runId?: number;
}

export async function buildReleaseBundle(
  runtimeContext: RuntimeContext,
): Promise<string> {
  const reportsDir = configAccess.getVersionedReportsRoot();

  const bundleDir = path.join(reportsDir, "bundle");

  const stagingDir = path.join(reportsDir, "bundle-temp");

  cleanDirectory(stagingDir);

  fs.mkdirSync(stagingDir, {
    recursive: true,
  });

  console.log("📦 Building Release Bundle...");

  /* =========================
     COPY CONTENT
  ========================= */

  copyDirectoryIfExists(
    configAccess.getDocsReleaseDir(),
    path.join(stagingDir, "docs"),
  );

  copyDirectoryIfExists(
    configAccess.getJsonReports(),
    path.join(stagingDir, "json"),
  );

  copyDirectoryIfExists(
    configAccess.getExecutionReports(),
    path.join(stagingDir, "execution-reports"),
  );

  copyDirectoryIfExists(
    configAccess.getAutomatedReportsDir(),
    path.join(stagingDir, "automated"),
  );

  /* =========================
     MANIFEST
  ========================= */

  const manifest: BundleManifest = {
    version: runtimeContext.version,
    generatedAt: new Date().toISOString(),
    runId: runtimeContext.runId,
  };

  fs.writeFileSync(
    path.join(stagingDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  /* =========================
     ZIP
  ========================= */

  fs.mkdirSync(bundleDir, {
    recursive: true,
  });

  const zipPath = path.join(
    bundleDir,
    `elevate-${runtimeContext.version}-release-bundle.zip`,
  );

  const zip = new AdmZip();

  zip.addLocalFolder(stagingDir);

  zip.writeZip(zipPath);

  /* =========================
     CLEAN STAGING
  ========================= */

  cleanDirectory(stagingDir);

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
