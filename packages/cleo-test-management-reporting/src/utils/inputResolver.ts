import path from "path";
import { configAccess } from "../services/configAccessService.js";

export function getInputSpecPath(input?: string): string {

  // ✅ CLI override
  if (input) {
    return path.resolve(input);
  }

  // ✅ fallback to config
  const configPath = configAccess.getCypressSpecs()

  if (!configPath) {
    throw new Error("❌ No input path provided and no config default found");
  }

  return configPath;
}