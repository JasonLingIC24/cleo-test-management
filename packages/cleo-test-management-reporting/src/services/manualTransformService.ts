import { ManualTestWorkbookProcessor } from "../renderers/manualTestWorkbookProcessor.js";

import { configAccess } from "./configAccessService.js";

import { getConfig } from "./configService.js";

export async function runManualTransform() {
  const processor = new ManualTestWorkbookProcessor();

  await processor.processWorkbook(
    configAccess.getManualTestScript(),
    configAccess.getOutputFeatures(),
    configAccess.getManualResults(),
    getConfig(),
  );
}
