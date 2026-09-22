import { runCodemod } from "cleo-cypress-codemod";

export async function validateCodemodFiles(files: string[], inputPath: string) {
  const validation = await runCodemod(files, {
    ensureFeatureWrapper: false,
    moveTopLevelTags: false,
    addDomainTags: false,
    removeNestedTags: false,
    domainRoot: inputPath,
    dryRun: true,
    failOnNestedTags: false,
  });

  let hasErrors = false;

  let warningCount = 0;
  let violationCount = 0;
  let filesWithViolations = 0;

  for (const file of validation.files) {
    if (file.violations?.length) {
      filesWithViolations++;
      violationCount += file.violations.length;
    }

    if (file.warnings?.length) {
      warningCount += file.warnings.length;
    }
  }

  console.log(
    `⚠️ Validation completed (${filesWithViolations} files with violations, ${warningCount} warnings)`,
  );

  if (hasErrors) {
    console.log("⚠️ Continuing with codemod generation");
  }
}
