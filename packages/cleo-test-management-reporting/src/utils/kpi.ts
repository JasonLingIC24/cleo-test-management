// ✅ CORE KPI (used everywhere)
export function calculateKPI(
  total: number,
  passed: number,
  failed: number,
  skipped = 0
): {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  status: "passed" | "failed" | "skipped";
} {
  const effectiveSkipped = skipped ?? (total - passed - failed);

  const passRate = total > 0 ? (passed / total) * 100 : 0;

  const status =
    total === 0 ? "skipped" :
    failed > 0 ? "failed" :
    passed === 0 ? "skipped" :
    "passed";

  return {
    total,
    passed,
    failed,
    skipped: effectiveSkipped,
    passRate: Number(passRate.toFixed(1)),
    status
  };
}

// ✅ RAW ROW PARSER
export function calculateKPIFromRows(rows: any[]) {
  const total = rows.length;

const passed = rows.filter(r => r.result === "PASS").length;

const failed = rows.filter(r => r.result === "FAIL").length;

const skipped = rows.filter(r => r.result === "SKIPPED").length;

  return {
    total,
    passed,
    failed,
    skipped
  };
}