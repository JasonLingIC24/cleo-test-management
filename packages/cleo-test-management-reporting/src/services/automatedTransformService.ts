import { resolveFiles } from "../utils/resolveFiles.js";
import { run as runReporting } from "../cli/index.js";
import { configAccess } from "./configAccessService.js";

export async function runAutomatedTransform(inputPath?: string) {
  const source = inputPath ?? configAccess.getCodemodOutput();

  const files = resolveFiles(source);

  await runReporting(files, {
    format: "excel",
    outputDir: configAccess.getAutomatedReportsDir(),
  });

  await runReporting(files, {
    format: "gherkin",
    outputDir: configAccess.getAutomatedFeaturesDir(),
  });
}
