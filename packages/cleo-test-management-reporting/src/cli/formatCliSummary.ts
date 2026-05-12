import type { CodemodResult } from "cleo-cypress-codemod";

export function formatCliSummary(result: CodemodResult): string {
  const lines: string[] = [];

  lines.push("");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push(" CLEO CYPRESS CODEMOD");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push(` Mode        : ${result.metadata.dryRun ? "DRY RUN" : "WRITE"}`);
  lines.push(` Domain root : ${result.metadata.domainRoot}`);
  lines.push(` Run at      : ${result.metadata.runAt}`);
  lines.push("");

  const changedFiles = result.files.filter(f => f.changes.featureWrapperAdded);

  for (const file of changedFiles) {
    lines.push(`✔ ${file.filePath}`);
    if (file.changes.featureWrapperAdded) {
      lines.push("   • Feature wrapper created");
    }
    if (file.changes.tagsLifted) {
      lines.push(`   • Lifted tags: ${file.before.topLevelTags.join(", ")}`);
    }
    if (file.derivation.domain) {
      lines.push(`   • Domain: ${file.derivation.domain} (${file.derivation.source})`);
    }
    if (file.derivation.subdomain) {
      lines.push(`   • Subdomain: ${file.derivation.subdomain}`);
    }
    lines.push("");
  }

  const hidden = result.files.length - changedFiles.length;
  if (hidden > 0) {
    lines.push(`─ unchanged (${hidden} files hidden) ─`);
    lines.push("");
  }

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push(" SUMMARY");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push(` Files scanned          : ${result.summary.filesScanned}`);
  lines.push(` Files changed          : ${result.summary.filesChanged}`);
  lines.push(` Feature wrappers added : ${result.summary.featuresCreated}`);
  lines.push(` Tags lifted            : ${result.summary.tagsLifted}`);
  lines.push(` Domain tags added      : ${result.summary.domainTagsAdded}`);
  lines.push(` Subdomain tags added   : ${result.summary.subdomainTagsAdded}`);
  lines.push(` Warnings               : ${result.summary.warnings}`);
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  return lines.join("\n");
}
