import { createReport } from "docx-templates";
import fs from "fs";

export async function generateWordReport(
  templatePath: string,
  outputPath: string,
  data: Record<string, unknown>,
) {
  const template = fs.readFileSync(templatePath);

  const buffer = await createReport({
    template,
    data,

    cmdDelimiter: ["[[", "]]"],

    // ✅ THIS IS THE KEY CHANGE
    noSandbox: false,

    // ✅ helps with block handling in Word
    processLineBreaks: true,
  });

  fs.writeFileSync(outputPath, buffer);
}
