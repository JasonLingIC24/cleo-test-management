import { Project } from "ts-morph";
import { parseSpec } from "cleo-cypress-bdd";
import { ingestParsedSpec } from "cleo-domain";
import fs from "fs";
import path from "path";
import type { FeatureReport } from "../models/reportModels.js";
import { toGherkinFiles } from "../renderers/toGherkin.js";
import { toExcel } from "../renderers/toExcel.js";
import { featureToReport, buildSummary } from "../adapters/featureToReport.js";
import { configAccess } from "../services/configAccessService.js";
import { buildBaseName } from "../utils/fileNaming.js";
import { getConfig } from "../services/configService.js";
import { buildStandardName } from "../utils/naming.js";

type RunOptions = {
  format: "excel" | "gherkin" | "cli" | "json";
  excelConfig?: any;
  outputDir?: string; // ✅ ADD THIS
};

export async function run(
  specPaths: string[],
  options: RunOptions = { format: "cli" },
) {
  const baseOutputDir = options.outputDir || configAccess.getReportsRoot();

  const project = new Project({ useInMemoryFileSystem: false });

  const features = [];

  for (const specPath of specPaths) {
    const sourceFile = project.addSourceFileAtPath(specPath);
    const parsed = parseSpec(sourceFile, specPath);
    const feature = ingestParsedSpec(parsed) as any;

    // ✅ attach file path safely
    feature.file = specPath;
    features.push(feature);
  }

  const reports = features.map(featureToReport);
  const summary = buildSummary(reports);

  const format = options?.format ?? "cli";

  switch (format) {
    case "json":
      outputJson(summary, reports, baseOutputDir);
      break;

    case "excel": {
      const cleanReports = dedupeFeatures(reports);

      const groupedByDomain: Record<string, any[]> = {};

      for (const feature of cleanReports) {
        const domain = feature.domain ?? "general";

        if (!groupedByDomain[domain]) {
          groupedByDomain[domain] = [];
        }

        groupedByDomain[domain].push(feature);
      }

      const fullConfig = getConfig();
      const baseName = buildBaseName(fullConfig);

      const outputDir = path.join(baseOutputDir, "excel");
      fs.mkdirSync(outputDir, { recursive: true });

      for (const [domain, features] of Object.entries(groupedByDomain)) {
        const domainSafe = domain.replace(/\s+/g, "-").toLowerCase();

        const fileName = `${baseName}-${domainSafe}.xlsx`;

        await toExcel(features, {
          reportOutput: outputDir,
          fileName,
          product: fullConfig.product.name,
          version: fullConfig.release.version,
          environment: fullConfig.release.environment,
          release: fullConfig.release.release,
          buildNumber: fullConfig.release.buildNumber,
          team: fullConfig.owners.qaTeam,
        });

        console.log(`✅ Excel created: ${fileName}`);
      }

      break; // ✅ IMPORTANT
    }

    case "gherkin": {
      const featureOutputDir = baseOutputDir;
      fs.mkdirSync(featureOutputDir, { recursive: true });

      const cfg = getConfig();
      const baseName = buildBaseName(cfg);

      const files = toGherkinFiles(reports, baseName);

      for (const feature of reports) {
        const fileName = buildStandardName({
          baseName,
          feature: feature.name,
        });

        const content = files[fileName];

        if (!content) {
          console.warn(`⚠️ Missing gherkin content for: ${fileName}`);
          continue;
        }

        // ✅ ✅ FIXED DOMAIN LOGIC
        const domain = (feature.domain ?? "general").toLowerCase();
        const subdomain = feature.subdomain
          ? feature.subdomain.toLowerCase()
          : undefined;

        const domainSafe = domain.replace(/\s+/g, "-");

        const dir = subdomain
          ? path.join(featureOutputDir, domainSafe, subdomain)
          : path.join(featureOutputDir, domainSafe);

        fs.mkdirSync(dir, { recursive: true });

        const filePath = path.join(dir, fileName);
        fs.writeFileSync(filePath, content, "utf8");
      }

      console.log(`✅ Gherkin files written`);
      break;
    }

    case "cli":
    default:
      printSummary(summary);
      printFeatures(reports);
  }

  return {
    summary,
    features: reports,
  };
}

function printSummary(summary: any) {
  console.log("=== Test Summary ===");
  console.log(`Features: ${summary.featureCount}`);
  console.log(`Scenarios: ${summary.scenarioCount}`);
  console.log(`Steps: ${summary.stepCount}`);
  console.log("By domain:");

  for (const [domain, count] of Object.entries(summary.domains)) {
    console.log(`  ${domain}: ${count}`);
  }
}

function printFeatures(reports: FeatureReport[]) {
  for (const r of reports) {
    console.log(`\nFeature: ${r.name}`);

    for (const scenario of r.scenarios) {
      console.log(`  • ${scenario.title}`);
    }
  }
}

function outputJson(
  summary: any,
  reports: FeatureReport[],
  baseOutputDir: string,
) {
  const outputPath = path.join(baseOutputDir, "json", "report.json");

  console.log(`✅ Writing JSON report to: ${outputPath}`);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  fs.writeFileSync(
    outputPath,
    JSON.stringify({ summary, features: reports }, null, 2),
  );

  console.log(`✅ JSON report created: ${outputPath}`);
}

export async function runReportingFromData(
  reports: FeatureReport[],
  options: {
    fileName: string;
    outputDir: string;
    excelConfig?: any;
  },
) {
  await toExcel(reports, {
    ...options.excelConfig,
    reportOutput: options.outputDir,
    fileName: options.fileName,
  });
}

function groupBySubdomain(features: FeatureReport[]) {
  const map: Record<string, FeatureReport[]> = {};

  for (const f of features) {
    const key = f.subdomain ?? "general";
    if (!map[key]) map[key] = [];
    map[key].push(f);
  }

  return map;
}

function dedupeFeatures(features: FeatureReport[]) {
  const seen = new Set<string>();
  const result: FeatureReport[] = [];

  for (const f of features) {
    const key = `${f.name}-${f.subdomain}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push(f);
    }
  }

  return result;
}
