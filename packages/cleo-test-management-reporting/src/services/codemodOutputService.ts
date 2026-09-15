import fs from "fs";
import path from "path";

import { configAccess } from "./configAccessService.js";
import { injectTcIds } from "../utils/injectTcIds.js";

export function writeCodemodOutput(result: any, inputPath: string) {
  const outputRoot = configAccess.getCodemodOutput();

  fs.mkdirSync(outputRoot, {
    recursive: true,
  });

  let changedCount = 0;

  for (const file of result.files) {
    const relativePath = path.relative(inputPath, file.filePath);

    const outputPath = path.join(outputRoot, relativePath);

    const hasChanged =
      file.changes.featureWrapperAdded ||
      file.changes.tagsLifted ||
      file.changes.domainTagAdded ||
      file.changes.subdomainTagAdded;

    let content = file.source.transformed;

    if (hasChanged) {
      changedCount++;

      content = injectTcIds(file.filePath, content) || content;
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    fs.writeFileSync(outputPath, content, "utf8");
  }

  console.log(`✅ Codemod output written to: ${outputRoot}`);

  console.log(`📊 Files changed: ${changedCount}`);
}
