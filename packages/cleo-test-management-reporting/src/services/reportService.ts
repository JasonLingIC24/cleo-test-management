import { generateWordReport } from "./templateService.js";
import { buildTemplateData } from "./templateDataBuilder.js";
import type { TestSummaryReportData } from "../models/testSummaryReportModels.js";

export async function generateTestSummaryReport(
  input: TestSummaryReportData,
  templatePath: string,
  outputPath: string,
) {
  const templateData = buildTemplateData(input);

  await generateWordReport(templatePath, outputPath, templateData);

  return {
    success: true,
    outputPath,
  };
}
