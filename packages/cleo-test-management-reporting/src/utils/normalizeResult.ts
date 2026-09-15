export function normalizeResult(result: string): string {
    
    if (!result) return "SKIPPED";

    const r = result.trim().toLowerCase();

    if (r === "pass" || r === "passed") return "PASS";
    if (r === "fail" || r === "failed") return "FAIL";
    if (r === "skip" || r === "skipped") return "SKIPPED";

    // ✅ ADD THIS
    if (r === "n/a" || r === "na" || r === "-") return "SKIPPED";

    // ✅ OPTIONAL (empty cells)
    if (!r) return "SKIPPED";

    return "UNKNOWN";

}
