import { buildBaseName } from "../utils/fileNaming.js";
import { getConfig } from "./configService.js";
import type { BugMetric } from "../models/bugModels.js";
import { TestSummaryReportData } from "../models/testSummaryReportModels.js";
import { CleoConfig } from "../models/configModels.js";

type TemplateData = Record<string, unknown>;

export function buildTemplateData(data: TestSummaryReportData): TemplateData {
  const bugMetrics = data.bugMetrics;
  const bugSummary = data.bugSummary;
  const closedStatuses = ["Done", "Closed", "Cancelled"];
  const sprintInfo = data.sprintInfo;
  const openBugs = bugMetrics.filter((b) => !closedStatuses.includes(b.status));

  const sortedBugs = [...openBugs].sort((a, b) => {
    const severityDiff =
      getSeverityRank(a.severity) - getSeverityRank(b.severity);

    if (severityDiff !== 0) return severityDiff;

    return b.daysOpen - a.daysOpen;
  });

  const config = getConfig();
  const baseName = buildBaseName(config);
  const fileName = `${baseName}-test-summary-report.docx`;

  const features = data.cypress?.result?.features || [];

  // ✅ FEATURE DOMAINS
  const mapped = features.map((d): string => mapDomainName(d.name));
  const uniqueDomains: string[] = Array.from(new Set(mapped));

  // ✅ SUMMARY
  const failingDomains = features.filter((f) => f.failed > 0).length;

  const summaryInsight =
    data.summary.failed > 0
      ? `⚠️ ${data.summary.failed} failing tests across ${failingDomains} domains`
      : "✅ All tests passing";

  const severityCounts = {
    critical: sortedBugs.filter((b) =>
      ["Critical", "Highest"].includes(b.severity),
    ).length,
    high: sortedBugs.filter((b) => b.severity === "High").length,
    medium: sortedBugs.filter((b) => b.severity === "Medium").length,
    low: sortedBugs.filter((b) => b.severity === "Low").length,
  };

  const defectSummaryText = buildDefectSummaryText({
    ...bugSummary,
    ...severityCounts,
  });

  const defectNote = `Priority classifications reflect the business impact of a defect and should not be interpreted as a direct measure of clinical risk.`;
  const featureDomainsText = uniqueDomains
    .map((name) => `• ${name}`)
    .join("\n");

  const cyFeaturesText =
    (data.cypress?.result?.features || [])
      .map(
        (f) =>
          `• ${mapDomainName(f.name)} — ${f.failed} failed (${f.passRate}%)`,
      )
      .join("\n") || "No Cypress feature data available";

  const featureScope = buildFeatureScope(data);

  const conclusion = buildConclusion(data, severityCounts);

  const featuresNotTested = buildFeaturesNotTested(config);

  const defectsOpen = bugSummary.open || 0;

  const criticalCount = bugSummary.criticalOpen || 0;
  const highCount = bugSummary.highOpen || 0;
  const mediumCount = bugSummary.mediumOpen || 0;
  const lowCount = bugSummary.lowOpen || 0;
  const releaseMetrics = data.releaseMetrics;

  const criticalRaisedThisSprint = releaseMetrics.criticalRaisedThisSprint || 0;

  const highRaisedThisSprint = releaseMetrics.highRaisedThisSprint || 0;

  const mediumRaisedThisSprint = releaseMetrics.mediumRaisedThisSprint || 0;

  const lowRaisedThisSprint = releaseMetrics.lowRaisedThisSprint || 0;

  const criticalDefects = buildDefectSectionTable(sortedBugs, [
    "Critical",
    "Highest",
  ]);

  const highDefects = buildDefectSectionTable(sortedBugs, ["High"]);

  const mediumDefects = buildDefectSectionTable(sortedBugs, ["Medium"]);

  const lowDefects = buildDefectSectionTable(sortedBugs, ["Low"]);
  const defectsRaisedThisSprint = releaseMetrics.raisedThisSprint || 0;

  const openDefectsThisSprint = releaseMetrics.openThisSprint || 0;

  const closedDefectsThisSprint = releaseMetrics.closedThisSprint || 0;

  const sprintOpenRate =
    defectsRaisedThisSprint > 0
      ? ((openDefectsThisSprint / defectsRaisedThisSprint) * 100).toFixed(1)
      : "0.0";

  return {
    TITLE: `${data.metadata.product} Test Summary Report`,
    PRODUCT: data.metadata.product,
    VERSION: data.metadata.version,
    ENV: data.metadata.environment,
    DATE: new Date(data.metadata.generatedAt).toLocaleDateString(),
    FILENAME: fileName,

    // ✅ ADD THESE BACK ✅
    DIRECTOR: config.owners?.director || "N/A",
    OWNER: config.owners?.productOwner || "N/A",
    TEAM: config.owners?.qaTeam || "N/A",
    AUTHOR: config.owners?.author || "N/A",
    ARCHITECT: config.owners?.architect || "N/A",

    DOC_VERSION: data.metadata?.release || "N/A",

    // ✅ OVERALL
    TOTAL_TESTS: data.summary.total.toString() || "0",
    PASSED: data.summary.passed.toString() || "0",
    FAILED: data.summary.failed.toString() || "0",
    DEFERRED: data.summary?.skipped?.toString() || "0",
    PASS_RATE: data.summary.passRate + "%",
    OVERALL_STATUS: data.summary.overallStatus,

    TOP_RISK_AREAS:
      features
        .filter((f) => f.failed > 0)
        .map((f) => `• ${mapDomainName(f.name)} (${f.failed} failures)`)
        .join("\n") || "None",

    SPRINT_NAME: sprintInfo.name || "N/A",

    SPRINT_STATE: sprintInfo.state || "N/A",

    SPRINT_START: sprintInfo.startDate?.split("T")[0] || "N/A",

    SPRINT_END: sprintInfo.endDate?.split("T")[0] || "N/A",

    BE_TOTAL: data.backend?.result?.total?.toString() || "0",
    BE_PASSED: data.backend?.result?.passed?.toString() || "0",
    BE_FAILED: data.backend?.result?.failed?.toString() || "0",
    BE_PASS_RATE: (data.backend?.result?.passRate || 0) + "%",
    BE_STATUS: data.backend?.status || "N/A",

    FE_TOTAL: data.frontend?.result?.total?.toString() || "0",
    FE_PASSED: data.frontend?.result?.passed?.toString() || "0",
    FE_FAILED: data.frontend?.result?.failed?.toString() || "0",
    FE_PASS_RATE: (data.frontend?.result?.passRate || 0) + "%",
    FE_STATUS: data.frontend?.status || "N/A",

    CY_TOTAL: data.cypress.result.total.toString() || "0",
    CY_PASSED: data.cypress.result.passed.toString() || "0",
    CY_FAILED: data.cypress.result.failed.toString() || "0",
    CY_PENDING: data.cypress.result.pending.toString() || "0", // ✅ ADD THIS
    CY_SKIPPED: data.cypress.result.skipped.toString() || "0",
    CY_PASS_RATE: data.cypress.result.passRate + "%",
    CY_STATUS: data.cypress.status || "N/A",
    CY_FEATURES: (data.cypress?.result?.features || []).map((f) => ({
      name: mapDomainName(f.name),
      total: f.total,
      passed: f.passed,
      failed: f.failed,
      passRate: f.passRate,
    })),
    CY_FEATURES_TEXT: cyFeaturesText,

    MA_TOTAL: data.manual?.result?.total?.toString() || "0",
    MA_PASSED: data.manual?.result?.passed?.toString() || "0",
    MA_FAILED: data.manual?.result?.failed?.toString() || "0",
    MA_DEFERRED: data.manual?.result?.skipped?.toString() || "0",
    MA_PASS_RATE: (data.manual?.result?.passRate || 0) + "%",
    MA_STATUS: data.manual?.status || "N/A",

    // ✅ FAILURES
    TOP_SUBDOMAIN_FAILURES: features
      .flatMap((f) =>
        (f.subdomains || []).map((s) => ({
          domain: mapDomainName(f.name),
          name: s.name,
          failed: s.failed,
        })),
      )
      .filter((s) => s.failed > 0)
      .sort((a, b) => b.failed - a.failed)
      .slice(0, 5),

    // ✅ FEATURES
    FEATURE_DOMAINS: uniqueDomains.map((name) => ({ name })),
    FEATURE_DOMAINS_TEXT: featureDomainsText,
    FEATURES_TESTED_SCOPE: featureScope,

    FEATURES_NOT_TESTED: featuresNotTested,

    // ✅ DEFECTS
    OPEN_DEFECTS: defectsOpen,

    CRITICAL_DEFECTS: criticalDefects,
    HIGH_DEFECTS: highDefects,
    MEDIUM_DEFECTS: mediumDefects,
    LOW_DEFECTS: lowDefects,

    CRITICAL_DEFECT_COUNT: criticalCount,
    HIGH_DEFECT_COUNT: highCount,
    MEDIUM_DEFECT_COUNT: mediumCount,
    LOW_DEFECT_COUNT: lowCount,
    AVG_OPEN_DEFECT_AGE: bugSummary.avgOpenAge || 0,

    CRITICAL_DEFECT_PCT: `${bugSummary.criticalPct || 0}%`,
    HIGH_DEFECT_PCT: `${bugSummary.highPct || 0}%`,
    MEDIUM_DEFECT_PCT: `${bugSummary.mediumPct || 0}%`,
    LOW_DEFECT_PCT: `${bugSummary.lowPct || 0}%`,

    CRITICAL_DEFECTS_RAISED_THIS_SPRINT: criticalRaisedThisSprint,

    HIGH_DEFECTS_RAISED_THIS_SPRINT: highRaisedThisSprint,

    MEDIUM_DEFECTS_RAISED_THIS_SPRINT: mediumRaisedThisSprint,

    LOW_DEFECTS_RAISED_THIS_SPRINT: lowRaisedThisSprint,

    CRITICAL_DEFECTS_RAISED_THIS_SPRINT_PCT: `${releaseMetrics.criticalRaisedPct || 0}%`,

    HIGH_DEFECTS_RAISED_THIS_SPRINT_PCT: `${releaseMetrics.highRaisedPct || 0}%`,

    MEDIUM_DEFECTS_RAISED_THIS_SPRINT_PCT: `${releaseMetrics.mediumRaisedPct || 0}%`,

    LOW_DEFECTS_RAISED_THIS_SPRINT_PCT: `${releaseMetrics.lowRaisedPct || 0}%`,

    DEFECTS_RAISED_THIS_SPRINT: defectsRaisedThisSprint,

    OPEN_DEFECTS_THIS_SPRINT: openDefectsThisSprint,

    CLOSED_DEFECTS_THIS_SPRINT: closedDefectsThisSprint,

    SPRINT_OPEN_DEFECT_RATE: `${sprintOpenRate}%`,

    // ✅ INSIGHTS
    SUMMARY_INSIGHT: summaryInsight,

    DEFECT_SUMMARY_TEXT: defectSummaryText,
    DEFECT_NOTE: defectNote,
    CONCLUSION_TEXT: conclusion,
  };
}

function buildConclusion(
  data: TestSummaryReportData,
  defects: DefectSummaryCounts,
): string {
  const total = data.summary?.total || 0;
  const passed = data.summary?.passed || 0;
  const passRate = data.summary?.passRate || 0;

  const c = defects.critical || 0;
  const h = defects.high || 0;
  const m = defects.medium || 0;
  const l = defects.low || 0;

  const totalOpen = c + h + m + l;

  const lines: string[] = [];

  lines.push(
    `Test execution completed with ${passed.toLocaleString()} of ${total.toLocaleString()} tests passing, achieving a pass rate of ${passRate}%.`,
  );

  if (totalOpen === 0) {
    lines.push("No open defects remain following completion of testing.");
  } else {
    const defectTypes: string[] = [];

    if (c > 0) defectTypes.push(`${c} Critical`);
    if (h > 0) defectTypes.push(`${h} High`);
    if (m > 0) defectTypes.push(`${m} Medium`);
    if (l > 0) defectTypes.push(`${l} Low`);

    lines.push(
      `The current defect position consists of ${totalOpen} open defects (${defectTypes.join(", ")}).`,
    );
  }

  lines.push("");

  if (c > 0) {
    lines.push(
      "The system is not recommended for release due to the presence of unresolved Critical defects which present a significant risk to quality and operational stability.",
    );
  } else if (h > 0) {
    lines.push(
      "The system carries an elevated level of risk due to unresolved High severity defects and should be reviewed before release approval is granted.",
    );
  } else if (m > 0) {
    lines.push(
      "No Critical or High severity defects remain open. The system is considered stable with only Medium and Low severity defects outstanding.",
    );
  } else {
    lines.push(
      "The system is considered stable and suitable for release with no significant defects outstanding.",
    );
  }

  lines.push("");

  lines.push(
    "Testing combined automated (Cypress), backend, frontend and manual approaches to validate key business workflows, integrations and user journeys across the defined test scope.",
  );

  lines.push(
    "Overall, the solution has been assessed against the agreed quality objectives and the results of this test phase are reflected in the recommendations provided above.",
  );

  return lines.join("\n");
}

interface DefectSummaryCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

function buildDefectSummaryText(summary: DefectSummaryCounts): string {
  const c = summary.critical || 0;
  const h = summary.high || 0;
  const m = summary.medium || 0;
  const l = summary.low || 0;

  const totalOpen = c + h + m + l;

  if (totalOpen === 0) {
    return "There are currently no open defects.";
  }

  const defectTypes: string[] = [];

  if (c > 0) defectTypes.push(`${c} Critical`);
  if (h > 0) defectTypes.push(`${h} High`);
  if (m > 0) defectTypes.push(`${m} Medium`);
  if (l > 0) defectTypes.push(`${l} Low`);

  return `There are currently ${totalOpen} open defects consisting of ${defectTypes.join(", ")}.`;
}

function buildDefectSectionTable(
  bugs: BugMetric[],
  severities: string[],
): string {
  const filtered = bugs
    .filter((b) => severities.includes(b.severity))
    .sort((a, b) => {
      const severityDiff =
        getSeverityRank(a.severity) - getSeverityRank(b.severity);
      return severityDiff !== 0 ? severityDiff : b.daysOpen - a.daysOpen;
    });

  const count = filtered.length;

  if (count === 0) {
    return "No Defects";
  }

  const keyWidth = 10;
  const titleWidth = 63;

  // let output = `Number of open defects: ${count}\n\n`;

  // // ✅ Keep only this summary line

  // ✅ Table header
  let output = "";
  output += `${"Jira #".padEnd(keyWidth)} Title\n`;
  output += `${"-".repeat(keyWidth)} ${"-".repeat(titleWidth)}\n`;

  // ✅ Rows
  const rows = filtered.map((b) => {
    const key = b.key.substring(b.key.lastIndexOf("/") + 1);

    let title = b.summary || "";
    if (title.length > titleWidth) {
      title = title.substring(0, titleWidth - 3) + "...";
    }

    return `${key.padEnd(keyWidth)} ${title.padEnd(titleWidth)} `;
  });

  output += rows.join("\n");

  return output;
}

// function buildDefectSection(
//    bugs: any[],
//    severities: string[],
//    title: string
// ) {
//    const items = bugs
//       .filter(b => severities.includes(b.severity))
//       .map(b => ({
//          key: b.key.substring(b.key.lastIndexOf("/") + 1),
//          text: b.summary
//       }));

//    if (items.length === 0) return null;

//    return { title, items };
// }

function mapDomainName(name: string): string {
  const map: Record<string, string> = {
    patients: "Patient Management",
    cases: "Case Management",
    users: "User and Role Management",
    login: "Login and Authentication",
    reports: "Reporting and Analytics",
    serviceprovider: "Service Provider Management",
    integrations: "System Integrations",
    timeline: "Timeline and Audit Functionality",
    meds: "Clinical and Medication Workflows",
    api: "API and Backend Services",
    inprogress: "In-Progress Workflows",
  };

  return map[name] || name;
}

function getSeverityRank(severity: string): number {
  const map: Record<string, number> = {
    Highest: 1,
    High: 2,
    Medium: 3,
    Low: 4,
  };

  return map[severity] || 5;
}

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + word).length > maxWidth) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines;
}

function formatDefectTable(
  bugs: BugMetric[],
  severities: string[],
  title: string,
): string {
  const filtered = bugs
    .filter((b) => severities.includes(b.severity))
    .sort((a, b) => {
      const severityDiff =
        getSeverityRank(a.severity) - getSeverityRank(b.severity);
      return severityDiff !== 0 ? severityDiff : b.daysOpen - a.daysOpen;
    });

  const count = filtered.length;

  // ✅ Summary block
  let output = `${title} \n`;
  output += `Number of open defects: ${count} \n\n`;

  if (count === 0) {
    output += "No defects\n\n";
    return output;
  }

  // ✅ Table headers (aligned)
  const header =
    `Defect # | Title | Severity | Days Open\n` +
    `--------------------------------------------------------- `;

  const rows = filtered.map((b) => {
    const key = b.key.substring(b.key.lastIndexOf("/") + 1);
    const title = b.summary;
    const severity = b.severity;
    const days = b.daysOpen;

    return `${key.padEnd(10)} | ${title.padEnd(50)} | ${severity.padEnd(8)} | ${days} `;
  });

  output += header + "\n";
  output += rows.join("\n") + "\n\n";

  return output;
}

function buildFeatureScope(data: TestSummaryReportData): string {
  const domains = data.cypress?.result?.features || [];

  if (domains.length === 0) {
    return "No feature-level data available for this test phase.";
  }

  return `The scope of testing for this phase focused on validating the functionality, stability and integration of key business processes across the Elevate application.
Testing activities included a combination of automated and manual approaches, covering core user journeys, data processing, system integrations and business workflows. 

The areas tested during this phase are listed below and represent the agreed scope defined within the Project Test Plan.`;
}

function buildFeaturesNotTested(config: CleoConfig): string {
  const features = config.testing?.featuresNotTested || [];

  if (features.length === 0) {
    return "All identified features were tested during this release.";
  }

  return `The following features or functional areas were excluded from the scope of this test phase.
These areas may be subject to separate testing activities, future releases, or were considered out of scope for the objectives defined within the current test plan.

${features.map((f: string) => `• ${f}`).join("\n")}`;
}
