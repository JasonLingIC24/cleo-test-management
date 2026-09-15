import fs from "fs";
import path from "path";
import type {
  JiraConfig,
  JiraApiIssueResponse,
  JiraSearchResponse,
} from "../types/jira.js";

/* =========================
   HELPERS
========================= */

function getAuth(config: JiraConfig) {
  return Buffer.from(`${config.email}:${config.token}`).toString("base64");
}

async function ensureSuccess(res: Response, message = "Jira API failed") {
  if (!res.ok) {
    const text = await res.text();

    throw new Error(`${message}: ${res.status} ${text}`);
  }
}

function getHeaders(config: JiraConfig, extras: Record<string, string> = {}) {
  return {
    Authorization: `Basic ${getAuth(config)}`,
    Accept: "application/json",
    ...extras,
  };
}

/* =========================
   FETCH ISSUE
========================= */

export async function getIssue(key: string, config: JiraConfig) {
  const res = await fetch(
    `${config.baseUrl}/rest/api/3/issue/${key}?fields=summary,description,issuetype,components`,
    {
      headers: getHeaders(config),
    },
  );
  await ensureSuccess(res);

  const data = (await res.json()) as JiraApiIssueResponse;

  return {
    key,
    title: data.fields?.summary || "No title",
    description: data.fields?.description,
    type: data.fields?.issuetype?.name || "Unknown",

    // ✅ NEW
    components: data.fields?.components?.map((c: any) => c.name) || [],
  };
}

/* =========================
   SEARCH BY VERSION
========================= */

export async function searchIssuesByVersion(
  versionName: string,
  config: JiraConfig,
): Promise<string[]> {
  const jql = encodeURIComponent(`fixVersion = "${versionName}"`);

  let startAt = 0;
  const maxResults = 50;
  let allIssues: string[] = [];

  while (true) {
    console.log(`🔎 Querying Jira for version: "${versionName}"`);
    console.log(`🔍 Fetching Jira issues from ${startAt}`);

    const res = await fetch(
      `${config.baseUrl}/rest/api/3/search/jql?jql=${jql}&fields=key&startAt=${startAt}&maxResults=${maxResults}`,
      {
        headers: getHeaders(config),
      },
    );
    await ensureSuccess(res);

    const data = (await res.json()) as JiraSearchResponse;

    const issues = data.issues || [];

    console.log(`✅ Retrieved ${issues.length} issues`);

    allIssues.push(...issues.map((i) => i.key));
    if (issues.length < maxResults) {
      break;
    }

    startAt += maxResults;
  }

  return allIssues;
}

/* =========================
   UPDATE DESCRIPTION
========================= */

export async function updateJiraDescription(
  issueKey: string,
  adf: any,
  config: JiraConfig,
) {
  const url = `${config.baseUrl}/rest/api/3/issue/${issueKey}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: getHeaders(config, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      fields: {
        description: adf,
      },
    }),
  });
  await ensureSuccess(res, "Jira update failed");

  console.log(`✅ Jira updated: ${issueKey}`);
}
/* =========================
   ATTACH FILE
========================= */
export async function attachFileToJira(
  issueKey: string,
  filePath: string,
  config: JiraConfig,
) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const fileBuffer = fs.readFileSync(filePath);

  const url = `${config.baseUrl}/rest/api/3/issue/${issueKey}/attachments`;

  const form = new FormData();

  form.append("file", new Blob([fileBuffer]), path.basename(filePath));

  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(config, {
      "X-Atlassian-Token": "no-check",
    }),
    body: form,
  });

  await ensureSuccess(res, "Attachment failed");

  console.log(`✅ File attached to Jira: ${issueKey}`);
}

/* =========================/* 
GENERIC JQL SEARCH (FIXED ✅)
========================= */
// Jira Cloud Search API uses cursor-based pagination.
// Do not use startAt/total pagination.
// Continue until response.isLast === true and use
// response.nextPageToken for subsequent requests.

export async function searchIssues(jql: string, config: JiraConfig) {
  const maxResults = 50;
  const allIssues: any[] = [];
  const encodedJql = encodeURIComponent(jql);

  let nextPageToken: string | undefined;

  while (true) {
    const url =
      `${config.baseUrl}/rest/api/3/search/jql` +
      `?jql=${encodedJql}` +
      `&maxResults=${maxResults}` +
      `&fields=summary,priority,created,fixVersions,issuetype,status,customfield_10040` +
      (nextPageToken
        ? `&nextPageToken=${encodeURIComponent(nextPageToken)}`
        : "");

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${getAuth(config)}`,
        Accept: "application/json",
      },
    });
    await ensureSuccess(res);

    const data = await res.json();

    const issues = data.issues ?? [];

    allIssues.push(...issues);

    if (data.isLast) {
      break;
    }

    nextPageToken = data.nextPageToken;

    if (!nextPageToken) {
      throw new Error("Jira returned isLast=false but no nextPageToken");
    }
  }

  return allIssues;
}

export async function searchIssuesWithFields(
  jql: string,
  fields: string[],
  config: JiraConfig,
) {
  console.log(`🔎 Executing JQL: ${jql}`);

  const allIssues: any[] = [];

  let nextPageToken: string | undefined;
  let page = 1;

  while (true) {
    const requestBody: any = {
      jql,
      maxResults: 1000,
      fields,
    };

    if (nextPageToken) {
      requestBody.nextPageToken = nextPageToken;
    }

    const res = await fetch(`${config.baseUrl}/rest/api/3/search/jql`, {
      method: "POST",
      headers: getHeaders(config, {
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(requestBody),
    });

    await ensureSuccess(res);

    const data = await res.json();

    const issues = data.issues || [];

    allIssues.push(...issues);

    if (data.isLast === true) {
      break;
    }

    nextPageToken = data.nextPageToken;

    if (!nextPageToken) {
      console.warn("⚠️ No nextPageToken returned. Stopping.");
      break;
    }

    page++;

    // Safety guard
    if (page > 100) {
      throw new Error("Jira pagination exceeded 100 pages");
    }
  }

  console.log(`✅ Total Issues Retrieved: ${allIssues.length}`);

  return allIssues;
}
