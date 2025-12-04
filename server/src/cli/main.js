#!/usr/bin/env node
import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";
import { Command } from "commander";
import {login} from "./commands/auth/login.js";
dotenv.config();

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
  
  const program = new Command("orbitals");
  program
    .version("0.0.1")
    .description("CLI HUB - A CLI based AI Tool")
    .addCommand(login)
    .action(() => {
      program.help();
    });
  
  program.parse();
}

main().catch((err) => {
  console.log(chalk.red("ERROR Running CLI Hub"), err);
  process.exit(1);
});