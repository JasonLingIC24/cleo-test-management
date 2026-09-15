import { configAccess } from "./configAccessService.js";
import { resolveFiles } from "../utils/resolveFiles.js";
import { runCodemod } from "cleo-cypress-codemod";
import { validateCodemodFiles } from "./codemodValidationService.js";
import { writeCodemodOutput } from "./codemodOutputService.js";

export async function runCodemodWorkflow() {
  const inputPath = configAccess.getVersionedCypressSpecs();

  const files = resolveFiles(inputPath);

  /* ✅ VALIDATE */
  await validateCodemodFiles(files, inputPath);

  /* ✅ APPLY CODEMOD */
  const result = await runCodemod(files, {
    ensureFeatureWrapper: true,
    moveTopLevelTags: true,
    addDomainTags: true,
    removeNestedTags: true,
    domainRoot: inputPath,
    dryRun: false,
    failOnNestedTags: false,
  });

  /* ✅ WRITE OUTPUT */
  writeCodemodOutput(result, inputPath);
}
