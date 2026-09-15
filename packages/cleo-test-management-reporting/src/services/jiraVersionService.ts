import { getConfig } from "./configService.js";

type JiraVersion = {
  name: string;
};

export async function validateJiraVersionExists(versionName: string) {
  const cfg = getConfig();
  const jira = cfg.jira;
  const projectKey = cfg.jira.projectKey;

  const url = `${jira.baseUrl}/rest/api/3/project/${projectKey}/versions`;

  const auth = Buffer.from(`${jira.email}:${jira.token}`).toString("base64");

  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`❌ Jira API failed: ${res.status} ${res.statusText}`);
  }

  const versions = (await res.json()) as JiraVersion[];

  const match = versions.find((v) => v.name === versionName);

  if (!match) {
    throw new Error(
      `❌ Jira version "${versionName}" not found in project ${projectKey}`,
    );
  }
  console.log("📦 Available versions:");
  versions.forEach((v) => console.log(" -", v.name));
  console.log(`✅ Jira version found: ${versionName}`);
}
