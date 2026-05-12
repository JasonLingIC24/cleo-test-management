import { Command } from "commander";
import fs from "fs";
import path from "path";

import { runCodemod, type CodemodResult } from "cleo-cypress-codemod";
import { resolveFiles } from "./utils/resolveFiles.js";
import { formatCliSummary } from "./formatCliSummary.js";

/**
 * Registers the `codemod` command and its subcommands.
 */
export function registerCodemodCommand(program: Command): void {
  const codemod = program
    .command("codemod")
    .description("Cypress codemod commands");

  codemod
    .command("run")
    .description("Run Cypress codemod to enforce Feature wrappers and tags")
    .requiredOption("-i, --input <path>", "Input file or directory")
    .option("--domain-root <path>", "Domain root directory", "cypress/e2e")
    .option("--dry-run", "Do not write files", false)
    .option("--write", "Write changes to files in place", false)
    .option("--out-dir <path>", "Write all files to an output directory")
    .action(async (opts) => {
      // ─────────────────────────────────────────────
      // Validation
      // ─────────────────────────────────────────────

      if (!opts.input) {
        console.error("❌ Missing required option --input");
        process.exit(1);
      }

      if (opts.write && opts.outDir) {
        console.error("❌ --write and --out-dir cannot be used together");
        process.exit(1);
      }

      // ─────────────────────────────────────────────
      // Resolve input files
      // ─────────────────────────────────────────────

      const inputFiles = resolveFiles(opts.input);

      // ─────────────────────────────────────────────
      // Run codemod (NO filesystem writes here)
      // ─────────────────────────────────────────────

      const result = await runCodemod(inputFiles, {
        ensureFeatureWrapper: true,
        moveTopLevelTags: true,
        addDomainTags: true,
        domainRoot: opts.domainRoot,
        dryRun: opts.dryRun,
      });

      // ─────────────────────────────────────────────
      // Output handling
      // ─────────────────────────────────────────────

      if (opts.outDir) {
        writeOutputDirectory(result, opts.domainRoot, opts.outDir);
      } else {
        // Always write the JSON report in the current working directory
        fs.writeFileSync(
          "cleo-codemod-report.json",
          JSON.stringify(result, null, 2),
          "utf8",
        );
      }

      // Write changes in-place ONLY if explicitly requested
      if (opts.write && !opts.dryRun) {
        for (const file of result.files) {
          if (file.changes.featureWrapperAdded) {
            fs.writeFileSync(
              file.filePath,
              file.source.transformed,
              "utf8",
            );
          }
        }
      }

      // ─────────────────────────────────────────────
      // CLI output
      // ─────────────────────────────────────────────

      console.log(formatCliSummary(result));
    });
}

/* ───────────────────────────────────────────── */
/* Helpers                                      */
/* ───────────────────────────────────────────── */

/**
 * Writes all processed files (changed OR unchanged) to an output directory,
 * preserving relative folder structure.
 */
function writeOutputDirectory(
  result: CodemodResult,
  inputRoot: string,
  outputRoot: string,
): void {
  for (const file of result.files) {
    const relativePath = path.relative(inputRoot, file.filePath);
    const targetPath = path.join(outputRoot, relativePath);

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    fs.writeFileSync(
      targetPath,
      file.source.transformed,
      "utf8",
    );
  }

  fs.writeFileSync(
    path.join(outputRoot, "cleo-codemod-report.json"),
    JSON.stringify(result, null, 2),
    "utf8",
  );
}