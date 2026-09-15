import fs from "fs";
import path from "path";
import { Command } from "commander";
import { configAccess } from "./configAccessService.js";

/* =========================
   EXTRACT COMMANDS (RECURSIVE)
========================= */
function extractCommands(command: Command, parent = ""): any[] {

  const results: any[] = [];

  for (const cmd of command.commands) {

    const name = `${parent} ${cmd.name()}`.trim();

    results.push({
      name,
      description: cmd.description() || "",
      options: cmd.options.map(opt => ({
        flags: opt.flags,
        description: opt.description || ""
      }))
    });

    // ✅ recurse into subcommands
    results.push(...extractCommands(cmd, name));
  }

  return results;
}

/* =========================
   BUILD MARKDOWN
========================= */
function buildMarkdown(commands: any[]): string {

  const grouped: Record<string, any[]> = {};

  for (const cmd of commands) {
    const root = cmd.name.split(" ")[0];

    if (!grouped[root]) grouped[root] = [];
    grouped[root].push(cmd);
  }

  let md = `# Cleo CLI Documentation\n\n`;

  for (const [group, cmds] of Object.entries(grouped)) {

    md += `## ${group.toUpperCase()}\n\n`;

    for (const cmd of cmds) {
      md += `### \`${cmd.name}\`\n`;
      md += `${cmd.description}\n\n`;

      if (cmd.options.length) {
        md += `**Options:**\n\n`;
        for (const opt of cmd.options) {
          md += `- \`${opt.flags}\` — ${opt.description}\n`;
        }
        md += `\n`;
      }
    }
  }

  return md;
}

/* =========================
   BUILD CONFLUENCE FORMAT
========================= */
function buildConfluence(commands: any[]): string {

  let txt = `h1. Cleo CLI Documentation\n\n`;

  for (const cmd of commands) {
    txt += `h3. ${cmd.name}\n`;
    txt += `${cmd.description}\n\n`;

    if (cmd.options.length) {
      txt += `*Options:*\n`;
      for (const opt of cmd.options) {
        txt += `- ${opt.flags} — ${opt.description}\n`;
      }
      txt += `\n`;
    }
  }

  return txt;
}

/* =========================
   MAIN
========================= */
export function generateCliDocs(program: Command) {

  const docsDir = configAccess.getDocsRoot();

  const commands = extractCommands(program);

  const markdown = buildMarkdown(commands);
  const confluence = buildConfluence(commands);

  fs.mkdirSync(docsDir, { recursive: true });

  const readmePath = path.join(docsDir, "README.md");
  const confPath = path.join(docsDir, "confluence.md");

  fs.writeFileSync(readmePath, markdown);
  fs.writeFileSync(confPath, confluence);

  console.log("✅ CLI docs generated:");
  console.log(`   📄 ${readmePath}`);
  console.log(`   📄 ${confPath}`);
}