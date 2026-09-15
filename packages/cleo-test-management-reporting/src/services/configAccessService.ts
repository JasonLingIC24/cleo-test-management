import path from "path";
import fs from "fs";
import { getConfig } from "./configService.js";
import { CleoConfig } from "../models/configModels.js";
import { GithubConfig } from "../types/github.js";

class ConfigAccessService {
  private config = getConfig();

  // =============================
  // ✅ INPUTS
  // =============================

  getCypressSpecs(): string {
    return path.resolve(this.config.input.specs);
  }

  getManualTestScript(): string {
    return path.resolve(this.config.paths.assets.manual);
  }

  // =============================
  // ✅ OUTPUT ROOTS
  // =============================

  getReportsRoot(): string {
    return path.resolve(this.config.reports.root);
  }

  // =============================
  // ✅ REPORT OUTPUTS
  // =============================

  getJsonReports(): string {
    return path.join(this.getVersionedReportsRoot(), "json");
  }

  getExecutionReports(): string {
    return path.join(this.getVersionedReportsRoot(), "execution-reports");
  }

  getDocsRoot(): string {
    return path.resolve(this.config.reports.docs);
  }

  getBugMetricsPath(): string {
    return path.join(this.getJsonReports(), "bug-metrics.json");
  }

  getBugSummaryPath(): string {
    return path.join(this.getJsonReports(), "bug-summary.json");
  }

  // =============================
  // ✅ FEATURES
  // =============================

  getOutputFeatures(): string {
    return path.join(this.getVersionedReportsRoot(), "features");
  }

  // =============================
  // ✅ RESULTS INPUTS (NEW ✅)
  // =============================

  getFrontendResults(): string {
    return path.resolve(this.config.testResults.frontend);
  }

  getBackendResults(): string {
    return path.resolve(this.config.testResults.backend);
  }

  getCypressResults(): string {
    return path.resolve(this.config.testResults.cypress);
  }

  getManualResults(): string {
    return path.resolve(this.config.testResults.manual);
  }

  getAutomatedTestResults(): string {
    return path.resolve(this.config.testResults.automated);
  }

  getAutomatedReportsDir(): string {
    return path.join(this.getVersionedReportsRoot(), "automated");
  }

  getAutomatedFeaturesDir(): string {
    return path.join(this.getOutputFeatures(), "automated");
  }

  // =============================
  // ✅ CODEMOD OUTPUT
  // =============================

  getCodemodOutput(): string {
    return path.join(this.getVersionedReportsRoot(), "codemod");
  }

  // =============================
  // ✅ JSON HELPERS
  // =============================

  getCodemodJsonReportPath(): string {
    return path.join(this.getJsonReports(), "cleo-codemod-report.json");
  }

  getCompleteResultsPath(): string {
    return path.join(this.getJsonReports(), "complete-test-results.json");
  }

  // =============================
  // ✅ ASSETS
  // =============================

  getTemplate(name: keyof CleoConfig["templates"]): string {
    const templatesDir = this.config.paths.assets.templates;
    const templateFile = this.config.templates?.[name];

    if (!templateFile) {
      throw new Error(`❌ Template not configured: ${name}`);
    }

    return path.resolve(path.join(templatesDir, templateFile));
  }

  getDocsReleaseDir(): string {
    return path.join(this.getVersionedReportsRoot(), "docs");
  }

  // =============================
  // ✅ VERSION HELPERS
  // =============================

  getReleaseVersion(): string {
    return this.config.release.version;
  }

  getVersionedReportsRoot(): string {
    const dir = path.join(this.getReportsRoot(), this.getReleaseVersion());

    fs.mkdirSync(dir, {
      recursive: true,
    });

    return dir;
  }

  getVersionedCypressSpecs(): string {
    const value = path.join(this.getCypressSpecs(), this.getReleaseVersion());
    return value;
  }

  // =============================
  // ✅ GITHUB
  // =============================

  getGithubConfig(): GithubConfig {
    const github = this.config.github;

    if (!github) {
      throw new Error("github configuration missing from cleo.config.json");
    }

    return github;
  }

  getGithubResultsRoot(): string {
    return getConfig().testResults?.github ?? "./testResults/github";
  }

  getGithubRunDirectory(runId: number): string {
    const dir = path.join(this.getGithubResultsRoot(), String(runId));

    fs.mkdirSync(dir, {
      recursive: true,
    });

    return dir;
  }

  getGithubArtifactRunDirectory(runId: number): string {
    return this.getGithubRunDirectory(runId);
  }
}

export const configAccess = new ConfigAccessService();
