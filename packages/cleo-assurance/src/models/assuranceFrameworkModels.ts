import type { AssuranceSection } from "./assuranceSectionModels.js";

export interface AssuranceFramework {
  id: string;

  title: string;

  version: string;

  sections: AssuranceSection[];
}
