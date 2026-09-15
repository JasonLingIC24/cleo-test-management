import type { ResultSummary, CompleteResults } from "../models/testModels.js";

export function buildJiraADF(completeResults: CompleteResults) {
  const cypress = completeResults?.cypress?.result ?? {};
  const backend = completeResults?.backend?.result ?? {};
  const frontend = completeResults?.frontend?.result ?? {};
  const manual = completeResults?.manual?.result ?? {};

  // ✅ COMBINED TOTALS
  const total =
    (cypress.total ?? 0) +
    (backend.total ?? 0) +
    (frontend.total ?? 0) +
    (manual.total ?? 0);

  const passed =
    (cypress.passed ?? 0) +
    (backend.passed ?? 0) +
    (frontend.passed ?? 0) +
    (manual.passed ?? 0);

  const failed =
    (cypress.failed ?? 0) +
    (backend.failed ?? 0) +
    (frontend.failed ?? 0) +
    (manual.failed ?? 0);

  const skipped =
    (cypress.skipped ?? 0) +
    (backend.skipped ?? 0) +
    (frontend.skipped ?? 0) +
    (manual.skipped ?? 0);

  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const overallStatus =
    passRate >= 95 ? "PASS" : passRate < 70 ? "FAIL" : "WARNING";

  const content: any[] = [];

  /* ===============================
     EXECUTION SUMMARY ✅
  =============================== */
  content.push(
    ...bigMetric(
      "Execution Summary",
      `${passRate}%`,
      passRate >= 95 ? "pass" : passRate < 70 ? "fail" : "pending",
    ),
  );

  content.push(
    paragraph([
      strong("Total: "),
      coloured(total, "tests"),
      spacer(),
      strong("Passed: "),
      coloured(passed, "pass"),
      spacer(),
      strong("Failed: "),
      coloured(failed, "fail"),
      spacer(),
      strong("Skipped: "),
      coloured(skipped, "skip"),
    ]),
  );

  content.push(
    paragraph([
      strong("Overall Status: "),
      coloured(
        overallStatus,
        overallStatus === "PASS"
          ? "pass"
          : overallStatus === "FAIL"
            ? "fail"
            : "pending",
      ),
    ]),

    paragraph([
      subtle(
        "Passed = completed successfully, Failed = errors encountered, Skipped = not executed, Pending = awaiting execution",
      ),
    ]),
  );

  content.push(...divider());

  /* ===============================
     CYPRESS ✅
  =============================== */
  content.push(
    headingWithMetric(
      "Cypress (E2E)",
      `${Math.round(cypress.passRate ?? 0)}%`,
      (cypress.passRate ?? 0) >= 95
        ? "pass"
        : (cypress.passRate ?? 0) < 70
          ? "fail"
          : "pending",
    ),
  );

  content.push(paragraph([text(buildSummaryLine(cypress))]));

  content.push(...buildAreaSection(cypress));

  // ✅ Top risks (simple bullets)
  const features = cypress.features ?? [];
  const topRisks = [...features]
    .filter((f) => f.failed > 0)
    .sort((a, b) => b.failed - a.failed)
    .slice(0, 3);

  if (topRisks.length > 0) {
    content.push(paragraph([strong("Key Risk Areas:")]), {
      type: "bulletList",
      content: topRisks.map((f) => ({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: [text(`${f.name} (${f.failed} failures)`)],
          },
        ],
      })),
    });
  }
  content.push(...divider());

  /* ===============================
     BACKEND ✅
  ============================== */
  content.push(
    headingWithMetric(
      "Backend (API)",
      `${Math.round(backend.passRate ?? 0)}%`,
      (backend.passRate ?? 0) >= 95
        ? "pass"
        : (backend.passRate ?? 0) < 70
          ? "fail"
          : "pending",
    ),
  );

  content.push(paragraph([text(buildSummaryLine(backend))]));

  content.push(...buildAreaSection(backend));

  content.push(...divider());

  /* ===============================
     FRONTEND ✅
  =============================== */
  content.push(
    headingWithMetric(
      "Frontend (UI)",
      `${Math.round(frontend.passRate ?? 0)}%`,
      (frontend.passRate ?? 0) >= 95
        ? "pass"
        : (frontend.passRate ?? 0) < 70
          ? "fail"
          : "pending",
    ),
  );

  content.push(paragraph([text(buildSummaryLine(frontend))]));

  content.push(...buildAreaSection(frontend));

  content.push(...divider());

  /* ===============================
     MANUAL ✅
  =============================== */
  content.push(
    headingWithMetric(
      "Manual Testing",
      manual.total > 0 && manual.skipped === manual.total
        ? "N/A"
        : `${Math.round(manual.passRate ?? 0)}%`,
      "pending",
    ),
  );

  content.push(paragraph([text(buildSummaryLine(manual))]));

  content.push(...buildAreaSection(manual));

  content.push(...divider());

  return {
    version: 1,
    type: "doc",
    content,
  };
}

/* ===============================
   HELPER FILES
=============================== */

function headingWithMetric(
  label: string,
  value: string,
  colour: "pass" | "fail" | "pending",
) {
  return {
    type: "heading",
    attrs: { level: 2 },
    content: [
      {
        type: "text",
        text: label.toUpperCase() + "   ",
        marks: [{ type: "strong" }],
      },
      {
        type: "text",
        text: value,
        marks: [{ type: "strong" }, getColourMark(colour)],
      },
    ],
  };
}

function bigMetric(
  label: string,
  value: string,
  colour: "pass" | "fail" | "pending",
) {
  return [
    {
      type: "heading",
      attrs: { level: 1 }, // ✅ single heading
      content: [
        {
          type: "text",
          text: label.toUpperCase() + "    ",
          marks: [{ type: "strong" }],
        },
        {
          type: "text",
          text: value,
          marks: [{ type: "strong" }, getColourMark(colour)],
        },
      ],
    },
  ];
}
``;

function divider() {
  return [
    // { type: "paragraph", content: [{ type: "text", text: " " }] },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "────────────────────────────",
        },
      ],
    },
    //{ type: "paragraph", content: [{ type: "text", text: " " }] }
  ];
}

function buildSummaryLine(data: ResultSummary) {
  const failed = data.failed ?? 0;
  const passRate = data.passRate ?? 0;

  if (!data.total || data.skipped === data.total) {
    return "⚠️ Not executed — coverage incomplete";
  }

  if (failed === 0 && passRate >= 95) {
    return "✅ Stable with no detected failures";
  }

  if (failed === 0) {
    return "✅ Stable with minor issues";
  }

  if (passRate >= 90) {
    return "⚠️ Minor instability detected";
  }

  return "🔴 Significant instability — investigation required";
}

function buildAreaSection(data: ResultSummary) {
  const total = data.total ?? 0;
  const passed = data.passed ?? 0;
  const failed = data.failed ?? 0;
  const skipped = data.skipped ?? 0;
  const passRate = data.passRate ?? 0;

  return [
    paragraph([
      strong("Total: "),
      coloured(total, "tests"),
      spacer(),
      strong("Passed: "),
      coloured(passed, "pass"),
      spacer(),
      strong("Failed: "),
      coloured(failed, "fail"),
      spacer(),
      strong("Skipped: "),
      coloured(skipped, "skip"),
    ]),
  ];
}

function subtle(value: string | number) {
  return {
    type: "text",
    text: String(value),
    marks: [
      { type: "em" },
      getColourMark("neutral"), // ✅ greyed
    ],
  };
}

function paragraph(content: any[]) {
  return {
    type: "paragraph",
    content,
  };
}

function text(value: string | number) {
  return { type: "text", text: String(value) };
}

function strong(value: string | number) {
  return { type: "text", text: String(value), marks: [{ type: "strong" }] };
}

function coloured(
  value: string | number,
  colour:
    "tests" | "pass" | "fail" | "pending" | "pendingSoft" | "skip" | "neutral",
) {
  return {
    type: "text",
    text: String(value),
    marks: [getColourMark(colour)],
  };
}

function spacer() {
  return { type: "text", text: "   " };
}

function getColourMark(
  colour:
    "tests" | "pass" | "fail" | "pending" | "pendingSoft" | "skip" | "neutral",
) {
  const palette = {
    tests: "#d8f118", // ✅ black for total tests
    pass: "#36B37E", // ✅ green
    fail: "#FF5630", // ✅ red
    pending: "#FFAB00", // ✅ Jira amber/yellow
    pendingSoft: "#00B8D9", // ✅ lighter yellow for pending (optional)
    skip: "#4C9AFF", // ✅ neutral grey (better than blue)
    neutral: "#A5ADBA",
  };

  return {
    type: "textColor",
    attrs: { color: palette[colour] },
  };
}
