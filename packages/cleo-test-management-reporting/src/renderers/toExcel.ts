import ExcelJS from "exceljs";
import type { FeatureReport } from "../models/reportModels.js";
import fs from "fs";
import path from "path";
import { cleanText } from "cleo-domain";
/**
 * Generate Excel report
 */

export async function toExcel(
  features: FeatureReport[],
  config?: any
) {
  const workbook = new ExcelJS.Workbook();

  addDomainSheets(workbook, features, config);
  addExecutionSummarySheet(workbook);

  let listSheet = workbook.getWorksheet("_lists");

  if (!listSheet) {
    listSheet = workbook.addWorksheet("_lists");
  }
  listSheet.state = "veryHidden"; // ✅ invisible in Excel

  // Execution Result values
  listSheet.getCell("A1").value = "Pass";
  listSheet.getCell("A2").value = "Fail";
  listSheet.getCell("A3").value = "N/A";

  // Execution Source values
  listSheet.getCell("B1").value = "Manual";
  listSheet.getCell("B2").value = "Cypress";
  // Move summary to front
  moveToFront(workbook, "Execution Summary");

  const baseDir = config?.reportOutput ?? "./output/reports";
  // ✅ file name stays here
  const fileName = config?.fileName ?? "report.xlsx";
  const filePath = path.join(baseDir, fileName);

  // ✅ ensure directory ALWAYS exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  await workbook.xlsx.writeFile(filePath);

  console.log(`✅ Excel: ${filePath}`);

}


function moveToFront(workbook: ExcelJS.Workbook, sheetName: string) {
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) return;

  const index = workbook.worksheets.indexOf(sheet);
  workbook.worksheets.splice(index, 1);
  workbook.worksheets.unshift(sheet);
}
/* ============================================================
   DOMAIN SHEETS
============================================================ */

function addDomainSheets(
  workbook: ExcelJS.Workbook,
  features: FeatureReport[],
  config?: any
) {
  const usedNames = new Set<string>();   // ✅ ADD THIS HERE

  for (const feature of features) {
    const rawFileName = feature.file
      ? path.basename(feature.file)
      : "";

    const cleanedFileName = rawFileName
      .replace(/\.(spec|cy)\.(ts|js)$/, "")
      .replace(/\.(ts|js)$/, "")
      .trim();

    const fallback = cleanScenarioName(feature.name);

    // ✅ final safe name (fallback in case file missing)
    const finalName = cleanedFileName || fallback;
    const sheetName = cleanSheetName(finalName, usedNames);
    const sheet = workbook.addWorksheet(sheetName);
    const headerRowIndex = addMetadataHeader(sheet, [feature], config);

    // ✅ NOW views (after header exists)
    sheet.views = [
      {
        state: "frozen",
        xSplit: 1,
        ySplit: headerRowIndex,

      }
    ];

    // Header
    const headerRow = sheet.getRow(headerRowIndex);
    headerRow.values = [
      "Test Case ID",
      "Scenario",
      "GIVEN",
      "WHEN",
      "THEN",
      "Result",
      "Environment",
      "Evidence",
    ];

    sheet.columns = [
      { width: 22 }, // TC ID
      { width: 40 }, // Scenario
      { width: 50 }, // GIVEN
      { width: 50 }, // WHEN
      { width: 50 }, // THEN
      { width: 12 }, // Result
      { width: 12 }, // Environment
      { width: 30 }, // Evidence
    ];

    headerRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.font.name = "Nunito Sans";
      cell.font.size = 10;
      cell.fill = solid("FFD9E1F2");
      cell.border = thinBorder();
      cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    });

    headerRow.height = 30;

    sheet.eachRow(row => {
      row.eachCell(cell => {
        cell.font = cell.font || {};
        cell.font.name = "Nunito Sans";
        cell.font.size = 10;
      });
    });

    [6, 7, 8].forEach(col => {
      headerRow.getCell(col).alignment = {
        vertical: "middle",
        horizontal: "center"
      };
    });


    /* ================= FEATURES ================= */

    const seenScenarios = new Set();

    for (const scenario of feature.scenarios) {
      if (seenScenarios.has(scenario.title)) continue;
      seenScenarios.add(scenario.title);

      const steps = scenario.steps ?? [];

      const scenarioName = cleanText(
        cleanScenarioName(scenario.title)
      );

      const givenStep = steps.find((s: any) => s.type === "GIVEN");
      const whenStep = steps.find((s: any) => s.type === "WHEN");
      const thenSteps = steps.filter((s: any) => s.type === "THEN");

      let isFirstRow = true;

      for (const step of thenSteps) {

        const tcId = step.tcId || "";

        const givenCell = isFirstRow && givenStep?.description
          ? {
            richText: [
              { text: "GIVEN ", font: { bold: true } },
              { text: cleanText(givenStep.description) }
            ]
          }
          : "";

        const whenCell = isFirstRow && whenStep?.description
          ? {
            richText: [
              { text: "WHEN ", font: { bold: true } },
              { text: cleanText(whenStep.description) }
            ]
          }
          : "";

        const scenarioCell = isFirstRow
          ? safe(scenarioName)
          : "";

        const thenCell = {
          richText: [
            { text: "THEN ", font: { bold: true } },
            { text: cleanText(step.description) }
          ]
        };

        const row = sheet.addRow([
          tcId,
          scenarioCell,
          givenCell,
          whenCell,
          thenCell,
          "N/A",
          "Manual",
          ""
        ]);


        styleStepCells(row);
        applyExecutionDropdowns(row);
        autoHeight(row);

        // ✅ FORCE REAPPLY HEIGHT
        row.commit?.(); // safe in ExcelJS

        isFirstRow = false;
      }
    }

  }
}

/* ============================================================
   METADATA
============================================================ */

function addMetadataHeader(
  sheet: ExcelJS.Worksheet,
  features: FeatureReport[],
  config?: any
): number {
  const feature = features[0];
  const allTags = new Set<string>();

  for (const f of features) {
    (f.tags || []).forEach(t => allTags.add(t));

    for (const s of f.scenarios || []) {
      (s.tags || []).forEach((t: any) => allTags.add(t));

      for (const step of s.steps || []) {
        (step.tags || []).forEach((t: any) => allTags.add(t));
      }
    }
  }

  const tags = Array.from(allTags);

  // ✅ FILTER ONLY DOMAIN/SUBDOMAIN TAGS
  const filteredTags = tags.filter(tag =>
    !tag.startsWith("@domain:") &&
    !tag.startsWith("@subdomain:")
  );

  // ✅ fallback so Excel isn’t empty
  const tagText = filteredTags.length > 0
    ? filteredTags.join(", ")
    : "(none)";

  const context = {
    product: config?.product ?? "",
    version: config?.version ?? "",
    environment: config?.environment ?? "",
    release: config?.release ?? "",
    buildNumber: config?.buildNumber ?? "",
    team: config?.team ?? ""
  };

  const startRow = sheet.rowCount + 1;
  const featureName = feature?.name ?? "";


  // ✅ Row 1
  const featureRow = sheet.addRow(["Feature", featureName, ""]);
  // ✅ style like your old feature row
  featureRow.getCell(1).font = {
    bold: true,
    size: 10,
    name: "Nunito Sans"
  };

  featureRow.getCell(2).font = {
    bold: true,
    size: 10,
    name: "Nunito Sans"
  };

  // ✅ Merge B + C
  sheet.mergeCells(`B${featureRow.number}:C${featureRow.number}`);

  // ✅ alignment for BOTH cells
  featureRow.getCell(1).alignment = {
    horizontal: "left",
    vertical: "middle"
  };

  featureRow.getCell(2).alignment = {
    wrapText: true,
    horizontal: "left",
    vertical: "middle"
  };

  // ✅ background (optional but matches your style)
  featureRow.getCell(1).fill = solid("FFD9E1F2");
  //featureRow.getCell(2).fill = solid("FFD9E1F2");
  featureRow.getCell(2).fill = solid("FFF2F2F2");


  // ✅ dynamic height for long titles
  addMetaRow(sheet, "Feature ID", feature?.featureId ?? "");
  addMetaRow(sheet, "Domain", feature?.domain ?? "");
  addMetaRow(sheet, "Tags", tagText);
  addMetaRow(sheet, "Product", context.product);
  addMetaRow(sheet, "Version", context.version);
  addMetaRow(sheet, "Environment", context.environment);
  addMetaRow(sheet, "Release", context.release);
  addMetaRow(sheet, "Build Number", context.buildNumber);
  addMetaRow(
    sheet,
    "Generated At",
    new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }));

  for (let r = startRow; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);

    // ✅ row height
    featureRow.height = 18;

    row.eachCell(cell => {
      cell.alignment = {
        horizontal: "left",
        vertical: "middle",
      };
      cell.fill = solid("FFF2F2F2");
      cell.font = { size: 10, name: "Nunito Sans" };
    });

    row.getCell(1).font = { bold: true };
    row.getCell(1).fill = solid("FFD9E1F2");
    row.getCell(1).alignment = {
      horizontal: "left",
      vertical: "middle"
    };
    row.getCell(5).alignment = {
      wrapText: true,
      vertical: "top"
    };

  }

  sheet.addRow([]);


  return sheet.rowCount + 1;
}

/* ============================================================
   HELPERS
============================================================ */
function scenarioDividerBorder(): Partial<ExcelJS.Borders> {
  return {
    top: {
      style: "thin",
      color: { argb: "FFBFBFBF" } // ✅ mid grey
    }
  };
}


function applyExecutionDropdowns(row: ExcelJS.Row) {
  // Result column (6)
  row.getCell(6).dataValidation = {
    type: "list",
    allowBlank: true,
    formulae: ["_lists!$A$1:$A$3"], // Pass / Fail / N/A
  };
  row.getCell(6).alignment = {
    horizontal: "center",
    vertical: "middle"
  };
  row.getCell(6).font = { size: 10, name: "Nunito Sans" };
  row.getCell(6).fill = solid("FFFABF8F");

  // Environment column (7)
  row.getCell(7).dataValidation = {
    type: "list",
    allowBlank: true,
    formulae: ["_lists!$B$1:$B$2"], // Manual / Cypress
  };
  row.getCell(7).alignment = {
    horizontal: "center",
    vertical: "middle"
  };
  row.getCell(7).font = { size: 10, name: "Nunito Sans" };
  row.getCell(7).fill = solid("FFFABF8F");
}

function cleanScenarioName(title: string) {
  return cleanText(
    title.split("→").pop()?.trim() ?? title
  );
}

function solid(argb: string): ExcelJS.FillPattern {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

function thinBorder(): Partial<ExcelJS.Borders> {
  return {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };
}

function cleanSheetName(name: string, used: Set<string>): string {
  let cleaned = name
    .replace(/[\\/*?:[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) cleaned = "Sheet";

  cleaned = cleaned.substring(0, 31);

  let finalName = cleaned;
  let counter = 1;

  while (used.has(finalName)) {
    const suffix = ` (${counter++})`;
    const maxLength = 31 - suffix.length;
    finalName = cleaned.substring(0, maxLength) + suffix;
  }

  used.add(finalName);
  return finalName;
}

function autoHeight(row: ExcelJS.Row, baseWidth = 100) {

  // tweak if needsed
  // const approxCharsPerLine = colWidth * 1.2;
  // row.height = maxLines * 15;
  // EffectChangeTighter rows * 14
  // More spacing * 16
  // Earlier wrappingcolWidth * 1.0

  let maxLines = 1;

  row.eachCell({ includeEmpty: true }, cell => {
    let text = "";

    if (typeof cell.value === "string") {
      text = cell.value;
    } else if (cell.value && typeof cell.value === "object" && "richText" in cell.value) {
      text = cell.value.richText
        .map((r: any) => r.text)
        .join(" ")
        .replace(/\n/g, " ");
    }

    // ✅ estimate wrapping (based on column width)
    const colWidth = cell.col ? row.worksheet.getColumn(cell.col).width || 20 : 20;

    const approxCharsPerLine = colWidth * 1.0; // tuning factor
    const lines = Math.ceil(text.length / approxCharsPerLine);

    maxLines = Math.max(maxLines, lines);
  });

  row.height = Math.max(20, maxLines * 15); // 12px per line
}

function sheetRef(name: string) {
  return `'${name.replace(/'/g, "''")}'`;
}

function safeName(name: string) {
  return name.replace(/[^\w\-]/g, "").toLowerCase();
}

function addMetaRow(
  sheet: ExcelJS.Worksheet,
  label: string,
  value: string
) {
  const row = sheet.addRow([label, value, ""]);

  // ✅ merge B + C
  sheet.mergeCells(`B${row.number}:C${row.number}`);

  // ✅ styling
  row.getCell(1).font = { bold: true };

  row.getCell(1).alignment = {
    horizontal: "left",
    vertical: "middle"
  };

  row.getCell(2).alignment = {
    horizontal: "left",
    vertical: "top",
    wrapText: true
  };

  // ✅ LIGHT FILL on VALUE cell only
  row.getCell(2).fill = solid("FFF2F2F2"); // 👈 lighter grey

  // ✅ row height
  row.height = 20;
}

function styleStepCells(row: ExcelJS.Row) {
  [1].forEach(col => {
    row.getCell(col).alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true
    };
    row.getCell(col).font = { size: 10, name: "Nunito Sans", bold: true };
    row.getCell(col).fill = solid("FFD9D9D9");
  });

  [2].forEach(col => {
    row.getCell(col).alignment = {
      vertical: "top",
      horizontal: "left",
      wrapText: true
    };
    row.getCell(col).font = { size: 10, name: "Nunito Sans", bold: true };
    row.getCell(col).fill = solid("FFD9D9D9");
  });

  row.getCell(3).fill = solid("FFDEEAF6"); // GIVEN = blue
  row.getCell(4).fill = solid("FFFFF2CC"); // WHEN = yellow
  row.getCell(5).fill = solid("FFDFF0D8"); // THEN = green

  [2, 3, 4, 5].forEach(col => {
    row.getCell(col).alignment = {
      ...(row.getCell(col).alignment || {
        vertical: "top",
        horizontal: "left",
        indent: 1
      }),
      wrapText: true
    };
    row.getCell(col).font = { size: 10, name: "Nunito Sans" };
  });

}

function addExecutionSummarySheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Execution Summary");

  sheet.addRow(["Execution Summary"]);
  sheet.getRow(1).font = { bold: true, size: 16 };

  sheet.addRow([]);
  sheet.addRow(["Metric", "Value"]);
  const headerRow = sheet.getRow(3);

  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      size: 10,
      name: "Nunito Sans"
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9E1F2" }
    };

    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" }
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "left"
    };
  });

  headerRow.height = 30;

  sheet.addRow(["Total Tests", { formula: "SUM(B8:B100)" }]);
  sheet.addRow(["Passed", { formula: "SUM(C8:C100)" }]);
  sheet.addRow(["Failed", { formula: "SUM(D8:D100)" }]);


  const passRow = sheet.addRow([
    "Pass %",
    { formula: "IFERROR(C4/B4,0)" }
  ]);

  passRow.getCell(2).numFmt = "0.00%";
  sheet.addRow([]);
  sheet.addRow(["Feature", "Total Tests", "Passed", "Failed", "Pass %"]);

  for (const ws of workbook.worksheets) {
    if (ws.name === "Execution Summary" || ws.name === "_lists") continue;

    const sheetName = sheetRef(ws.name);

    const passFormula = `COUNTIF(${sheetName}!F:F,"Pass")`;
    const failFormula = `COUNTIF(${sheetName}!F:F,"Fail")`;
    const totalFormula = `${passFormula}+${failFormula}+COUNTIF(${sheetName}!F:F,"N/A")`;

    const row = sheet.addRow([
      ws.name,
      { formula: totalFormula },
      { formula: passFormula },
      { formula: failFormula },
      { formula: `IFERROR(${passFormula}/(${totalFormula}),0)` }
    ]);
    row.eachCell((cell) => {
      cell.font = { name: "Nunito Sans", size: 10 };

      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "center"
      };
    });
    row.getCell(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDFF0D8" } };
    row.getCell(4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFCE4D6" } };

    row.getCell(5).numFmt = "0.00%";
    sheet.columns = [
      { width: 30 }, // Feature
      { width: 12 }, // Total Test
      { width: 12 }, // Pass
      { width: 12 }, // Fail
      { width: 12 }, // Pass %
    ];
  }
}

function safe(val: any) {
  return val ?? "";
}