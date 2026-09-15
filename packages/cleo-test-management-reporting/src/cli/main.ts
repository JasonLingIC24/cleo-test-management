import "dotenv/config";
import { Command } from "commander";
import { registerReportCommands } from "../commands/reportCommands.js";
import { registerJiraCommands } from "../commands/jiraCommands.js";
import { registerPublishCommands } from "../commands/publishCommands.js";
import { registerDocsCommands } from "../commands/docsCommands.js";
import { registerExecutionReportCommands } from "../commands/executionReportCommands.js";
import { registerResultsCommands } from "../commands/resultsCommands.js";
import { registerTransformCommands } from "../commands/transformCommands.js";
import { registerCodemodCommands } from "../commands/codemodCommands.js";
import { registerPipelineCommands } from "../commands/pipelineCommands.js";

const program = new Command();

program
  .name("cleo")
  .description("Cleo Test Management CLI")
  .version("0.1.0")
  .showHelpAfterError()
  .showSuggestionAfterError();

program.enablePositionalOptions();
program.passThroughOptions();

registerReportCommands(program);
registerJiraCommands(program);
registerPublishCommands(program);
registerDocsCommands(program);
registerExecutionReportCommands(program);
registerResultsCommands(program);
registerTransformCommands(program);
registerCodemodCommands(program);
registerPipelineCommands(program);

/* ============================================================
   PIPELINE COMMAND - Run full pipeline with one command
============================================================ */
program.addHelpText(
  "after",
  `

📦 CORE COMMANDS

  codemod validate                Validate Cypress tests (no changes)
  codemod run                     Standardise Cypress tests


🧩 TRANSFORMS

  transform:manual                Convert manual Excel tests → features + JSON
  transform:automated             Generate reports from Cypress specs


📊 RESULTS & DASHBOARD

  aggregate-results               Combine frontend, backend & Cypress results
  dashboard                       Generate HTML QA dashboard
  generate:execution-reports      Generate Cypress execution Excel reports


📄 REPORT GENERATION

  generate:release-notes-from-keys     Generate release notes from Jira keys
  generate:release-notes-from-version  Generate release notes from Jira version
  generate:test-summary-report         Generate test summary document


🛠 JIRA INTEGRATION

  jira release-data               Fetch Jira issues for a version
  jira generate-tests             Generate automated tests from Jira


🚀 PUBLISHING

  publish:jira                   Publish dashboard to Jira
                                 (attachments optional)

    Options:
      --jira <key>                Target Jira issue
      --attach-summary            Attach test summary report
      --attach-release-notes      Attach release notes
      --version <name>            Required for auto-generating release notes


📦 FULL WORKFLOW

  release-pack                   Run full QA pipeline:
                                 • aggregate results
                                 • generate dashboard
                                 • generate summary report
                                 • generate release notes


📂 EXAMPLES

  # Generate release notes only
  cleo generate:release-notes-from-version --version v1.2.3

  # Generate summary report
  cleo generate:test-summary-report

  # Publish dashboard only
  cleo publish:jira --jira EVA-123

  # Publish with attachments
  cleo publish:jira \
    --jira EVA-123 \
    --attach-summary \
    --attach-release-notes \
    --version v1.2.3

  # Full release pipeline
  cleo release-pack --version v1.2.3

`,
);

await program.parseAsync(process.argv);

//  2103  npm run build
//  2104  npm run cleo -- generate:docs
//  2105  npm run cleo -- codemod validate
//  2106  npm run cleo -- codemod run

//  2107  npm run cleo -- transform:manual
//  2108  npm run cleo -- transform:automated

//  2111  npm run cleo -- aggregate-results
//        npm run cleo -- extract:cypress-tags

//  2116  npm run cleo -- generate:execution-reports

//  2117  npm run cleo -- generate:release-notes-from-version --version "26.12.0"
//  2118  npm run cleo -- generate:test-summary-report

//  2119  npm run cleo -- publish:jira --jira "EVA-793"

// "packages/cleo-cypress-bdd",
// "packages/cleo-cypress-codemod",
// "packages/cleo-domain",
// "packages/cleo-test-generator",
