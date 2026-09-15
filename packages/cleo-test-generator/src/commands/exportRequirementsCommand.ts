import { exportEpicRequirements } from "../services/jiraRequirementsService.js";

export async function runExportRequirementsCommand(
  issues: any[],
  outputFile: string,
) {
  console.log("📦 Exporting Jira requirements...");

  await exportEpicRequirements(issues, outputFile);

  console.log("✅ Jira requirements export complete");
}
