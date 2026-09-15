import fs from "fs";
import path from "path";
import { processCypressTestAssets } from "../services/artifactProcessingService.js";
import { configAccess } from "../services/configAccessService.js";

const regex = /(describe|it|test)\((`|"|')([^`"']+)(`|"|')/g;

type TestEntry = {
  title: string;
  tags: string[];
  missingTags: boolean; // ✅ FIXED
  mismatches: string[]; // ✅ for later use
};

type FileEntry = {
  file: string;
  tests: TestEntry[];
};

type MochaTestEntry = {
  title: string;
  tags: string[];
};

// ✅ extract tags
function extractTags(text: string): string[] {
  const matches = text.match(/@\w+:[^\s]+/g);
  return matches || [];
}

// ✅ extract domain
function extractDomain(tags: string[]): string {
  const match = tags.find((t) => t.startsWith("@domain:"));
  return match ? match.split("@domain:")[1] : "Unmapped";
}

// ✅ extract subdomain
function extractSubdomain(tags: string[]): string {
  const match = tags.find((t) => t.startsWith("@subdomain:"));
  return match ? match.split("@subdomain:")[1] : "-";
}

// ✅ mismatch detection
function detectMismatch(filePath: string, tags: string[]) {
  const parts = filePath.split(path.sep);

  const folderDomain = parts[0];
  const folderSubdomain = parts[1];

  const tagDomain = extractDomain(tags);
  const tagSubdomain = extractSubdomain(tags);

  const issues: string[] = [];

  if (folderDomain && tagDomain !== "Unmapped" && tagDomain !== folderDomain) {
    issues.push(`domain mismatch (folder: ${folderDomain}, tag: ${tagDomain})`);
  }

  if (
    folderSubdomain &&
    tagSubdomain !== "-" &&
    tagSubdomain !== folderSubdomain.toLowerCase()
  ) {
    issues.push(
      `subdomain mismatch (folder: ${folderSubdomain}, tag: ${tagSubdomain})`,
    );
  }

  return issues;
}

// ✅ process file
function processFile(filePath: string, testRoot: string): FileEntry {
  const content = fs.readFileSync(filePath, "utf8");

  const fileTags = extractTagsFromFile(content);

  const tests: TestEntry[] = [];

  let match;

  while ((match = regex.exec(content)) !== null) {
    const title = match[3];

    const relativePath = path.relative(testRoot, filePath);

    const mismatches = detectMismatch(relativePath, fileTags); // ✅ FIXED

    tests.push({
      title,
      tags: fileTags, // ✅ correct
      missingTags: fileTags.length === 0,
      mismatches,
    });
  }

  return {
    file: path.relative(testRoot, filePath),
    tests,
  };
}

// ✅ directory walker
function walk(dir: string, results: FileEntry[], testRoot: string) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, results, testRoot);
    } else if (item.endsWith(".spec.ts") || item.endsWith(".spec.js")) {
      results.push(processFile(fullPath, testRoot));
    }
  }
}

// ✅ MAIN FUNCTION
export function extractCypressTags(inputPath?: string) {
  const mochaRaw = processCypressTestAssets(configAccess.getCypressResults());

  let mochaTags: MochaTestEntry[] = [];

  if (mochaRaw) {
    mochaTags = extractTagsFromMochawesome(mochaRaw);
    console.log(`✅ Loaded ${mochaTags.length} tests from mochawesome`);
  } else {
    console.warn("⚠️ No mochawesome data found");
  }

  const results: FileEntry[] = [];

  const TEST_ROOT = inputPath
    ? path.resolve(process.cwd(), inputPath)
    : path.resolve(process.cwd(), configAccess.getVersionedCypressSpecs());

  const OUTPUT_PATH = path.join(
    configAccess.getJsonReports(),
    "cypress-tags.json",
  );

  console.log(`📥 Cypress test directory: ${TEST_ROOT}`);

  walk(TEST_ROOT, results, TEST_ROOT);

  // ✅ build comparison
  const fileTests = results.flatMap((f) => f.tests);

  function normalize(tags: string[]) {
    return [...tags].sort().join(",");
  }

  const comparison: any[] = [];

  for (let i = 0; i < Math.min(fileTests.length, mochaTags.length); i++) {
    const file = fileTests[i];
    const mocha = mochaTags[i];

    const fileNorm = normalize(file.tags);
    const mochaNorm = normalize(mocha.tags);

    if (fileNorm !== mochaNorm) {
      comparison.push({
        title: file.title,
        fileTags: file.tags,
        mochaTags: mocha.tags,
      });
    }
  }

  console.log(`🔍 Tag mismatches detected: ${comparison.length}`);

  // ✅ summary stats
  const allTests = fileTests;

  const totalTests = allTests.length;
  const untaggedTests = allTests.filter((t) => t.tags.length === 0).length;

  // ✅ domain grouping
  const domainCounts: Record<string, number> = {};

  for (const test of allTests) {
    const domain = extractDomain(test.tags);

    if (!domainCounts[domain]) {
      domainCounts[domain] = 0;
    }

    domainCounts[domain]++;
  }

  // ✅ build metrics
  const metrics = {
    totalTests,
    untaggedTests,
    mochaTestCount: mochaTags.length,
    comparisonCount: comparison.length,
    domainCounts,
  };

  // ✅ final output
  const output = {
    metrics,
    fileScan: results,
    mochaScan: mochaTags,
    comparison,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  // ✅ logging
  if (comparison.length > 0) {
    console.warn("⚠️ Some tags differ between file and runtime");
  }

  console.log(`📊 Total tests: ${totalTests}`);
  console.log(`⚠️ Untagged tests: ${untaggedTests}`);

  console.log("\n📊 Tests by domain:");

  Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([domain, count]) => {
      console.log(`   - ${domain}: ${count}`);
    });

  console.log(`\n✅ Cypress tags written to ${OUTPUT_PATH}`);
}

function extractTagsFromFile(content: string): string[] {
  const tagMatches = content.match(/tags\s*:\s*\[([^\]]+)\]/g);

  if (!tagMatches) return [];

  const tags: string[] = [];

  for (const match of tagMatches) {
    const inner = match.match(/\[([^\]]+)\]/);

    if (!inner) continue;

    const values = inner[1]
      .split(",")
      .map((v) => v.replace(/[`"' ]/g, "").trim())
      .filter(Boolean);

    tags.push(...values);
  }

  return tags;
}

function extractTagsFromMochawesome(data: any) {
  const results: MochaTestEntry[] = [];

  function walk(suite: any) {
    if (!suite) return;

    if (suite.tests) {
      for (const test of suite.tests) {
        let tags: string[] = [];

        if (test.context) {
          try {
            const cleaned = test.context
              .replace(/data:image\/png;base64,[^"]+/g, "")
              .replace(/\n/g, "")
              .replace(/\r/g, "");

            const parsed = JSON.parse(cleaned);

            const tagEntry = parsed.find((c: any) => c.title === "tags");

            if (tagEntry && Array.isArray(tagEntry.value)) {
              tags = tagEntry.value;
            }
          } catch {
            // ignore
          }
        }

        results.push({
          title: test.title,
          tags,
        });
      }
    }

    if (suite.suites) {
      for (const child of suite.suites) {
        walk(child);
      }
    }
  }

  for (const run of data.results || []) {
    walk(run);
  }

  return results;
}
