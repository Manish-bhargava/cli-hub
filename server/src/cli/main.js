#!/usr/bin/env node
import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";
import { Command } from "commander";
import {login, whoami, logout} from "./commands/auth/login.js";
import { wakeUp } from "./commands/ai/wakeUp.js";
import { config } from "./commands/auth/config.js";
import { debug } from "./commands/ai/debug.js";
dotenv.config({ quiet: true });

async function main() {
  console.log(
    chalk.cyan(
      figlet.textSync("C L I  -  H U B", {
        font: "Standard",
        horizontalLayout: "default"
      })
    )
  );
  console.log(chalk.red("A CLI based AI Tool \n"));
  
  const program = new Command();
  program
    .name("orbitals")
    .version("0.0.1")
    .description("CLI HUB - A CLI based AI Tool");
  
  // Add subcommands
  program.addCommand(login);
  program.addCommand(logout);
  program.addCommand(whoami);
  program.addCommand(wakeUp);
  program.addCommand(config);
  program.addCommand(debug);
  // Check if no arguments provided
  if (process.argv.length <= 2) {
    program.help();
    return;
  }
  
  // Parse arguments
  program.parse(process.argv);
}

main().catch((err) => {
  console.log(chalk.red("ERROR Running CLI Hub"), err);
  process.exit(1);
});