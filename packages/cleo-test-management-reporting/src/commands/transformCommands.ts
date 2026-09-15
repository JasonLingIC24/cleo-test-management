import { Command } from "commander";
import { runManualTransform } from "../services/manualTransformService.js";
import { runAutomatedTransform } from "../services/automatedTransformService.js";

export function registerTransformCommands(program: Command) {
  /* ============================================================
   TRANSFORM SPREADSHEET
============================================================ */
  program
    .command("transform:manual")
    .description(
      "Convert manual test scripts into structured test assets + Gherkin",
    )
    .action(async () => {
      try {
        console.log("📄 Running manual transform...");

        await runManualTransform();

        console.log("✅ Manual test assets generated");
      } catch (err: any) {
        console.error("❌ transform:manual failed");
        console.error(err.message);
        process.exit(1);
      }
    });

  /* ============================================================
   REPORT COMMAND
  ============================================================ */

  program
    .command("transform:automated")
    .option("--input <path>", "Path to Cypress Test Spec Files")
    .action(async (opts) => {
      console.log("Automated report generation in progress...");

      await runAutomatedTransform(opts.input);
    });
}
