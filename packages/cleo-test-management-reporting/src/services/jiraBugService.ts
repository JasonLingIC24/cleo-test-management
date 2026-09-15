import { searchIssues } from "../services/jiraClient.js";
import { getConfig } from "./configService.js";
import type {
  BugMetric,
  BugSummary,
  ReleaseMetrics,
} from "../models/bugModels.js";

/* =========================
   FETCH ALL BUGS
========================= */
async function fetchAllBugs(projectKey: string) {
  const config = getConfig().jira;

  const bugWindow = getConfig().testing?.historicBugWindowDays || 180;

  const jql = `
  project = ${projectKey}
  AND issuetype = Bug
  AND created >= -${bugWindow}d
  ORDER BY created DESC`
    .replace(/\s+/g, " ")
    .trim();

  const issues = await searchIssues(jql, config);

  return issues;
}

/* =====================
   AGE BUCKET HELPER
===================== */
function getAgeBucket(days: number): string {
  if (days > 30) return "High Risk";
  if (days > 14) return "Medium Risk";
  return "Low Risk";
}

async function fetchBugsRaisedDuringSprint(
  projectKey: string,
  sprintStartDate: string,
  sprintEndDate: string,
) {
  const start = sprintStartDate.split("T")[0];

  const end = sprintEndDate.split("T")[0];

  const config = getConfig().jira;

  const jql = `
    project = ${projectKey}
    AND issuetype = Bug
    AND created >= "${start}"
    AND created <= "${end}"
    ORDER BY created DESC
  `
    .replace(/\s+/g, " ")
    .trim();

  console.log(jql);

  return await searchIssues(jql, config);
}

/* =========================
   MAP BUG DATA ✅ FIXED
========================= */
function mapBugData(issues: any[]): BugMetric[] {
  const config = getConfig().jira;

  return issues.map((issue) => {
    const fields = issue.fields;

    const created = new Date(fields.created);
    const today = new Date();

    const daysOpen = Math.floor(
      (today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      key: `${config.baseUrl}/browse/${issue.key}`,
      summary: fields.summary || "No summary",

      priority: fields.priority?.name || "Unknown",

      severity:
        fields.customfield_10040?.value || fields.priority?.name || "Unknown",

      created: fields.created,
      status: fields.status?.name || "Unknown",

      daysOpen,
      ageBucket: getAgeBucket(daysOpen),
      resolved: fields.resolutiondate,
    };
  });
}

export async function collectBugData(): Promise<{
  bugData: BugMetric[];
  metrics: BugSummary;
}> {
  const projectKey = getConfig().jira.projectKey;

  console.log("🐞 Fetching Jira bug data...");

  const bugs = await fetchAllBugs(projectKey);
  const bugData = mapBugData(bugs);

  const closedStatuses = ["Done", "Closed", "Cancelled"];

  console.log(`✅ Bugs collected: ${bugData.length}`);

  const openBugs = bugData.filter((b) => !closedStatuses.includes(b.status));

  const criticalOpen = openBugs.filter((b) =>
    ["Critical", "Highest"].includes(b.severity),
  ).length;

  const highOpen = openBugs.filter((b) => b.severity === "High").length;

  const mediumOpen = openBugs.filter((b) => b.severity === "Medium").length;

  const lowOpen = openBugs.filter((b) => b.severity === "Low").length;

  const currentOpenRate =
    bugData.length > 0
      ? Number(((openBugs.length / bugData.length) * 100).toFixed(1))
      : 0;

  const metrics = {
    totalInReportingWindow: bugData.length,
    open: openBugs.length,

    criticalOpen,
    highOpen,
    mediumOpen,
    lowOpen,

    criticalPct:
      openBugs.length > 0
        ? Number(((criticalOpen / openBugs.length) * 100).toFixed(1))
        : 0,

    highPct:
      openBugs.length > 0
        ? Number(((highOpen / openBugs.length) * 100).toFixed(1))
        : 0,

    mediumPct:
      openBugs.length > 0
        ? Number(((mediumOpen / openBugs.length) * 100).toFixed(1))
        : 0,

    lowPct:
      openBugs.length > 0
        ? Number(((lowOpen / openBugs.length) * 100).toFixed(1))
        : 0,

    currentOpenRate,

    avgOpenAge:
      openBugs.length > 0
        ? Math.floor(
            openBugs.reduce((sum, b) => sum + b.daysOpen, 0) / openBugs.length,
          )
        : 0,
  };
  return {
    bugData,
    metrics,
  };
}

export async function collectReleaseMetrics(
  sprintStartDate: string,
  sprintEndDate: string,
): Promise<ReleaseMetrics> {
  const projectKey = getConfig().jira.projectKey;

  const issues = await fetchBugsRaisedDuringSprint(
    projectKey,
    sprintStartDate,
    sprintEndDate,
  );

  const bugs = mapBugData(issues);

  const criticalRaisedThisSprint = bugs.filter((b) =>
    ["Critical", "Highest"].includes(b.severity),
  ).length;

  const highRaisedThisSprint = bugs.filter((b) => b.severity === "High").length;

  const mediumRaisedThisSprint = bugs.filter(
    (b) => b.severity === "Medium",
  ).length;

  const lowRaisedThisSprint = bugs.filter((b) => b.severity === "Low").length;

  const criticalRaisedPct =
    bugs.length > 0
      ? Number(((criticalRaisedThisSprint / bugs.length) * 100).toFixed(1))
      : 0;

  const highRaisedPct =
    bugs.length > 0
      ? Number(((highRaisedThisSprint / bugs.length) * 100).toFixed(1))
      : 0;

  const mediumRaisedPct =
    bugs.length > 0
      ? Number(((mediumRaisedThisSprint / bugs.length) * 100).toFixed(1))
      : 0;

  const lowRaisedPct =
    bugs.length > 0
      ? Number(((lowRaisedThisSprint / bugs.length) * 100).toFixed(1))
      : 0;

  const open = bugs.filter(
    (b) => !["Done", "Closed", "Cancelled"].includes(b.status),
  );

  const closed = bugs.filter((b) =>
    ["Done", "Closed", "Cancelled"].includes(b.status),
  );

  console.log("Sprint Metrics:", {
    raised: bugs.length,
    open: open.length,
    closed: closed.length,
    criticalRaisedThisSprint,
    highRaisedThisSprint,
    mediumRaisedThisSprint,
    lowRaisedThisSprint,
  });
  return {
    raisedThisSprint: bugs.length,

    openThisSprint: open.length,

    closedThisSprint: closed.length,

    criticalRaisedThisSprint,
    highRaisedThisSprint,
    mediumRaisedThisSprint,
    lowRaisedThisSprint,

    criticalRaisedPct,
    highRaisedPct,
    mediumRaisedPct,
    lowRaisedPct,
  };
}
