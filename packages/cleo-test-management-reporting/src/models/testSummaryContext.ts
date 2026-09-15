import type { CompleteResults } from "./testModels.js";
import type { BugMetric, BugSummary, ReleaseMetrics } from "./bugModels.js";

export interface SprintInfo {
  name: string;
  state: string;
  startDate: string;
  endDate: string;
}

export interface TestSummaryContext {
  results: CompleteResults;

  bugMetrics: BugMetric[];
  bugSummary: BugSummary;
  releaseMetrics: ReleaseMetrics;

  sprintInfo: SprintInfo;
}
