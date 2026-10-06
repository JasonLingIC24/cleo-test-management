import type { AssuranceFramework } from "./assuranceFrameworkModels.js";

export interface AssuranceImporter {
  importFramework(filePath: string): Promise<AssuranceFramework>;
}
