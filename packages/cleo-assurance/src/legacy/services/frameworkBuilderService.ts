import type { AssuranceFramework } from "../models/assuranceFrameworkModels.js";

import type { AssuranceRequirementsDocument } from "../models/assuranceRequirementsDocumentModels.js";

export interface FrameworkBuilder {
  buildFramework(document: AssuranceRequirementsDocument): AssuranceFramework;
}
