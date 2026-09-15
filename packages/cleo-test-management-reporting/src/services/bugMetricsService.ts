import fs from "fs";
import path from "path";
import { configAccess } from "./configAccessService.js";

export async function generateBugMetricFiles(reportContext: any) {
  const bugData = reportContext.bugMetrics;

  const metrics = reportContext.bugSummary;

  const bugMetricsPath = configAccess.getBugMetricsPath();

  const bugSummaryPath = configAccess.getBugSummaryPath();

  fs.mkdirSync(path.dirname(bugMetricsPath), { recursive: true });

  fs.writeFileSync(bugMetricsPath, JSON.stringify(bugData, null, 2));

  fs.writeFileSync(bugSummaryPath, JSON.stringify(metrics, null, 2));

  console.log(`📊 Bug metrics saved: ${bugMetricsPath}`);

  console.log(`📊 Bug summary saved: ${bugSummaryPath}`);

  return {
    bugMetricsPath,
    bugSummaryPath,
  };
}
