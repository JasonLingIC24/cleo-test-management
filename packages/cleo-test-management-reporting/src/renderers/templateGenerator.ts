import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

interface TemplateItem {
  key: string;
  text: string;
}

interface TemplateSection {
  title: string;
  items: TemplateItem[];
}

export function generateFromTemplate(
  templatePath: string,
  outputPath: string,
  data: any,
  sections: TemplateSection[],
) {
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: {
      start: "[[",
      end: "]]",
    },
  });

  doc.render({
    ...data,
    SECTIONS: sections.map((section) => ({
      title: section.title,
      items: section.items.map((i) => ({
        key: i.key,
        text: i.text,
      })),
    })),
  });

  // ✅ GENERATE FILE AFTER RENDER
  const buffer = doc.getZip().generate({
    type: "nodebuffer",
  });

  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}
