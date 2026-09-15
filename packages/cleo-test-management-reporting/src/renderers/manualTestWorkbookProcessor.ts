import * as fs from "fs";
import * as path from "path";
import ExcelJS from "exceljs";
import { buildBaseName } from "../utils/fileNaming.js";
import { mapManualToFeatureReports } from "../services/manualToFeatureWrapper.js";
import { toExcel } from "../renderers/toExcel.js";
import { toGherkinFiles } from "../renderers/toGherkin.js";
import { buildStandardName } from "../utils/naming.js";

interface GherkinScenario {
  domain: string;
  scenarioTitle: string;
  steps: string[];
  givenColSteps: string[];
  whenColSteps: string[];
  thenColSteps: string[];
}

interface SheetFeatureMap {
  [sheetName: string]: GherkinScenario[];
}

export class ManualTestWorkbookProcessor {

  // ✅ MAIN ENTRY POINT
  async processWorkbook(
    inputPath: string,
    outputFeaturesDir: string,
    manualOutputDir: string,
    config: any
  ): Promise<void> {

    console.log(`🚀 Processing manual workbook: ${inputPath}`);

    // ✅ 1. Extract
    const structuredData = await this.extractWorkbookData(inputPath);

    // ✅ 2. Transform
    const features = mapManualToFeatureReports(structuredData);

    // ✅ 3. Output
    await this.writeExcel(features, manualOutputDir, config);
    this.writeGherkin(features, outputFeaturesDir, config);

    console.log("✅ Manual processing complete");
  }

  // -----------------------------------
  // ✅ EXTRACTION
  // -----------------------------------

  private async extractWorkbookData(inputPath: string): Promise<SheetFeatureMap> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(inputPath);

    const structuredData: SheetFeatureMap = {};

    workbook.eachSheet((worksheet) => {
      const sheetName = worksheet.name.trim();

      if (this.shouldSkipSheet(sheetName)) return;

      structuredData[sheetName] = this.extractSheet(worksheet, sheetName);
    });

    return structuredData;
  }

  private extractSheet(worksheet: any, sheetName: string): GherkinScenario[] {
    const scenarios: GherkinScenario[] = [];

    let currentScenario: GherkinScenario | null = null;
    let foundHeader = false;

    worksheet.eachRow((row: any) => {

      const getVal = (col: number): string => {
        const v = row.getCell(col).value;
        if (!v) return "";

        if (typeof v === "object" && "result" in v) {
          return String(v.result ?? "").trim();
        }

        return String(v).trim();
      };

      if (!foundHeader) {
        if (this.isHeaderRow(getVal)) {
          foundHeader = true;
        }
        return;
      }

      const scenarioTitle = getVal(1);

      const stepData = this.parseSteps(
        getVal(2),
        getVal(3),
        getVal(4)
      );

      if (scenarioTitle) {
        currentScenario = {
          domain: sheetName,
          scenarioTitle,
          ...stepData
        };

        scenarios.push(currentScenario);
      } else if (currentScenario) {
        this.appendSteps(currentScenario, stepData);
      }
    });

    return scenarios;
  }

  // -----------------------------------
  // ✅ OUTPUT
  // -----------------------------------

  private async writeExcel(features: any[], outputDir: string, config: any) {

    fs.mkdirSync(outputDir, { recursive: true });

    const baseName = buildBaseName(config);

    await toExcel(features, {
      reportOutput: outputDir,
      fileName: `${baseName}-manual-tests.xlsx`,
      product: config.product.name,
      version: config.release.version,
      environment: config.release.environment,
      release: config.release.release,
      buildNumber: config.release.buildNumber,
      team: config.owners.qaTeam
    });
  }

  private writeGherkin(features: any[], outputDir: string, config: any) {

    const baseName = buildBaseName(config);
    const files = toGherkinFiles(features, baseName);

    for (const feature of features) {

      const fileName = buildStandardName({
        baseName,
        feature: feature.name
      });

      const content = files[fileName];
      if (!content) continue;

      const dir = this.buildFeatureDir(
        outputDir,
        feature.domain ?? "manual",
        feature.subdomain
      );

      fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(
        path.join(dir, fileName),
        content,
        "utf8"
      );
    }
  }

  // -----------------------------------
  // ✅ HELPERS
  // -----------------------------------

  private shouldSkipSheet(name: string): boolean {
    const n = name.toLowerCase();

    return [
      "summary",
      "dashboard",
      "stats",
      "test plan",
      "appendix",
      "trigger",
      "scenario",
      "execution"
    ].some(s => n.includes(s));
  }

  private isHeaderRow(getVal: (col: number) => string): boolean {
    return (
      getVal(1).toLowerCase().includes("domain") &&
      getVal(2).toLowerCase().includes("given") &&
      getVal(3).toLowerCase().includes("when") &&
      getVal(4).toLowerCase().includes("then")
    );
  }

  private parseSteps(given: string, when: string, then: string) {

    const steps: string[] = [];
    const givenArr: string[] = [];
    const whenArr: string[] = [];
    const thenArr: string[] = [];

    const parse = (text: string, target: string[]) => {
      text.split("\n").forEach(line => {
        const t = line.trim();
        if (!t) return;

        steps.push(t);
        target.push(t);
      });
    };

    parse(given, givenArr);
    parse(when, whenArr);
    parse(then, thenArr);

    return {
      steps,
      givenColSteps: givenArr,
      whenColSteps: whenArr,
      thenColSteps: thenArr
    };
  }

  private appendSteps(target: GherkinScenario, steps: any) {
    target.steps.push(...steps.steps);
    target.givenColSteps.push(...steps.givenColSteps);
    target.whenColSteps.push(...steps.whenColSteps);
    target.thenColSteps.push(...steps.thenColSteps);
  }

  private buildFeatureDir(
    baseDir: string,
    domain: string,
    subdomain?: string
  ) {
    const domainSafe = domain.replace(/\s+/g, "-").toLowerCase();

    if (subdomain) {
      return path.join(baseDir, domainSafe, subdomain.toLowerCase());
    }

    return path.join(baseDir, domainSafe);
  }
}
