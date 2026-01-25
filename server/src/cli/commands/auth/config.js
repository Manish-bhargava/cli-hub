import { intro, outro, text } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import fs from "fs/promises";
import path from "path";
import os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export async function setConfigAction() {
    intro(chalk.bold.cyan(" Orbitals CLI Configuration "));

    const apiKey = await text({
        message: "Enter your Google Gemini API Key:",
        placeholder: "AIza...",
        validate: (value) => {
            if (!value) return "API Key is required";
            if (!value.startsWith("AIza")) return "Invalid API Key format";
        }
    });

    try {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
        let currentConfig = {};
        try {
            const data = await fs.readFile(CONFIG_FILE, "utf-8");
            currentConfig = JSON.parse(data);
        } catch (e) { /* ignore if file doesn't exist */ }

        currentConfig.googleApiKey = apiKey;
        await fs.writeFile(CONFIG_FILE, JSON.stringify(currentConfig, null, 2));

        outro(chalk.green("API Key saved successfully!"));
    } catch (error) {
        console.error(chalk.red("Failed to save config:"), error.message);
    }
}

export const config = new Command("config")
    .description("Configure user API keys")
    .action(setConfigAction);