import { Command } from "commander";
import { configAccess } from "../services/configAccessService.js";
import { processCypressTestAssets } from "../services/artifactProcessingService.js";
import { generateExecutionReports } from "../renderers/generateExecutionReports.js";

export function registerExecutionReportCommands(
  program: Command
) {
/* ============================================================
   AUTOMATION RESULTS EXCEL
============================================================ */
program
  .command("generate:execution-reports")
  .description("Generate Cypress execution Excel reports from mochawesome")
  .action(async () => {

    const outputDir = configAccess.getExecutionReports();

    const cypressData = processCypressTestAssets(
      configAccess.getCypressResults()
    );

    await generateExecutionReports(
      cypressData,
      outputDir,
    );

    console.log("✅ Cypress execution Excel reports generated");
  });

}