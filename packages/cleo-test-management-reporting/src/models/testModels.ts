/* ===============================
   SHARED TEST RESULT TYPES
=============================== */
export interface ResultSummary {
  total: number;
  passed: number;
  failed: number;
  skipped?: number;
  passRate?: number;
}

export type Subdomain = {
  name: string;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
};

export type DomainFeature = {
  name: string;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  subdomains?: Subdomain[];
};

/* ===============================
   RESULT SECTIONS
=============================== */

export type CypressResult = ResultSummary & {
  pending: number;
  skipped: number;
  passRate: number;
  features: DomainFeature[];
};

export type SimpleResult = ResultSummary & {
  features?: DomainFeature[];
};

/* ===============================
   MANUAL RESULTS
=============================== */

export type ManualResult = ResultSummary & {
  skipped: number;
  passRate: number;
  na: number;
  features?: {
    name: string;
    total: number;
    passed: number;
    failed: number;
    passRate: number;
  }[];
};

/* ===============================
   COMPLETE RESULTS ROOT
=============================== */
export type KPI = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  status: "passed" | "failed" | "skipped";
};

export type CompleteResults = {
  metadata: {
    product: string;
    version: string;
    environment: string;
    release: string;
    buildNumber: string;
    generatedAt: string;
  };

  sources: {
    backend: KPI;
    frontend: KPI;
    cypress: KPI;
    manual: KPI;
  };

  cypress: {
    status: "passed" | "failed" | "skipped";
    result: CypressResult;
  };

  backend: {
    status: string;
    result: SimpleResult;
  };

  frontend: {
    status: string;
    result: SimpleResult;
  };

  manual: {
    status: string;
    result: ManualResult;
  };

  summary: {
    totals: {
      backend: number;
      frontend: number;
      cypress: number;
      manual: number;
    };
    overallStatus: "passed" | "failed" | "skipped";

    // ✅ NEW (CLEAN KPI BLOCK)
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: number;
  };
};
