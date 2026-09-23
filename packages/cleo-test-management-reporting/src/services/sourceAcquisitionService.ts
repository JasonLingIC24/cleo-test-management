import fs from "fs";
import path from "path";
import { configAccess } from "./configAccessService.js";
import { getSourceTag, tagExists } from "./gitSourceService.js";
import {
  getCurrentBranch,
  checkoutTag,
  checkoutBranch,
} from "./gitSourceService.js";
import { RuntimeContext } from "../models/runtimeContext.js";

export async function acquireVersionedTests(runtimeContext?: RuntimeContext) {
  const sourceRepo = process.env.ELEVATE_MONOREPO;
  const tag = getSourceTag(runtimeContext?.sourceTag);
  console.log(`🔖 Source tag: ${tag}`);

  if (!sourceRepo) {
    throw new Error("ELEVATE_MONOREPO environment variable not configured");
  }

  if (!tagExists(tag)) {
    throw new Error(`Release tag not found: ${tag}`);
  }
  console.log(`✅ Verified source tag: ${tag}`);

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

  const currentBranch = getCurrentBranch();
  console.log(`🌿 Current branch: ${currentBranch}`);

  try {
    checkoutTag(tag);
    console.log(`✅ Checked out tag: ${tag}`);

    fs.cpSync(sourceTests, destination, { recursive: true });
    console.log("✅ Acquired Cypress tests ");
  } finally {
    checkoutBranch(currentBranch);
    console.log(`✅ Restored branch: ${currentBranch}`);
  }
}
