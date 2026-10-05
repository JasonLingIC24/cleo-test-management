import fs from "fs";
import path from "path";
import { configAccess } from "./configAccessService.js";
import {
  getSourceTag,
  getPreviousTag,
  tagExists,
  getCurrentBranch,
  checkoutTag,
  checkoutBranch,
} from "./gitSourceService.js";
import { RuntimeContext } from "../models/runtimeContext.js";
import { getChangedFiles } from "./changeAnalysisService.js";
import { getCommitsBetweenTags } from "./commitAnalysisService.js";
import { classifyCommits } from "./commitClassificationService.js";
import { correlateJiraCommits } from "../services/jiraCommitCorrelationService.js";
import { enrichReleaseIssues } from "../services/jiraReleaseEnrichmentService.js";
import { saveJiraReleaseAnalysis } from "./jiraReleaseAnalysisWriter.js";
import { compareReleaseAgainstGit } from "./jiraReleaseComparisonService.js";
import { buildReleaseNarratives } from "./releaseNarrativeService.js";
import { saveReleaseNarratives } from "./releaseNarrativeWriter.js";
import type { ReleaseNarrative } from "../models/releaseNarrativeModels.js";
import { buildReleaseThemes } from "./releaseThemeService.js";
import { saveReleaseThemes } from "./releaseThemeWriter.js";
import { buildThemePrompt } from "./releaseThemePromptService.js";

export async function acquireVersionedTests(runtimeContext?: RuntimeContext) {
  const sourceRepo = process.env.ELEVATE_MONOREPO;
  if (!sourceRepo) {
    throw new Error("ELEVATE_MONOREPO environment variable not configured");
  }

  const tag = getSourceTag(runtimeContext?.sourceTag);
  if (!tagExists(tag)) {
    throw new Error(`Release tag not found: ${tag}`);
  }

  const previousTag = getPreviousTag(tag);
  console.log(`🔖 Source tag: ${tag}`);
  console.log(`🔖 Previous tag: ${previousTag}`);
  console.log(`🔖 Source repository: ${sourceRepo}`);

  const sourceTests = path.join(
    sourceRepo,
    "automation-test-framework",
    "cypress",
    "tests",
  );

  const destination = configAccess.getVersionedCypressSpecs();

  if (!fs.existsSync(sourceTests)) {
    throw new Error(`Tests directory not found: ${sourceTests}`);
  }

  fs.rmSync(destination, {
    recursive: true,
    force: true,
  });

  fs.mkdirSync(destination, {
    recursive: true,
  });

  console.log(`\n✅ Verified source tag: ${tag}`);
  const currentBranch = getCurrentBranch();
  console.log(`🌿 Current branch: ${currentBranch}`);

  try {
    checkoutTag(tag);
    console.log(`✅ Checked out tag: ${tag}`);

    fs.cpSync(sourceTests, destination, { recursive: true });
    console.log("✅ Acquired Cypress tests ");
  } finally {
    checkoutBranch(currentBranch);
    console.log(`✅ Restored branch: ${currentBranch}`);
  }

  if (previousTag) {
    const changes = getChangedFiles(previousTag, tag);

    /* ====================
       📈 Change Summary 
    ==================== */
    const categorisedTotal =
      changes.backendFiles.length +
      changes.frontendFiles.length +
      changes.cypressFiles.length +
      changes.devopsFiles.length +
      changes.mockServerFiles.length +
      changes.otherFiles.length;

    console.log("\n📈 Change Summary");
    console.log(`   Changed files: ${changes.changedFiles.length}`);
    console.log(`   Categorised files: ${categorisedTotal}`);
    console.log(`\n   DevOps files: ${changes.devopsFiles.length}`);
    console.log(`   Frontend files: ${changes.frontendFiles.length}`);
    console.log(`   Backend files: ${changes.backendFiles.length}`);
    console.log(`   Cypress files: ${changes.cypressFiles.length}`);
    console.log(`   Mock Server files: ${changes.mockServerFiles.length}`);
    console.log(`   Other files: ${changes.otherFiles.length}`);

    /* ====================
       📝 Delivery Overview 
    ==================== */
    const delivery = getCommitsBetweenTags(previousTag, tag);
    const deliverySummary = classifyCommits(delivery);
    console.log("");
    console.log("📝 Delivery Overview");
    console.log(`   Commits: ${delivery.commits.length}`);
    console.log(`   Features: ${deliverySummary.features.length}`);
    console.log(`   Fixes: ${deliverySummary.fixes.length}`);
    console.log(`   Tests: ${deliverySummary.tests.length}`);
    console.log(`   Other: ${deliverySummary.others.length}`);

    /* ====================
       🎫 Jira Mapping 
    ==================== */
    const jiraCorrelation = correlateJiraCommits(previousTag, tag);
    const jiraReleaseAnalysis = await enrichReleaseIssues(jiraCorrelation);
    console.log("");
    console.log("🎫 Jira Mapping");
    console.log(`   Jira references: ${jiraCorrelation.jiraMappings.length}`);
    console.log("");
    console.log("🎫 Jira Analysis");
    console.log(
      `   Valid Jira issues: ${jiraReleaseAnalysis.validIssues.length}`,
    );
    console.log(
      `   Invalid references: ${jiraReleaseAnalysis.invalidReferences.length}`,
    );

    /* ====================
    Invalid Jira References 
    ==================== */
    if (jiraReleaseAnalysis.invalidReferences.length) {
      console.log("");
      console.log("⚠️ Governance Issues");

      jiraReleaseAnalysis.invalidReferences.forEach((item) => {
        console.log(
          `   ${item.jiraKey} (${item.commits.length} commit${item.commits.length === 1 ? "" : "s"})`,
        );

        item.commits.slice(0, 3).forEach((commit) => {
          console.log(`      • ${commit.subject}`);
        });
      });
    }

    /* ====================
    Release Traceability 
    ==================== */
    const releaseComparison = await compareReleaseAgainstGit(
      tag,
      jiraReleaseAnalysis,
    );
    console.log("");
    console.log("📊 Release Traceability");

    if (releaseComparison.jiraVersionIssues.length === 0) {
      console.log("");
      console.log(`   Release Version: ${releaseComparison.releaseVersion}`);
      console.log("");
      console.log(
        `   ⚠️ No Jira issues were found with FixVersion "${releaseComparison.releaseVersion}"`,
      );

      console.log("");
      console.log(
        `   Commit-referenced issues: ${releaseComparison.referencedInGit.length}`,
      );
      console.log(
        `   Invalid references: ${releaseComparison.invalidReferences.length}`,
      );

      console.log("");
      console.log("   Possible causes:");
      console.log(
        `      • FixVersion "${releaseComparison.releaseVersion}" has not been created in Jira`,
      );
      console.log(
        "      • Issues have not been assigned to the release version",
      );
      console.log("");

      console.log(
        "   Traceability analysis has been limited to commit-linked Jira issues.",
      );
    } else {
      console.log(
        `   Jira Version Issues: ${releaseComparison.jiraVersionIssues.length}`,
      );
      console.log(
        `   Referenced In Git: ${releaseComparison.referencedInGit.length}`,
      );
      console.log(
        `   Missing From Git: ${releaseComparison.missingFromGit.length}`,
      );
      console.log(
        `   Invalid References: ${releaseComparison.invalidReferences.length}`,
      );
    }

    /* ====================
    Release Highlights 
    ==================== */
    const narratives = buildReleaseNarratives(jiraReleaseAnalysis);
    const themes = buildReleaseThemes(narratives);
    const themesPath = saveReleaseThemes(themes);
    if (themes.length > 0) {
      console.log("");
      console.log("🤖 Example AI Prompt");
      console.log("");

      console.log(buildThemePrompt(themes[0]));
    }

    console.log("");
    console.log("📢 Release Highlights");

    narratives.slice(0, 3).forEach((item: ReleaseNarrative) => {
      console.log("");

      if (item.commitCount === 1) {
        console.log(` • ${item.jiraKey} (${item.commitCount} commit)`);
      } else {
        console.log(` • ${item.jiraKey} (${item.commitCount} commits)`);
      }

      console.log(`   ${item.narrative}`);
    });

    // if (deliverySummary.features.length > 0) {
    //   console.log("");
    //   console.log("✨ Key Features");
    //   deliverySummary.features.slice(0, 5).forEach((item) => {
    //     console.log(`   • ${item}`);
    //   });
    // }

    // if (deliverySummary.fixes.length > 0) {
    //   console.log("");
    //   console.log("🐛 Key Fixes");
    //   deliverySummary.fixes.slice(0, 5).forEach((item) => {
    //     console.log(`   • ${item}`);
    //   });
    // }

    if (releaseComparison.missingFromGit.length > 0) {
      console.log("");
      console.log("⚠️ Jira Issues Without Commit References");
      for (const key of releaseComparison.missingFromGit.slice(0, 10)) {
        console.log(`   ${key}`);
      }
    }

    /* ======
    Artifacts 
    ======= */
    console.log("\n📄 Generated Reports");

    const jiraAnalysisPath = saveJiraReleaseAnalysis(jiraReleaseAnalysis);
    const narrativesPath = saveReleaseNarratives(narratives);

    console.log(`   Jira Analysis .......... ${jiraAnalysisPath}`);
    console.log(`   Release Narratives ..... ${narrativesPath}`);
    console.log(`   Release Themes ......... ${themesPath}`);
  }
}
