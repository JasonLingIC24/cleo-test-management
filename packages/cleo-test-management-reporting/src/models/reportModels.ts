/* ============================================================
   CORE STEP + SCENARIO REPORTING MODELS
============================================================ */

export interface StepReport {
  type: "GIVEN" | "WHEN" | "THEN";
  description: string;
  tags?: string[];
  tcId?: string;
}

export interface ScenarioReport {
  title: string;
  steps: StepReport[];
  stepCount: number;
  tags?: string[];
}

/* ============================================================
   BDD STRUCTURE (PARSED MODEL)
============================================================ */

export interface ScenarioNode {
  given: string;
  whens: WhenNode[];
}

export interface WhenNode {
  description: string;
  scenarios: ScenarioReport[];
}

/* ============================================================
   FEATURE REPORT (TOP LEVEL)
============================================================ */

export interface FeatureReport {
  file?: string;
  name: string;
  featureId?: string;

  domain?: string;
  subdomain?: string;

  tags?: string[];

  scenarioCount: number;
  stepCount: number;
  taggedSteps: number;

  scenarios:any[]; // ✅ THIS IS THE KEY STRUCTURE
}

/* ============================================================
   SUMMARY / ANALYTICS
============================================================ */

export interface ReportSummary {
  featureCount: number;
  scenarioCount: number;
  stepCount: number;
  domains: Record<string, number>;
}