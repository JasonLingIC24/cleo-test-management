import { configAccess } from "./configAccessService.js";

import {
  processCypressTestAssets,
  processBackendTestAssets,
  processFrontendTestAssets,
} from "./artifactProcessingService.js";

import { generateCompleteTestResults } from "./testResultsAggregator.js";

export async function runResultsAggregation() {
  const frontend = processFrontendTestAssets(configAccess.getFrontendResults());

  const backend = processBackendTestAssets(configAccess.getBackendResults());

  const cypress = processCypressTestAssets(configAccess.getCypressResults());

  const results = await generateCompleteTestResults({
    frontend,
    backend,
    cypress,
  });

  return {
    frontend,
    backend,
    cypress,
    results,
  };
}
