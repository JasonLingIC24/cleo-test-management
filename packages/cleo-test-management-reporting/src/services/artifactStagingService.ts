import fs from "fs";
import path from "path";

export interface ArtifactStagingPaths {
  backend: string;
  frontend: string;
  cypress: string;
}

export function stageArtifactFiles(
  files: string[],
  destinations: ArtifactStagingPaths,
): void {
  fs.mkdirSync(destinations.backend, {
    recursive: true,
  });

  fs.mkdirSync(destinations.frontend, {
    recursive: true,
  });

  fs.mkdirSync(destinations.cypress, {
    recursive: true,
  });

  for (const filePath of files) {
    const fileName = path.basename(filePath);

    if (fileName.includes("backend")) {
      const target = path.join(destinations.backend, fileName);

      fs.copyFileSync(filePath, target);

      console.log(`✅ Staged backend: ${fileName}`);
    } else if (fileName.includes("frontend")) {
      const target = path.join(destinations.frontend, fileName);

      fs.copyFileSync(filePath, target);

      console.log(`✅ Staged frontend: ${fileName}`);
    } else if (fileName.includes("cypress")) {
      const target = path.join(destinations.cypress, fileName);

      fs.copyFileSync(filePath, target);

      console.log(`✅ Staged cypress: ${fileName}`);
    }
  }
}
