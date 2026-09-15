import fs from "fs";
import path from "path";
import type { CleoConfig } from "../models/configModels.js";

let cachedConfig: CleoConfig | null = null;

export function getConfig(): CleoConfig {
  if (cachedConfig) return cachedConfig;

  const configPath = path.resolve(process.cwd(), "cleo.config.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(`❌ Config not found at ${configPath}`);
  }

  cachedConfig = JSON.parse(fs.readFileSync(configPath, "utf8")) as CleoConfig;

  console.log("🧭 Using config:", configPath);

  const requiredTestResults = ["frontend", "backend", "cypress"] as const;

  for (const key of requiredTestResults) {
    if (!cachedConfig.testResults?.[key]) {
      throw new Error(`❌ Missing config: testResults.${key}`);
    }
  }
  return cachedConfig;
}
