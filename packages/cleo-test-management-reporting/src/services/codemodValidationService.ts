import { runCodemod } from "cleo-cypress-codemod";

export async function validateCodemodFiles(files: string[], inputPath: string) {
  const validation = await runCodemod(files, {
    ensureFeatureWrapper: false,
    moveTopLevelTags: false,
    addDomainTags: false,
    removeNestedTags: false,
    domainRoot: inputPath,
    dryRun: true,
    failOnNestedTags: true,
  });

  let hasErrors = false;

  for (const file of validation.files) {
    if (file.violations?.length) {
      hasErrors = true;

      console.log(`❌ ${file.filePath}`);

      file.violations.forEach((v: string) => console.log(`   - ${v}`));
    }

    if (file.warnings?.length) {
      console.log(`⚠️ ${file.filePath}`);

      file.warnings.forEach((w: string) => console.log(`   - ${w}`));
    }
  }

  if (hasErrors) {
    console.log("\n❌ Validation failed");
    process.exit(1);
  }
}
