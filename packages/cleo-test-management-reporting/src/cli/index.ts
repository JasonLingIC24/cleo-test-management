#!/usr/bin/env node
import { Command } from "commander";
import { registerCodemodCommand } from "./codemod.js";

const program = new Command();

program
  .name("cleo")
  .description("Cleo Test Management Tooling")
  .version("0.1.0");

// Register subcommands
registerCodemodCommand(program);

program.parse(process.argv);
