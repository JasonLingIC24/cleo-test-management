import { downloadRunOutputs } from "../services/githubRunDownloadService.js";

export async function run(runId: number): Promise<void> {
  await downloadRunOutputs(runId, "./artifacts");
}
