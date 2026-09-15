import fs from "fs";
import path from "path";

import { extractPlainTextFromADF } from "../parsers/jiraAdfParser.js";
import { extractAcceptanceCriteria } from "../parsers/acceptanceCriteriaParser.js";
import { generateFeatureFromIssue } from "../generators/gherkinGenerator.js";
import { generateTestCase } from "../generators/testCaseGenerator.js";
import { generateFeatureFromBDD } from "../generators/bddGenerator.js";
import {
  isBDDFormatted,
  extractBDDSteps
} from "../parsers/acceptanceCriteriaParser.js";


export async function generateTestsFromRelease(
  issues: any[],
  options: {
    featuresDir: string;
    testCasesDir: string;
    summaryDir: string;
  }
) {

  const { featuresDir, testCasesDir, summaryDir } = options;

  // ✅ ensure folders exist
  fs.mkdirSync(featuresDir, { recursive: true });
  fs.mkdirSync(testCasesDir, { recursive: true });
  fs.mkdirSync(summaryDir, { recursive: true });

  const allTestCases: any[] = [];

  for (const issue of issues) {

    // ✅ ALWAYS define this FIRST
    const featurePath = path.join(featuresDir, `${issue.key}.feature`);
    const testCasePath = path.join(testCasesDir, `${issue.key}.json`);

    const text = extractPlainTextFromADF(issue.description);

    // ✅ STEP 1 — feature attachment
    const featureAttachment = issue.fields?.attachment?.find((a: any) =>
      a.filename?.endsWith(".feature")
    );

    if (featureAttachment) {
      console.log(`📎 Using attached feature for ${issue.key}`);

      const res = await fetch(featureAttachment.content);
      const featureText = await res.text();

      fs.writeFileSync(featurePath, featureText, "utf8");

      continue;
    }

    // ✅ STEP 2 — BDD detection
    if (isBDDFormatted(text)) {
      console.log(`🧠 Detected BDD in ${issue.key}`);

      const steps = extractBDDSteps(text);
      const feature = generateFeatureFromBDD(issue, steps);

      fs.writeFileSync(featurePath, feature, "utf8");

      continue;
    }

    // ✅ STEP 3 — fallback
    const ac = extractAcceptanceCriteria(text);

    const feature = generateFeatureFromIssue(issue, text, ac);
    fs.writeFileSync(featurePath, feature, "utf8");

    // ✅ test cases still generated here
    const testCase = generateTestCase(issue, ac, text);
    fs.writeFileSync(testCasePath, JSON.stringify(testCase, null, 2));
  }


  // ✅ summary file
  const summaryPath = path.join(summaryDir, "all-test-cases.json");

  fs.writeFileSync(summaryPath, JSON.stringify(allTestCases, null, 2));

  console.log(`✅ Generated ${issues.length} features`);
}