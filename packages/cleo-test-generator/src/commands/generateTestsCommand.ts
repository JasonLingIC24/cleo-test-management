import { generateTestsFromRelease } from "../services/jiraToTestsService.js";

export async function runGenerateTestsCommand(
  issues: any[],
  options: {
    featuresDir: string;
    testCasesDir: string;
    summaryDir: string;
  },
) {
  console.log("🚀 Generating tests from Jira...\n");

  await generateTestsFromRelease(issues, options);

  console.log("\n✅ Test generation complete\n");
}
