import fs from "fs";
import path from "path";
import os from "os";

import { configAccess } from "./configAccessService.js";

export async function acquireVersionedTests(): Promise<void> {
  const sourceRepo = process.env.ELEVATE_MONOREPO;

  if (!sourceRepo) {
    throw new Error("ELEVATE_MONOREPO environment variable not configured");
  }

  const sourceTests = path.join(
    sourceRepo,
    "automation-test-framework",
    "cypress",
    "tests",
  );

  const destination = configAccess.getVersionedCypressSpecs();

  if (!fs.existsSync(sourceTests)) {
    throw new Error(`Tests directory not found: ${sourceTests}`);
  }

  fs.rmSync(destination, {
    recursive: true,
    force: true,
  });

  fs.mkdirSync(destination, {
    recursive: true,
  });

  fs.cpSync(sourceTests, destination, { recursive: true });

  console.log(`✅ Acquired Cypress tests to ${destination}`);
}
