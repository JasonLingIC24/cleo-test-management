import { runCodemodWorkflow } from "./codemodWorkflowService.js";
import { runPhase2Workflow } from "./phase2WorkflowService.js";
import { runPhase3Workflow } from "./phase3WorkflowService.js";
import type { RuntimeContext } from "../models/runtimeContext.js";
import type { PublishOptions } from "../models/publishOptions.js";

/* =================
 Phase 1 Program 
==================== */
export async function runPhase1(runtimeContext: RuntimeContext) {
  void runtimeContext;

  console.log("🔧 Phase 1 — Validate & Codemod");

  await runCodemodWorkflow();

  console.log("✅ Phase 1 complete\n");
}

/* =================
 Phase 2 Program 
==================== */
export async function runPhase2(runtimeContext: RuntimeContext) {
  void runtimeContext;

  console.log("📊 Phase 2 — Transform + Results");

  const results = await runPhase2Workflow();

  console.log("✅ Phase 2 complete\n");

  return results;
}

/* =================
 Phase 3 Program 
==================== */
export async function runPhase3(
  runtimeContext: RuntimeContext,
  publishOptions: PublishOptions,
) {
  console.log("📄 Phase 3 — Release + Reporting");

  await runPhase3Workflow(runtimeContext, publishOptions);

  console.log("✅ Phase 3 complete\n");
}
