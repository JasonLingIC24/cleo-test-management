import { generateFeatures } from "../services/jiraFeatureGenerationService.js";

export async function runGenerateFeaturesCommand(
  inputFile: string,
  outputDir: string,
) {
  await generateFeatures({
    inputFile,
    outputDir,
  });
}
