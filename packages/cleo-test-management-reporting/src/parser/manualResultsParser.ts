import ExcelJS from "exceljs";
import { calculateKPIFromRows } from "../utils/kpi.js";
import { normalizeResult } from "../utils/normalizeResult.js";
import type { ManualResult } from "../models/testModels.js";

export async function parseManualResults(
  filePath: string,
): Promise<ManualResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  const features: any[] = [];
  const unknownResults = new Map<string, number>();
  workbook.eachSheet((sheet) => {
    const sheetName = sheet.name.trim().toLowerCase();

    if (
      sheetName.includes("summary") ||
      sheetName.includes("dashboard") ||
      sheetName.includes("stats") ||
      sheetName.includes("appendix") ||
      sheetName.includes("execution")
    ) {
      return;
    }

    const featureName = sheetName.replace(/\s+/g, "-");

    const rows: any[] = [];

    sheet.eachRow((row, rowIndex) => {
      if (rowIndex <= 12) return;

      const resultCell = row.getCell(6).value;

      if (!resultCell) return;

      // ✅ raw value
      const raw = String(resultCell).trim();

      // ✅ skip header rows
      if (raw.toLowerCase() === "result") {
        return;
      }

      // ✅ normalise result
      const result = normalizeResult(raw);

      // ✅ track unknown values
      if (
        result === "UNKNOWN" &&
        raw.toLowerCase() !== "n/a" &&
        raw.toLowerCase() !== "na" &&
        raw !== "-"
      ) {
        unknownResults.set(raw, (unknownResults.get(raw) || 0) + 1);
      }

      rows.push({ result });
    });

    const raw = calculateKPIFromRows(rows);

    if (raw.total === 0) return;

    total += raw.total;
    passed += raw.passed;
    failed += raw.failed;
    skipped += raw.skipped;

    const passRate = raw.total > 0 ? (raw.passed / raw.total) * 100 : 0;

    features.push({
      name: featureName,
      total: raw.total,
      passed: raw.passed,
      failed: raw.failed,
      skipped: raw.skipped,
      passRate: Number(passRate.toFixed(1)),
    });
  });

  if (unknownResults.size > 0) {
    console.warn("⚠️ Unknown manual result values:");

    for (const [value, count] of unknownResults.entries()) {
      console.warn(`   ${value}: ${count}`);
    }
  }

  return {
    total,
    passed,
    failed,
    skipped,
    na: 0,
    passRate: total > 0 ? Number(((passed / total) * 100).toFixed(1)) : 0,
    features,
  };
}
