import type { CompleteResults } from "./testModels.js";
import type { BugMetric, BugSummary, ReleaseMetrics } from "./bugModels.js";
import type { SprintInfo } from "./testSummaryContext.js";

export interface TestSummaryReportData extends CompleteResults {
  bugMetrics: BugMetric[];
  bugSummary: BugSummary;
  releaseMetrics: ReleaseMetrics;
  sprintInfo: SprintInfo;
}
