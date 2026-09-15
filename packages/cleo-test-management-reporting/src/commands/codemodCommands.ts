import { Command } from "commander";
import fs from "fs";
import path from "path";
import { runCodemod }
  from "cleo-cypress-codemod";
import { resolveFiles }
  from "../utils/resolveFiles.js";
import { getInputSpecPath }
  from "../utils/inputResolver.js";
import { injectTcIds }
  from "../utils/injectTcIds.js";
import { configAccess }
  from "../services/configAccessService.js";

export function registerCodemodCommands(
  program: Command
) {

    const codemod = program
      .command("codemod")
      .description("Fix Cypress specs (feature wrapper, lift tags, add domain tags)");
    
    /* ============================================================
       VALIDATE SCRIPTS COMMAND - 
       This will validate Cypress specs without mutation
    ============================================================ */
    codemod
      .command("validate")
      .description("Validate Cypress tests (no changes applied)")
      .option("--input <path>", "Override input test directory")
      .action(async (opts) => {
    
        const inputPath = getInputSpecPath(opts.input);
        console.log(`📂 Using input path for validate: ${inputPath}`);
    
        const files = resolveFiles(inputPath);
    
        const result = await runCodemod(files, {
          ensureFeatureWrapper: false,
          moveTopLevelTags: false,
          addDomainTags: false,
          removeNestedTags: false,
          domainRoot: inputPath,
          dryRun: true,
          failOnNestedTags: true,
        });
    
        let hasErrors = false;
    
        for (const file of result.files) {
          const violations = file.violations || [];
          const warnings = file.warnings || [];
    
          if (violations.length > 0) {
            hasErrors = true;
    
            console.log(`\n❌ ${path.relative(inputPath, file.filePath)}`);
            violations.forEach(v => console.log(`   - ${v}`));
          }
    
          if (warnings.length > 0) {
            console.log(`\n⚠️ ${path.relative(inputPath, file.filePath)}`);
            warnings.forEach(w => console.log(`   - ${w}`));
          }
        }
    
        if (hasErrors) {
          console.log("\n❌ Validation FAILED");
          process.exit(1);
        }
    
        console.log(`\n📊 Files checked: ${result.summary.filesScanned}`);
        console.log("\n✅ Validation passed");
    
      });

    
/* ============================================================
   CODEMOD COMMAND - 
   This will apply codemod transformations to Cypress specs
============================================================ */
codemod
  .command("run")
  .description("Standardise Cypress tests (feature wrappers, tags, TC IDs)")
  .option("--input <path>", "Override input path")
  .option("--write", "Overwrite original files")
  .option("--changed-only", "Only output changed files")
  .option("--report", "Generate JSON report")
  .action(async (opts) => {

    const inputPath = getInputSpecPath(opts.input);
    console.log(`📂 Using input path for codemod: ${inputPath}`);

    const files = resolveFiles(inputPath);

    const result = await runCodemod(files, {
      ensureFeatureWrapper: true,
      moveTopLevelTags: true,
      addDomainTags: true,
      removeNestedTags: true,
      domainRoot: inputPath,
      dryRun: false,
      failOnNestedTags: false,
    });

    // ✅ determine output directory
    const outputRoot = configAccess.getCodemodOutput();

    fs.mkdirSync(outputRoot, { recursive: true });

    let changedCount = 0;
    const changedFiles: string[] = [];

    for (const file of result.files) {

      const relativePath = path.relative(inputPath, file.filePath);
      const outputPath = path.join(outputRoot, relativePath);

      const hasChanged = file.changes.featureWrapperAdded ||
        file.changes.tagsLifted ||
        file.changes.domainTagAdded ||
        file.changes.subdomainTagAdded;

      // skip unchanged if flag is on
      if (opts.changedOnly && !hasChanged) {
        continue;
      }

      // inject TC IDs if changed
      let content = file.source.transformed;

      if (hasChanged) {
        changedCount++;
        content = injectTcIds(file.filePath, content) || content;
        changedFiles.push(file.filePath);
      }

      // always write to output
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, content, "utf8");

      // optionally overwrite source
      if (opts.write) {
        fs.writeFileSync(file.filePath, content, "utf8");
      }
    }

    if (!opts.changedOnly || changedFiles.length > 0) {
      console.log("\n📄 Changed files:");

      changedFiles.forEach(file => {
        const relative = path.relative(inputPath, file);
        console.log(`  • ${relative}`);
      });
    }
    const report = {
      summary: {
        filesScanned: result.summary.filesScanned,
        filesChanged: changedCount,
        timestamp: new Date().toISOString()
      },
      files: result.files.map(file => ({
        filePath: path.relative(inputPath, file.filePath),
        changed: file.source.original !== file.source.transformed,
        warnings: file.warnings || [],
        violations: file.violations || [],
        changes: file.changes || {}
      }))
    };

    if (opts.write) {
      console.log("⚠️ Source files updated");
    }

    if (opts.report) {
      const reportDir = configAccess.getJsonReports();

      fs.mkdirSync(reportDir, { recursive: true });

      const reportPath = configAccess.getCodemodJsonReportPath();

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

      console.log(`📄 Report written to: ${reportPath}`);
    }

    console.log("\n📊 Codemod Summary");
    console.log(`Files processed: ${result.summary.filesScanned}`);
    console.log(`Files changed: ${changedCount}`);

  });

}