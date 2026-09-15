import fs from "fs";
import { configAccess } from "./configAccessService.js";
import { buildJiraADF } from "./jiraAdfService.js";

export function buildDashboardADF() {

  const resultsPath = configAccess.getCompleteResultsPath();

  let completeResults = null;

  if (fs.existsSync(resultsPath)) {
    completeResults = JSON.parse(
      fs.readFileSync(resultsPath, "utf8")
    );
  }

  if (completeResults) {
    return buildJiraADF(completeResults);
  }

  return {
    version: 1,
    type: "doc",
    content: [{
      type: "paragraph",
      content: [{
        type: "text",
        text: "No test results available"
      }]
    }]
  };
}