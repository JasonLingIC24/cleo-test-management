import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { cleanText } from "cleo-domain";
import { buildStandardName } from "../utils/naming.js";
import { buildBaseName } from "../utils/fileNaming.js";
import { getConfig } from "../services/configService.js";
import { calculateKPI, calculateKPIFromRows } from "../utils/kpi.js";

function getOrCreateSheet(workbook: ExcelJS.Workbook, name: string) {
  let sheet = workbook.getWorksheet(name);

  if (!sheet) {
    sheet = workbook.addWorksheet(name);
  } else {
    // ✅ clear contents safely
    sheet.spliceRows(1, sheet.rowCount);
  }

  return sheet;
}

export async function generateExecutionReports(
  input: string | any,
  outputDir: string,
) {
  const config = getConfig();
  const baseName = buildBaseName(config);
  const raw =
    typeof input === "string"
      ? JSON.parse(fs.readFileSync(input, "utf8"))
      : input;

  if (!raw) {
    console.warn(
      "⚠️ No Cypress execution data available. Skipping execution report generation.",
    );

    return [];
  }

  // ✅ Step A: collect rows from mochawesome
  const rows: any[] = [];

  for (const result of raw.results || []) {
    extractTests(result, "", "", rows, result.file);
  }

  // ✅ Step B: dedupe
  const uniqueRows = new Map<string, any>();

  for (const r of rows) {
    const key = `${r.feature}|${r.scenario}|${r.title}|${r.tcId}`;
    uniqueRows.set(key, r);
  }

  const dedupedRows = Array.from(uniqueRows.values());
  const globalRows: any[] = [];

  // ✅ ✅ ✅ Step C: BUILD domainMap ← YOU WERE MISSING THIS

  const domainMap = new Map<string, any[]>();

  for (const r of dedupedRows) {
    if (!domainMap.has(r.domain)) {
      domainMap.set(r.domain, []);
    }
    domainMap.get(r.domain)!.push(r);
  }
  for (const [domain, domainRows] of domainMap.entries()) {
    const workbook = new ExcelJS.Workbook();
    const sheet = getOrCreateSheet(workbook, "Execution Results");

    // ✅ HEADER INFO
    sheet.properties.outlineLevelRow = 1;

    sheet.properties.outlineProperties = {
      summaryBelow: false, // ✅ THIS puts +/- on FEATURE row
      summaryRight: false,
    };

    globalRows.push(...domainRows);
    const domainRow = domainRows[0];

    const subdomain =
      domainRow.subdomain && !domainRow.subdomain.endsWith(".spec.ts")
        ? domainRow.subdomain
        : "";
    const cleanFile = domainRow.file ? path.basename(domainRow.file) : "";
    const titleRow = sheet.addRow([
      `Execution Results - (${domain} / ${subdomain}) `,
    ]);
    const cleanFeature =
      domainRow.title?.replace(/^Feature:\s*/i, "").trim() || "";
    sheet.mergeCells(`A${titleRow.number}:C${titleRow.number}`);

    titleRow.getCell(1).alignment = {
      horizontal: "left",
      vertical: "middle",
    };
    titleRow.getCell(1).font = {
      bold: true,
      size: 14,
      name: "Nunito Sans",
    };
    titleRow.height = 30;

    const topSeparater = sheet.addRow([]);
    for (let col = 1; col <= 7; col++) {
      topSeparater.getCell(col).fill = colour("midGrey");
    }
    topSeparater.height = 3;

    sheet.addRow(["Feature", cleanFeature]);
    sheet.addRow(["Domain", domain || ""]);
    sheet.addRow(["Subdomain", subdomain]); // ✅ NEW ROW
    sheet.addRow(["File", cleanFile]);

    [3, 4, 5, 6].forEach((row) => {
      sheet.getRow(row).alignment = {
        horizontal: "left",
        vertical: "middle",
      };

      sheet.getRow(row).font = {
        bold: true,
        size: 10,
        name: "Nunito Sans",
      };
      sheet.getRow(row).height = 20;
      sheet.mergeCells(`B${row}:C${row}`);
      //sheet.getRow(row).fill = colour("blue");
    });

    const separatorMetaRow = sheet.addRow([]);
    for (let col = 1; col <= 7; col++) {
      separatorMetaRow.getCell(col).fill = colour("midGrey");
    }
    separatorMetaRow.height = 3;

    // ✅ HEADER
    const headerRow = sheet.addRow([
      "Feature",
      "Scenario",
      "Test Case ID",
      "Step",
      "Result",
      "Duration (ms)",
      "Speed",
    ]);

    [1, 2, 3, 4, 5, 6, 7].forEach((col) => {
      if (col === 1 || col === 2 || col === 4) {
        headerRow.getCell(col).alignment = {
          horizontal: "left",
          vertical: "middle",
          indent: 1,
        };
      } else {
        headerRow.getCell(col).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      }
      headerRow.getCell(col).font = {
        bold: true,
        size: 10,
        name: "Nunito Sans",
      };
      headerRow.getCell(col).fill = colour("blue");
    });
    headerRow.height = 30;

    const separatorHeaderRow = sheet.addRow([]);
    for (let col = 1; col <= 7; col++) {
      separatorHeaderRow.getCell(col).fill = colour("midGrey");
    }
    separatorHeaderRow.height = 3;

    // ✅ GROUPING (IMPORTANT — now uses domainRows)
    const grouped = new Map<string, Map<string, any[]>>();

    for (const r of domainRows) {
      if (!grouped.has(r.feature)) {
        grouped.set(r.feature, new Map());
      }

      const scenarios = grouped.get(r.feature)!;

      if (!scenarios.has(r.scenario)) {
        scenarios.set(r.scenario, []);
      }

      scenarios.get(r.scenario)!.push(r);
    }

    // ✅ EXISTING FEATURE → SCENARIO → TEST LOOP (UNCHANGED)
    for (const [feature, scenarios] of grouped.entries()) {
      const hasFailureInFeature = Array.from(scenarios.values())
        .flat()
        .some((t) => t.result === "Fail");

      const featureRow = sheet.addRow([
        cleanLabel(feature),
        "",
        "",
        "",
        "",
        "",
      ]);
      const featureStartRow = sheet.lastRow!.number + 1;
      featureRow.getCell(1).font = {
        bold: true,
        size: 11,
      };

      featureRow.getCell(1).alignment = {
        vertical: "middle",
        horizontal: "left",
        indent: 1,
      };
      featureRow.height = 25;

      const featureColour = hasFailureInFeature
        ? colour("red") // ✅ red (failure)
        : colour("blue"); // ✅ blue (normal)

      for (let col = 1; col <= 7; col++) {
        featureRow.getCell(col).fill = featureColour;
      }

      for (const [scenario, tests] of scenarios.entries()) {
        // ✅ separator row between scenarios
        sheet.addRow(["", "", "", "", "", "", ""]);

        const separator = sheet.getRow(sheet.lastRow!.number);
        for (let col = 1; col <= 7; col++) {
          separator.getCell(col).fill = colour("midGrey");
        }
        separator.height = 3; // increase row height for spacing
        separator.getCell(1).value = "";

        const scenarioHeaderRow = sheet.addRow([
          "",
          cleanLabel(scenario),
          "",
          "",
          "",
          "",
          "",
        ]);

        sheet.mergeCells(
          `B${scenarioHeaderRow.number}:C${scenarioHeaderRow.number}`,
        );
        autoHeight(scenarioHeaderRow);
        for (let col = 2; col <= 7; col++) {
          scenarioHeaderRow.getCell(col).fill = colour("grey");
        }

        scenarioHeaderRow.getCell(2).font = {
          italic: true,
          size: 11, // ✅ slightly larger
        };

        scenarioHeaderRow.getCell(2).alignment = {
          wrapText: true,
          vertical: "top", // ✅ important (not middle)
          horizontal: "left",
          indent: 1,
        };
        //scenarioHeaderRow.height = 35; // ✅ slightly taller for readability
        autoHeight(scenarioHeaderRow);

        tests.forEach((test, index) => {
          const row = sheet.addRow([
            "",
            "", // ✅ never repeat scenario here
            test.tcId || "",
            cleanText(test.title).replace(/^(THEN|AND)\s+/i, ""),
            test.result,
            test.duration,
            test.speed || "",
          ]);

          // ✅ scenario column
          row.getCell(2).alignment = {
            wrapText: true,
            vertical: "top",
            indent: 1,
          };
          if (row.getCell(2).value) {
            row.getCell(2).font = { italic: true };
          }
          row.getCell(3).alignment = {
            horizontal: "center",
            vertical: "middle",
          };

          // ✅ step column
          row.getCell(4).alignment = {
            wrapText: true,
            vertical: "top",
            indent: 2,
          };
          row.getCell(4).alignment.wrapText = true;
          // ✅ result colors
          row.getCell(5).fill =
            test.result === "Pass"
              ? solid("FFDFF0D8")
              : test.result === "Fail"
                ? solid("FFF8D7DA")
                : solid("FFEFEFEF");

          row.getCell(5).alignment = {
            horizontal: "center",
            vertical: "middle",
          };
          row.getCell(5).font = { bold: true };
          row.getCell(6).alignment = {
            horizontal: "center",
            vertical: "middle",
          };
          row.getCell(7).alignment = {
            horizontal: "center",
            vertical: "middle",
          };

          sheet.getColumn(7).eachCell((cell: any) => {
            cell.font = { bold: true };

            if (cell.value === "slow") {
              cell.fill = colour("red");
            }
            if (cell.value === "medium") {
              cell.fill = colour("yellow");
            }
            if (cell.value === "fast") {
              cell.fill = colour("blue");
            }
          });
          const thisRow = sheet.getRow(row.number);
          autoHeight(thisRow);
        });
      }
      const featureEndRow = sheet.lastRow!.number;

      for (let r = featureStartRow; r <= featureEndRow; r++) {
        const row = sheet.getRow(r);
        row.outlineLevel = 1;

        // ✅ ONLY collapse if feature has NO failures
        if (!hasFailureInFeature) {
          row.hidden = true; // collapsed ✅
        } else {
          row.hidden = false; // expanded ✅
        }
        // const featureColour = hasFailureInFeature
        //     ? colour("red")      // strong signal ❌
        //     : colour("blue");    // normal ✅
        // if (hasFailureInFeature) {
        //     featureRow.getCell(1).font = {
        //         bold: true,
        //         size: 11
        //     };
        //     featureRow.getCell(1).fill = featureColour;
        // }
      }
    }

    // ✅ COLUMN WIDTHS
    sheet.columns = [
      { width: 45 },
      { width: 45 },
      { width: 20 },
      { width: 65 },
      { width: 12 },
      { width: 15 },
      { width: 12 }, // ✅ new column for Speed
    ];
    // sheet.getColumn(1).alignment = { wrapText: true };
    // sheet.getColumn(2).alignment = { wrapText: true };
    // sheet.getColumn(4).alignment = { wrapText: true };
    // ✅ OUTPUT PATH
    // ✅ define output directory FIRST
    const dir = subdomain
      ? path.join(outputDir, domain, subdomain)
      : path.join(outputDir, domain);

    fs.mkdirSync(dir, { recursive: true });

    // ✅ proper feature name (NOT domain)
    const featureName = domainRows[0]?.feature ?? domain;

    // ✅ build standard name (NO extension)
    const name = buildStandardName({
      baseName,
      domain,
      subdomain,
      feature: featureName,
      extension: "",
    });

    // ✅ correct file path
    const filePath = path.join(dir, `${name}.xlsx`);

    buildSummarySheet(workbook, domainRows);
    buildRunInfoSheet(workbook, domainRows, domain, subdomain);
    //buildKpiSheets(workbook, domainRows);

    const summary = workbook.getWorksheet("Execution Summary");

    if (summary) {
      const index = workbook.worksheets.indexOf(summary);
      workbook.worksheets.splice(index, 1);
      workbook.worksheets.unshift(summary);
    }
    await workbook.xlsx.writeFile(filePath);
    console.log(`✅ Mochawesome Excel: ${filePath}`);

    const jiraContent = buildJiraSummary(domainRows);
    const jiraPath = path.join(dir, `${name}.jira.txt`);
    fs.writeFileSync(jiraPath, jiraContent);
    console.log(`✅ Jira Summary: ${jiraPath}`);
  }
  // ✅ ================================
  // ✅ ✅ OVERALL EXECUTION DASHBOARD
  // ✅ ================================

  // 1. Create workbook
  const overviewWorkbook = new ExcelJS.Workbook();

  // 2. Build dashboard FIRST
  buildOverallDashboard(overviewWorkbook, globalRows);

  // 3. Ensure directory exists
  const overviewDir = path.join(outputDir);
  fs.mkdirSync(overviewDir, { recursive: true });

  // 4. Define file path
  const overviewPath = path.join(overviewDir, "cypress-results-overview.xlsx");

  // 5. Write file
  await overviewWorkbook.xlsx.writeFile(overviewPath);

  // 6. Log
  console.log(`✅ Overview Dashboard: ${overviewPath}`);

  return dedupedRows;
}

function buildJiraSummary(rows: any[]) {
  const featureMap = new Map<string, any[]>();

  for (const r of rows) {
    if (!featureMap.has(r.feature)) {
      featureMap.set(r.feature, []);
    }
    featureMap.get(r.feature)!.push(r);
  }

  let output = "";

  output += `h2. Execution Summary\n\n`;
  //  `Total Tests: The sum of all individual test cases executed during the run,\n`
  //  `Passes: The number of tests that successfully completed all steps and assertions,\n`
  //  `Failures: The number of tests that encountered an error or a failed assertion,\n`
  //  `Skipped: The number of tests that were purposely ignored or marked to not run (often denoted by .skip in Cypress).\n\n`;

  const raw = calculateKPIFromRows(rows);

  const kpi = calculateKPI(raw.total, raw.passed, raw.failed, raw.skipped);

  output += `*Total Tests:* ${kpi.total}\n`;
  output += `*Passed:* ${kpi.passed}\n`;
  output += `*Failed:* ${kpi.failed}\n`;
  output += `*Pass Rate:* ${kpi.passRate.toFixed(0)}%\n\n`;

  output += "|| Feature || Total || Passed || Failed || % || Status ||\n";

  const failures: string[] = [];

  for (const [feature, tests] of featureMap.entries()) {
    const raw = calculateKPIFromRows(tests);
    const kpi = calculateKPI(raw.total, raw.passed, raw.failed, raw.skipped);

    let status = "✅";
    if (kpi.passRate < 90) status = "⚠";
    if (kpi.passRate < 75) status = "❌";

    if (kpi.failed > 0) {
      failures.push(
        `${feature} (${kpi.failed} failure${kpi.failed > 1 ? "s" : ""})`,
      );
    }

    output += `| ${cleanLabel(feature)} | ${kpi.total} | ${kpi.passed} | ${kpi.failed} | ${kpi.passRate.toFixed(0)}% | ${status} |\n`;
  }

  if (failures.length > 0) {
    output += `\n*Failures:*\n`;
    failures.forEach((f) => {
      output += `- ${f}\n`;
    });
  }

  return output;
}

function buildOverallDashboard(workbook: ExcelJS.Workbook, rows: any[]) {
  const sheet = workbook.addWorksheet("Dashboard");

  // ✅ title
  const title = sheet.addRow(["Execution Overview"]);
  sheet.mergeCells(`A${title.number}:G${title.number}`);
  title.font = { bold: true, size: 14 };
  title.height = 25;

  sheet.addRow([]);

  // ✅ header
  const header = sheet.addRow([
    "Domain",
    "Subdomain",
    "Total",
    "Passed",
    "Failed",
    "Skipped",
    "Pass %",
  ]);

  header.font = { bold: true };

  // ✅ grouping
  const map = new Map<string, any[]>();

  for (const r of rows) {
    const key = `${r.domain}|${r.subdomain || "-"}`;

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key)!.push(r);
  }

  // ✅ populate rows
  for (const [key, groupRows] of map.entries()) {
    const [domain, subdomain] = key.split("|");

    const raw = calculateKPIFromRows(groupRows);

    const kpi = calculateKPI(raw.total, raw.passed, raw.failed, raw.skipped);

    const row = sheet.addRow([
      domain,
      subdomain,
      kpi.total,
      kpi.passed,
      kpi.failed,
      kpi.skipped,
      `${kpi.passRate.toFixed(2)}%`,
    ]);

    // ✅ colour pass %
    const passCell = row.getCell(7);
    if (kpi.passRate > 90) passCell.fill = colour("green");
    else if (kpi.passRate > 70) passCell.fill = colour("yellow");
    else passCell.fill = colour("red");
    row.getCell(7).alignment = {
      horizontal: "right",
      vertical: "middle",
    };
  }

  sheet.columns = [
    { width: 25 },
    { width: 25 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 12 },
  ];
}
function extractFeatureFromFile(file: string): string {
  if (!file) return "Unknown Feature";

  const name = path.basename(file).replace(".spec.ts", "");

  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .trim();
}
function extractTests(
  suite: any,
  currentFeature: string,
  currentScenario: string,
  rows: any[],
  file?: string,
) {
  const title = suite.title || "";

  let nextFeature = currentFeature;
  let nextScenario = currentScenario;
  // ✅ capture FEATURE
  if (title.startsWith("Feature:")) {
    nextFeature = cleanText(title.replace(/^Feature:\s*/i, ""));
  }

  // ✅ capture SCENARIO (WHEN level)
  if (title.startsWith("WHEN")) {
    nextScenario = cleanText(title.replace(/^WHEN\s+/i, ""));
  }

  // ✅ capture tests (THEN)
  if (suite.tests && suite.tests.length > 0) {
    for (const test of suite.tests) {
      const tcIdMatch = (test.title || "").match(/\[([A-Z\-0-9]+)\]/);

      rows.push({
        domain: extractDomain(file || ""), // ✅ ADD THIS
        subdomain: extractSubdomain(file || ""),
        file,
        feature: nextFeature || extractFeatureFromFile(file || ""),
        scenario: nextScenario,
        title: cleanText(test.title),
        tcId: test.context?.tcId || tcIdMatch?.[1] || "",
        result: test.skipped
          ? "Skipped"
          : test.state === "passed"
            ? "Pass"
            : "Fail",
        duration: test.duration ?? "",
        speed: test.speed ?? "",
      });
    }
  }

  // ✅ recurse with updated context
  if (suite.suites && suite.suites.length > 0) {
    for (const child of suite.suites) {
      extractTests(child, nextFeature, nextScenario, rows, file);
    }
  }
}

function buildSummarySheet(workbook: ExcelJS.Workbook, rows: any[]) {
  const sheet = getOrCreateSheet(workbook, "Execution Summary");

  const totalFeatures = new Set(rows.map((r) => r.feature)).size;
  const domainName = rows[0]?.domain || "";
  const subdomain = rows[0]?.subdomain || ""; // safe if not present

  const title = subdomain
    ? `Execution Summary (${domainName} / ${subdomain}) - ${totalFeatures} Features`
    : `Execution Summary (${domainName}) - ${totalFeatures} Features`;

  const titleRow = sheet.addRow([title]);

  // ✅ Merge A + B + C + D + E + F
  sheet.mergeCells(`A${titleRow.number}:F${titleRow.number}`);

  titleRow.getCell(1).alignment = {
    horizontal: "left",
    vertical: "middle",
  };
  titleRow.getCell(1).font = {
    bold: true,
    size: 14,
    name: "Nunito Sans",
  };
  titleRow.height = 30;

  const topSeparator = sheet.addRow([]);
  [1, 2, 3, 4, 5, 6].forEach((col) => {
    if (col === 1) {
      topSeparator.getCell(col).alignment = {
        horizontal: "left",
        vertical: "middle",
      };
    } else {
      topSeparator.getCell(col).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
    }
    topSeparator.getCell(col).fill = colour("midGrey");
  });
  topSeparator.height = 3;

  const featureMap = new Map<string, any[]>();

  for (const r of rows) {
    if (!featureMap.has(r.feature)) {
      featureMap.set(r.feature, []);
    }
    featureMap.get(r.feature)!.push(r);
  }

  const header = sheet.addRow([
    "Feature",
    "Total",
    "Passed",
    "Failed",
    "Skipped",
    "Pass %",
  ]);

  header.getCell(1).font = {
    bold: true,
    size: 10,
    name: "Nunito Sans",
  };
  header.getCell(1).fill = colour("blue");

  [1, 2, 3, 4, 5, 6].forEach((col) => {
    if (col === 1) {
      header.getCell(col).alignment = {
        horizontal: "left",
        vertical: "middle",
        indent: 1,
      };
    } else {
      header.getCell(col).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
    }
    header.getCell(col).font = {
      bold: true,
      size: 10,
      name: "Nunito Sans",
    };
    header.getCell(col).fill = colour("blue");
  });
  header.height = 25;

  const headerSeparator = sheet.addRow([]);
  [1, 2, 3, 4, 5, 6].forEach((col) => {
    if (col === 1) {
      headerSeparator.getCell(col).alignment = {
        horizontal: "left",
        vertical: "middle",
      };
    } else {
      headerSeparator.getCell(col).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
    }
    headerSeparator.getCell(col).fill = colour("midGrey");
  });
  headerSeparator.height = 3;

  for (const [feature, tests] of featureMap.entries()) {
    const raw = calculateKPIFromRows(tests);

    const kpi = calculateKPI(raw.total, raw.passed, raw.failed, raw.skipped);
    const resultRow = sheet.addRow([
      cleanLabel(feature),
      kpi.total,
      kpi.passed,
      kpi.failed,
      kpi.skipped,
      kpi.passRate.toFixed(2) + "%",
    ]);
    resultRow.height = 22;

    [1, 2, 3, 4, 5, 6].forEach((col) => {
      if (col === 6) {
        if (kpi.passRate > 90) {
          resultRow.getCell(col).fill = colour("green");
        } else if (kpi.passRate > 70) {
          resultRow.getCell(col).fill = colour("yellow");
        } else {
          resultRow.getCell(col).fill = colour("red");
        }
        resultRow.getCell(col).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
      } else {
        resultRow.getCell(col).alignment = {
          horizontal: col === 1 ? "left" : "center",
          vertical: "middle",
          wrapText: false,
          indent: col === 1 ? 1 : 0,
        };
      }
      resultRow.getCell(col).font = {
        bold: col === 1 ? true : false,
        size: 10,
        name: "Nunito Sans",
      };
    });
  }

  // ✅ spacer row
  const totalSeperator = sheet.addRow([]);

  [1, 2, 3, 4, 5, 6].forEach((col) => {
    totalSeperator.getCell(col).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    totalSeperator.getCell(col).fill = colour("midGrey");
  });
  totalSeperator.height = 3;

  // let spacerRow = sheet.getRow(sheet.lastRow!.number);
  // ✅ totals
  const raw = calculateKPIFromRows(rows);
  const kpi = calculateKPI(raw.total, raw.passed, raw.failed, raw.skipped);

  const totalRow = sheet.addRow([
    "TOTAL",
    kpi.total,
    kpi.passed,
    kpi.failed,
    kpi.skipped,
    kpi.passRate.toFixed(2) + "%",
  ]);

  totalRow.font = { bold: true };
  totalRow.height = 25;

  [1, 2, 3, 4, 5, 6].forEach((col) => {
    if (col === 6) {
      totalRow.getCell(col).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
    } else {
      totalRow.getCell(col).alignment = {
        horizontal: col === 1 ? "left" : "center",
        vertical: "middle",
        indent: col === 1 ? 1 : 0,
      };
    }
    totalRow.getCell(col).fill = colour("blue");
    totalRow.getCell(col).font = {
      size: 10,
      name: "Nunito Sans",
      bold: true,
    };
  });

  const totalFooter = sheet.addRow([]);

  [1, 2, 3, 4, 5, 6].forEach((col) => {
    totalFooter.getCell(col).fill = colour("midGrey");
  });
  totalFooter.height = 3;

  sheet.columns = [
    { width: 55 },
    { width: 8 },
    { width: 8 },
    { width: 8 },
    { width: 8 },
    { width: 8 },
  ];
}
function autoHeight(row: ExcelJS.Row) {
  let maxLines = 1;

  row.eachCell((cell: any) => {
    const text = cell.value?.toString() || "";
    if (!text) return;

    const column = row.worksheet.getColumn(cell.col);
    const colWidth = column.width || 20;

    // ✅ slightly larger per-line capacity → fewer lines counted
    const charsPerLine = colWidth * 1.8;

    const lines = text.split("\n").reduce((acc: number, line: string) => {
      return acc + Math.max(1, Math.ceil(line.length / charsPerLine));
    }, 0);

    maxLines = Math.max(maxLines, lines);
  });

  // ✅ tighter row height
  row.height = Math.max(15, maxLines * 12);
}

function buildRunInfoSheet(
  workbook: ExcelJS.Workbook,
  rows: any[],
  domain: string,
  subDomain?: string,
) {
  const sheet = getOrCreateSheet(workbook, "Run Info");

  // ✅ CALCULATE FROM DOMAIN ROWS
  const raw = calculateKPIFromRows(rows);

  const kpi = calculateKPI(raw.total, raw.passed, raw.failed, raw.skipped);

  // ✅ TITLE
  const titleRow = sheet.addRow([
    `Run Information - (${domain} / ${subDomain || "-"})`,
  ]);
  sheet.mergeCells(`A${titleRow.number}:B${titleRow.number}`);

  titleRow.getCell(1).font = {
    bold: true,
    size: 14,
    name: "Nunito Sans",
  };

  titleRow.getCell(1).alignment = {
    horizontal: "left",
    vertical: "middle",
  };

  titleRow.height = 30;

  // ✅ separator
  const sep = sheet.addRow([]);
  sep.height = 3;
  [1, 2].forEach((col) => (sep.getCell(col).fill = colour("midGrey")));

  const failRate = kpi.total > 0 ? (kpi.failed / kpi.total) * 100 : 0;

  // ✅ DATA ROWS
  const infoRows = [
    ["Domain", domain],
    ["Subdomain", subDomain || "-"],
    ["Total Tests", kpi.total],
    ["Passed", kpi.passed],
    ["Failed", kpi.failed],
    ["Skipped", kpi.skipped],
    ["Pass %", `${kpi.passRate.toFixed(2)}%`],
    ["Fail %", `${failRate.toFixed(2)}%`],
    ["Status", kpi.status],
  ];

  infoRows.forEach((r) => {
    const row = sheet.addRow(r);

    // ✅ left column style
    row.getCell(1).font = {
      bold: true,
      name: "Nunito Sans",
      size: 10,
    };

    row.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "left",
      indent: 1,
    };

    row.getCell(1).fill = colour("blue");

    // ✅ right column alignment
    row.getCell(2).alignment = {
      vertical: "middle",
      horizontal: "right",
    };

    // ✅ colour key metrics
    const label = r[0];

    if (label === "Passed") row.getCell(2).fill = colour("green");
    if (label === "Failed") row.getCell(2).fill = colour("red");
    if (label === "Skipped") row.getCell(2).fill = colour("grey");
    if (label === "Pass %") row.getCell(2).fill = colour("blue");
    if (label === "Fail %") row.getCell(2).fill = colour("red");

    row.height = 22;
  });

  // ✅ bottom separator
  const bottomSep = sheet.addRow([]);
  bottomSep.height = 3;

  [1, 2].forEach((col) => {
    bottomSep.getCell(col).fill = colour("midGrey");
  });

  // ✅ column sizing
  sheet.columns = [{ width: 25 }, { width: 22 }];
}

function colour(
  name:
    | "green"
    | "red"
    | "blue"
    | "grey"
    | "yellow"
    | "midGrey"
    | "darkGrey"
    | "lightGrey"
    | "midGrey2",
) {
  const colours = {
    green: "FFDFF0D8",
    red: "FFF8D7DA",
    blue: "FFDEEAF6",
    grey: "FFEFEFEF",
    yellow: "FFFFF2CC",
    midGrey: "FFBFBFBF", // like a mid grey
    darkGrey: "FFA6A6A6",
    lightGrey: "FFF2F2F2",
    midGrey2: "FFD9D9D9", // slightly lighter than midGrey
  };

  return solid(colours[name]);
}

function solid(argb: string) {
  return {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb },
  };
}

function cleanLabel(text: string) {
  return (text || "").replace(/^(GIVEN|WHEN|THEN)\s+/i, "").trim();
}

function extractDomain(file: string): string {
  if (!file) return "unknown";

  const match = file.match(/cypress\/tests\/([^\/]+)/);
  return match ? match[1] : "unknown";
}

function extractSubdomain(file: string): string {
  if (!file) return "";

  const match = file.match(/cypress\/tests\/[^\/]+\/([^\/]+)/);
  return match ? match[1] : "";
}

function safeSheetName(name: string) {
  return name.replace(/[\\/*?:[\]]/g, "").substring(0, 31);
}
