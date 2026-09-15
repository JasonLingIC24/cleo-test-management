import { Command } from "commander";
import { configAccess } from "../services/configAccessService.js";
import { runResultsAggregation } from "../services/resultsAggregationService.js";
import { extractCypressTags } from "../utils/extractCypressTags.js";

export function registerResultsCommands(program: Command) {
  /* ============================================================
       RESULTS AGGREGATOR
    ============================================================ */
  program
    .command("aggregate-results")
    .description(
      "Combine frontend, backend, and Cypress test results into a single JSON summary",
    )
    .action(async () => {
      console.log("📦 Processing test assets...");

      console.log("TestAssets(");
      console.log("  Frontend: ", configAccess.getFrontendResults());
      console.log("  Backend: ", configAccess.getBackendResults());
      console.log("  Cypress: ", configAccess.getCypressResults());
      console.log(")");

      const aggregation = await runResultsAggregation();

      const completeResults = aggregation.results;

      console.log(
        `✅ Aggregated: ${completeResults?.summary?.total ?? 0} tests`,
      );
    });
  /* ============================================================
       CYPRESSS-TAGS
    ============================================================ */
  program
    .command("extract:cypress-tags")
    .description("Extract tags from Cypress tests into JSON")
    .option("--input <path>", "Override Cypress test directory")
    .action(async (opts: { input?: string }) => {
      extractCypressTags(opts.input);
    });
}
