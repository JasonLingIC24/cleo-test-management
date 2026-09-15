import fs from "fs";
import path from "path";
import { getConfig } from "./configService.js";
import { parseManualResults } from "../parser/manualResultsParser.js";
import { configAccess } from "./configAccessService.js";
import type { CompleteResults, ManualResult } from "../models/testModels.js";
import { buildBaseName } from "../utils/fileNaming.js";
import { calculateKPI } from "../utils/kpi.js";
import type { ResultSummary } from "../models/testModels.js";

const EMPTY_MANUAL_RESULTS: ManualResult = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  na: 0,
  passRate: 0,
  features: [],
};

export async function generateCompleteTestResults(inputs?: {
  backend?: any;
  frontend?: any;
  cypress?: any;
}): Promise<CompleteResults> {
  const config = getConfig();
  const outputPath = configAccess.getCompleteResultsPath();

  // ✅ ensure output dir exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  /* ===============================
     LOAD INPUTS
  =============================== */

  const backendRaw = inputs?.backend ?? {};
  const frontendRaw = inputs?.frontend ?? {};
  const cypressRaw = inputs?.cypress ?? {};

  console.log("📊 Aggregating sources:", {
    backend: backendRaw?.total ?? 0,
    frontend: frontendRaw?.total ?? 0,
    cypress: cypressRaw?.stats?.tests ?? 0,
  });

  /* ===============================
     LOAD MANUAL RESULTS
  =============================== */
  let manualResults = EMPTY_MANUAL_RESULTS;

  const manualPath = path.join(
    configAccess.getManualResults(),
    `${buildBaseName(config)}-manual-tests.xlsx`,
  );

  console.log("📊 Loading manual test results from Excel:");
  console.log(`📊 Manual results file: ${manualPath}`);

  if (fs.existsSync(manualPath)) {
    try {
      manualResults = await parseManualResults(manualPath);
      console.log("✅ Manual results loaded");
    } catch (err) {
      console.error("❌ Manual Excel parsing failed:", err);
      manualResults = EMPTY_MANUAL_RESULTS;
    }
  } else {
    console.warn("⚠️ Manual results missing — skipping");
  }

  /* ===============================
     PARSE DATA
  =============================== */

  const backendParsed = normalise(backendRaw);
  const frontendParsed = normalise(frontendRaw);

  // ✅ Cypress
  const cypressStats = cypressRaw?.stats ?? {
    tests: 0,
    passes: 0,
    failures: 0,
    skipped: 0,
    pending: 0,
  };

  const pending = cypressStats.pending ?? 0;
  const rawSkipped = cypressStats.skipped ?? 0;

  const totalSkipped = rawSkipped + pending;
  const cypressParsed = {
    total: cypressStats.tests,
    passed: cypressStats.passes,
    failed: cypressStats.failures,
    skipped: totalSkipped,
    pending: pending,
  };

  /* ===============================
     CALCULATE KPIs
  =============================== */

  const backendKpi = calculateKPI(
    backendParsed.total,
    backendParsed.passed,
    backendParsed.failed,
    backendParsed.skipped,
  );

  const frontendKpi = calculateKPI(
    frontendParsed.total,
    frontendParsed.passed,
    frontendParsed.failed,
    frontendParsed.skipped,
  );

  const manualKpi = calculateKPI(
    manualResults.total,
    manualResults.passed,
    manualResults.failed,
    manualResults.skipped,
  );

  const cypressKpi = calculateKPI(
    cypressParsed.total,
    cypressParsed.passed,
    cypressParsed.failed,
    cypressParsed.skipped,
  );

  /* ===============================
     DOMAIN EXTRACTION
  =============================== */

  const backendDomains = extractBackendDomains(backendRaw);

  if (!backendDomains.length && backendParsed.total > 0) {
    backendDomains.push({
      name: "backend",
      ...calculateKPI(
        backendParsed.total,
        backendParsed.passed,
        backendParsed.failed,
        backendParsed.skipped,
      ),
    });
  }
  const cypressDomains = extractCypressDomains(cypressRaw);

  /* ===============================
     BUILD RESULTS
  =============================== */

  const overallTotal =
    backendKpi.total + frontendKpi.total + cypressKpi.total + manualKpi.total;

  const overallPassed =
    backendKpi.passed +
    frontendKpi.passed +
    cypressKpi.passed +
    manualKpi.passed;

  const overallFailed =
    backendKpi.failed +
    frontendKpi.failed +
    cypressKpi.failed +
    manualKpi.failed;

  const overallSkipped =
    backendKpi.skipped +
    frontendKpi.skipped +
    cypressKpi.skipped +
    manualKpi.skipped;

  const overallKpi: ReturnType<typeof calculateKPI> = {
    total: overallTotal,
    passed: overallPassed,
    failed: overallFailed,
    skipped: overallSkipped,
    passRate:
      overallTotal > 0
        ? Number(((overallPassed / overallTotal) * 100).toFixed(1))
        : 0,
    status:
      overallTotal === 0
        ? "skipped"
        : overallFailed > 0
          ? "failed"
          : overallPassed === 0
            ? "skipped"
            : "passed",
  };

  const result: CompleteResults = {
    metadata: {
      product: config.product.name,
      version: config.release.version,
      environment: config.release.environment,
      release: config.release.release,
      buildNumber: config.release.buildNumber,
      generatedAt: new Date().toISOString(),
    },

    summary: {
      totals: {
        backend: backendKpi.total,
        frontend: frontendKpi.total,
        cypress: cypressKpi.total,
        manual: manualKpi.total,
      },
      overallStatus: overallKpi.status,
      total: overallKpi.total,
      passed: overallKpi.passed,
      failed: overallKpi.failed,
      skipped: overallKpi.skipped,
      passRate: overallKpi.passRate,
    },

    backend: {
      status: backendKpi.status,
      result: {
        total: backendKpi.total,
        passed: backendKpi.passed,
        failed: backendKpi.failed,
        skipped: backendKpi.skipped,
        passRate: backendKpi.passRate,
        features: backendDomains,
      },
    },

    frontend: {
      status: frontendKpi.status,
      result: {
        total: frontendKpi.total,
        passed: frontendKpi.passed,
        failed: frontendKpi.failed,
        skipped: frontendKpi.skipped,
        passRate: frontendKpi.passRate,
      },
    },

    cypress: {
      status: cypressKpi.status,
      result: {
        total: cypressKpi.total,
        passed: cypressKpi.passed,
        failed: cypressKpi.failed,
        skipped: totalSkipped,
        passRate: cypressKpi.passRate,
        pending: pending,
        features: cypressDomains,
      },
    },

    sources: {
      backend: backendKpi,
      frontend: frontendKpi,
      cypress: cypressKpi,
      manual: manualKpi,
    },

    manual: {
      status: manualKpi.status,
      result: {
        total: manualKpi.total,
        passed: manualKpi.passed,
        failed: manualKpi.failed,
        skipped: manualKpi.skipped,
        passRate: manualKpi.passRate,
        na: manualResults.na ?? 0,
        features: manualResults.features ?? [],
      },
    },
  };
  /* ===============================
     WRITE FILE ✅ (IMPORTANT FIX)
  =============================== */
  if (overallTotal === 0) {
    console.warn("⚠️ No test results found across all sources");
  }
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

  console.log(`✅ Complete test results written: ${outputPath}`);

  return result;
}
function extractTagsFromContext(contextStr: string | undefined) {
  if (!contextStr) return null;

  try {
    // ✅ STEP 1: REMOVE BASE64 IMAGE BLOBS
    const cleaned = contextStr
      .replace(/data:image\/png;base64,[^"]+/g, "") // ✅ CRITICAL FIX
      .replace(/\n/g, "")
      .replace(/\r/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) return null;

    const tagsEntry = parsed.find(
      (c: any) => c.title === "tags" && Array.isArray(c.value),
    );

    if (!tagsEntry) return null;

    let domain = "Unmapped"; // ✅ better than Unknown
    let subdomain = "-";

    for (const tag of tagsEntry.value) {
      if (tag.includes("@domain:")) {
        domain = tag.split("@domain:")[1]?.trim();
      }

      if (tag.includes("@subdomain:")) {
        subdomain = tag.split("@subdomain:")[1]?.trim();
      }
    }

    return { domain, subdomain };
  } catch (err) {
    console.warn("❌ Failed to parse CLEANED context");
    return null;
  }
}

function extractTagsFromTitle(title: string | undefined) {
  let domain = "Unmapped";
  let subdomain = "-";

  if (!title) {
    return { domain, subdomain };
  }

  const domainMatch = title.match(/@domain:([^\s]+)/i);
  if (domainMatch) {
    domain = domainMatch[1].trim();
  }

  const subdomainMatch = title.match(/@subdomain:([^\s]+)/i);
  if (subdomainMatch) {
    subdomain = subdomainMatch[1].trim();
  }

  return { domain, subdomain };
}

function walkSuites(suite: any, domains: any) {
  if (!suite) return;

  // ✅ process tests at THIS level
  if (suite.tests && suite.tests.length > 0) {
    for (const test of suite.tests) {
      let domain = "Unmapped";
      let subdomain = "-";

      // ✅ 1. try context (BEST SOURCE)
      const fromContext = extractTagsFromContext(test.context);

      if (fromContext) {
        domain = fromContext.domain;
        subdomain = fromContext.subdomain;
      } else {
        // ✅ FALLBACK (CRITICAL FIX)
        const fromTitle = extractTagsFromTitle(
          test.title || test.fullTitle || "",
        );

        domain = fromTitle.domain;
        subdomain = fromTitle.subdomain;
      }

      // ✅ INIT DOMAIN
      if (!domains[domain]) {
        domains[domain] = {
          name: domain,
          total: 0,
          passed: 0,
          failed: 0,
          subdomains: {},
        };
      }

      // ✅ INIT SUBDOMAIN
      if (!domains[domain].subdomains[subdomain]) {
        domains[domain].subdomains[subdomain] = {
          name: subdomain,
          total: 0,
          passed: 0,
          failed: 0,
        };
      }

      domains[domain].total++;
      domains[domain].subdomains[subdomain].total++;

      if (test.state === "passed") {
        domains[domain].passed++;
        domains[domain].subdomains[subdomain].passed++;
      } else if (test.state === "failed") {
        domains[domain].failed++;
        domains[domain].subdomains[subdomain].failed++;
      }
    }
  }

  // ✅ RECURSE INTO CHILD SUITES (THIS IS THE KEY FIX)
  if (suite.suites && suite.suites.length > 0) {
    for (const child of suite.suites) {
      walkSuites(child, domains);
    }
  }
}

function extractCypressDomains(cypressRaw: any) {
  const domains: Record<string, any> = {};

  const results = cypressRaw?.results || [];

  for (const run of results) {
    walkSuites(run, domains); // ✅ START FROM ROOT
  }

  return Object.values(domains)
    .filter((d: any) => d.name !== "Unmapped") // ✅ REMOVE NOISE
    .map((d: any) => {
      const subdomainList = Object.values(d.subdomains || {});

      // ✅ remove "-" placeholder if it's the only subdomain
      const cleanedSubdomains =
        subdomainList.length === 1 && (subdomainList[0] as any).name === "-"
          ? []
          : subdomainList;

      const kpi = calculateKPI(d.total, d.passed, d.failed);

      return {
        name: d.name,
        ...kpi,
        subdomains: cleanedSubdomains.map((s: any) => {
          const subKpi = calculateKPI(s.total, s.passed, s.failed);

          return {
            name: s.name,
            ...subKpi,
          };
        }),
      };
    });
}

function getBackendDomain(suiteName: string): string {
  if (!suiteName) return "other";

  const name = suiteName.toLowerCase();

  if (name.includes("adapters")) return "adapters";
  if (name.includes("api")) return "api";
  if (name.includes("authentication")) return "authentication";
  if (name.includes("operation")) return "operations";
  if (name.includes("util")) return "utilities";
  if (name.includes("model") || name.includes("fhir")) return "domain-models";
  if (name.includes("integration")) return "integration";

  return "services";
}

function extractBackendDomains(backendRaw: any) {
  const domains: Record<string, any> = {};

  const suites = backendRaw?.suites || [];

  for (const suite of suites) {
    const domainName = getBackendDomain(suite.name);

    if (!domains[domainName]) {
      domains[domainName] = {
        name: domainName,
        total: 0,
        passed: 0,
        failed: 0,
      };
    }

    domains[domainName].total += suite.total ?? 0;
    domains[domainName].passed += suite.passed ?? 0;
    domains[domainName].failed += suite.failed ?? 0;
  }

  // ✅ convert to same structure as Cypress
  return Object.values(domains).map((d: any) => {
    const kpi = calculateKPI(d.total, d.passed, d.failed);

    return {
      name: d.name,
      ...kpi,
    };
  });
}

function normalise(input: unknown): ResultSummary {
  const source = input as Record<string, unknown>;

  return {
    total: Number(source.total ?? 0),
    passed: Number(source.passed ?? 0),
    failed: Number(source.failed ?? 0),
    skipped: Number(source.skipped ?? 0),
  };
}
