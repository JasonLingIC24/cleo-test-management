import { configAccess } from "./configAccessService.js";
import { runManualTransform } from "./manualTransformService.js";
import { runAutomatedTransform } from "./automatedTransformService.js";
import { runResultsAggregation } from "./resultsAggregationService.js";
import { extractCypressTags } from "../utils/extractCypressTags.js";
import { generateExecutionReports } from "../renderers/generateExecutionReports.js";

export async function runPhase2Workflow() {
  await runManualTransform();

  await runAutomatedTransform();

  await extractCypressTags();

  const { cypress, results } = await runResultsAggregation();

  if (cypress) {
    await generateExecutionReports(cypress, configAccess.getExecutionReports());
  } else {
    console.warn(
      "⚠️ Skipping execution reports because no Cypress results were found.",
    );
  }

  return results;
}
