import { runCodemodWorkflow } from "./codemodWorkflowService.js";
import { runPhase2Workflow } from "./phase2WorkflowService.js";
import { runPhase3Workflow } from "./phase3WorkflowService.js";
import { acquireArtifactsForRuntimeContext } from "./artifactAcquisitionWorkflowService.js";
import type { RuntimeContext } from "../models/runtimeContext.js";
import type { PublishOptions } from "../models/publishOptions.js";

/* =============================
 Prepare - Validation & Codemod
============================= */
export async function runPhase1(runtimeContext: RuntimeContext) {
  void runtimeContext;

  console.log("🛠️ Prepare - Validation & Codemod");

  await runCodemodWorkflow();

  console.log("✅ Prepare complete\n");
}

/* ===========================
 Analyse - Results Processing 
=========================== */
export async function runPhase2(runtimeContext: RuntimeContext) {
  console.log("📊 Analyse - Results Processing");

  if (runtimeContext.source === "github" && runtimeContext.runId) {
    console.log(
      `📦 GitHub mode detected. Acquiring artifacts for workflow run (${runtimeContext.runId})`,
    );

    await acquireArtifactsForRuntimeContext(runtimeContext);
  }

  const results = await runPhase2Workflow();

  console.log("✅ Analyse complete\n");

  return results;
}
/* ===============================
 Release - Reporting & Publishing 
=============================== */
export async function runPhase3(
  runtimeContext: RuntimeContext,
  publishOptions: PublishOptions,
) {
  console.log("📄 Release - Reporting & Publishing");

  await runPhase3Workflow(runtimeContext, publishOptions);

  console.log("✅ Release complete\n");
}
