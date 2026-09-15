import { Command } from "commander";
import { generateCliDocs }
  from "../services/docsGeneratorService.js";

export function registerDocsCommands(
  program: Command
) {
/* ============================================================
   GENERATE DOCS COMMAND - Generate CLI documentation
============================================================ */
program
  .command("generate:docs")
  .description("Generate CLI documentation (auto from commands)")
  .action(() => {
    try {
      generateCliDocs(program);
    } catch (err: any) {
      console.error("❌ Failed to generate docs");
      console.error(err.message);
      process.exit(1);
    }
  });

}