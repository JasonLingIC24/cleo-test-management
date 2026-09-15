import { validateJiraVersionExists } from "./jiraVersionService.js";
import { searchIssuesByVersion, getIssue } from "./jiraClient.js";
import { getConfig } from "./configService.js";

export async function getReleaseStories(versionName: string) {
  const config = getConfig().jira;

  console.log(`\n🚀 Processing Jira release: ${versionName}`);

  await validateJiraVersionExists(versionName);

  const issueKeys = await searchIssuesByVersion(versionName, config);

  if (issueKeys.length === 0) {
    console.warn(`⚠️ No issues found for version "${versionName}"`);
  }

  // ✅ Step 4: Fetch full issue details
  const allIssues = await Promise.all(
    issueKeys.map((key) => getIssue(key, config)),
  );

  // ✅ filter only Stories
  const stories = allIssues.filter(
    (issue) => issue.type?.toLowerCase() === "story",
  );

  console.log(`📘 Stories found: ${stories.length}`);
  const types = [...new Set(allIssues.map((i) => i.type))];
  console.log("🧾 Issue types in release:", types);

  return stories;
}
