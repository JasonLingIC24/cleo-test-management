import { configAccess } from "./configAccessService.js";
import { resolveFiles } from "../utils/resolveFiles.js";
import { runCodemod } from "cleo-cypress-codemod";
import { validateCodemodFiles } from "./codemodValidationService.js";
import { writeCodemodOutput } from "./codemodOutputService.js";
import { acquireVersionedTests } from "./sourceAcquisitionService.js";

export async function runCodemodWorkflow() {
  await acquireVersionedTests();

  const inputPath = configAccess.getVersionedCypressSpecs();
  const files = resolveFiles(inputPath);

  console.log("🔍 Validating Cypress tests...");

  await validateCodemodFiles(files, inputPath);

  console.log("🔧 Running codemod...");

  const result = await runCodemod(files, {
    ensureFeatureWrapper: true,
    moveTopLevelTags: true,
    addDomainTags: true,
    removeNestedTags: true,
    domainRoot: inputPath,
    dryRun: false,
    failOnNestedTags: false,
  });

  writeCodemodOutput(result, inputPath);
}
