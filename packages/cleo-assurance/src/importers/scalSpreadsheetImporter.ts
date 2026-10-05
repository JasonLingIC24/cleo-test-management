import ExcelJS from "exceljs";
import type { AssuranceRequirement } from "../models/assuranceRequirementModels.js";
import type { AssuranceRequirementsDocument } from "../models/assuranceRequirementsDocumentModels.js";

function extractCellValue(value: unknown): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object" && value !== null) {
    const candidate = value as {
      richText?: {
        text: string;
      }[];
      text?: string;
    };

    if (candidate.richText && Array.isArray(candidate.richText)) {
      return candidate.richText
        .map((item) => item.text)
        .join("")
        .trim();
    }

    if (typeof candidate.text === "string") {
      return candidate.text.trim();
    }
  }

  return String(value);
}

export async function importScalSpreadsheet(
  filePath: string,
): Promise<AssuranceRequirementsDocument> {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet("Requirements");

  if (!worksheet) {
    throw new Error("Requirements worksheet not found.");
  }

  const requirements: AssuranceRequirement[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    requirements.push({
      trudDocument: extractCellValue(row.getCell(1).value),

      id: extractCellValue(row.getCell(2).value),

      area: extractCellValue(row.getCell(3).value),

      title: extractCellValue(row.getCell(4).value),

      description: extractCellValue(row.getCell(5).value),

      applicability: extractCellValue(row.getCell(6).value),

      requirementType: extractCellValue(row.getCell(7).value),

      guidance: extractCellValue(row.getCell(9).value),

      status: "not-started",

      framework: "RCS",

      source: "spreadsheet",
    });
  });

  return {
    framework: "RCS",
    version: "1.0",
    requirements,
  };
}
