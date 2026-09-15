import fs from "fs";

import { configAccess } from "./configAccessService.js";
import { collectBugData } from "./jiraBugService.js";
import { getActiveSprint } from "./jiraSprintService.js";
import { collectReleaseMetrics } from "./jiraBugService.js";
import { generateCompleteTestResults } from "./testResultsAggregator.js";
import type { TestSummaryContext } from "../models/testSummaryContext.js";

export async function buildTestSummaryContext(): Promise<TestSummaryContext> {
  const resultsPath = configAccess.getCompleteResultsPath();

  if (!fs.existsSync(resultsPath)) {
    await generateCompleteTestResults();
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, "utf8"));

  const sprint = await getActiveSprint();

  const releaseMetrics = await collectReleaseMetrics(
    sprint.startDate,
    sprint.endDate,
  );

  const { bugData, metrics } = await collectBugData();

  return {
    results,

    bugMetrics: bugData,

    bugSummary: metrics,

    releaseMetrics,

    sprintInfo: {
      name: sprint.name,
      state: sprint.state,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
    },
  };
}
