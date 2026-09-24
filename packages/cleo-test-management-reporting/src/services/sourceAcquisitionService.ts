import fs from "fs";
import path from "path";
import { configAccess } from "./configAccessService.js";
import {
  getSourceTag,
  getPreviousTag,
  tagExists,
  getCurrentBranch,
  checkoutTag,
  checkoutBranch,
} from "./gitSourceService.js";
import { RuntimeContext } from "../models/runtimeContext.js";
import { getChangedFiles } from "./changeAnalysisService.js";

export async function acquireVersionedTests(runtimeContext?: RuntimeContext) {
  const sourceRepo = process.env.ELEVATE_MONOREPO;
  const tag = getSourceTag(runtimeContext?.sourceTag);
  const previousTag = getPreviousTag(tag);

  console.log(`🔖 Source tag: ${tag}`);

  if (previousTag) {
    const changes = getChangedFiles(previousTag, tag);

    console.log(`🔖 Previous tag: ${previousTag}`);
    console.log("\n📈 Change Analysis");
    console.log(`\n   Changed files: ${changes.changedFiles.length}`);
    console.log(`   DevOps files: ${changes.devopsFiles.length}`);
    console.log(`   Frontend files: ${changes.frontendFiles.length}`);
    console.log(`   Backend files: ${changes.backendFiles.length}`);
    console.log(`   Cypress files: ${changes.cypressFiles.length}`);
    console.log(`   Other files: ${changes.otherFiles.length}`);

    const categorisedTotal =
      changes.backendFiles.length +
      changes.frontendFiles.length +
      changes.cypressFiles.length +
      changes.devopsFiles.length +
      changes.otherFiles.length;

    console.log(`\n   Categorised files: ${categorisedTotal}`);
  }

  if (!sourceRepo) {
    throw new Error("ELEVATE_MONOREPO environment variable not configured");
  }

  if (!tagExists(tag)) {
    throw new Error(`Release tag not found: ${tag}`);
  }
  console.log(`\n✅ Verified source tag: ${tag}`);

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
