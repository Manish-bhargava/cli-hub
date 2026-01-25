import { Command } from "commander";
import boxen from "boxen";
import chalk from "chalk";
import yoctoSpinner from "yocto-spinner";
import { AIService } from "../../ai/googel-service.js";
import { getLocalConfig } from "../../../lib/token.js";

/**
 * Displays the AI-generated error analysis in formatted boxes.
 * Uses boxen for the visual layout as requested.
 */
function displayErrorSolution(data) {
    // Box 1: The Error Location
    console.log("\n" + boxen(chalk.white(data.location), {
        title: chalk.red.bold(" ❌ ERROR LOCATION "),
        titleAlignment: "center",
        padding: 1,
        borderColor: "red",
        borderStyle: "bold"
    }));

    // Box 2: The Solution
    console.log(boxen(chalk.white(data.solution), {
        title: chalk.green.bold(" ✅ SUGGESTED SOLUTION "),
        titleAlignment: "center",
        padding: 1,
        borderColor: "green",
        borderStyle: "round"
    }) + "\n");
}

/**
 * The main action for the debug command.
 * It retrieves the local API key, initializes AIService, and calls simplifyError.
 */
export const debugAction = async (errorText) => {
    // 1. Validate Input
    if (!errorText || errorText.trim() === "") {
        console.log(chalk.yellow("No error text provided to debug."));
        return;
    }

    // 2. Load User Configuration (Option 1: User-Provided Keys)
    const config = await getLocalConfig();
    if (!config?.googleApiKey) {
        console.log(chalk.red("\n[!] Google API Key not found."));
        console.log(chalk.yellow("Please run: orbitals config\n"));
        return;
    }

    const spinner = yoctoSpinner({ text: "Analyzing error text...", color: "magenta" }).start();
    
    try {
        // 3. Initialize AI Service with the user's local key
        const aiService = new AIService(config.googleApiKey);

        // 4. Request structured analysis from Gemini
        const result = await aiService.simplifyError(errorText);
        
        spinner.success("Analysis complete");
        
        // 5. Render the visual boxes
        displayErrorSolution(result);
    } catch (error) {
        spinner.error("Analysis failed");
        
        // Handle specific Quota errors gracefully
        if (error.message.includes("quota") || error.message.includes("429")) {
            console.error(chalk.red("\n[!] Quota Exceeded: Please wait a minute or check your Gemini billing."));
        } else {
            console.error(chalk.red(`\n[!] AI Error: ${error.message}`));
        }
    }
};

/**
 * Commander Command Definition
 */
export const debug = new Command("debug")
    .description("Analyze and simplify a terminal error into Location and Solution boxes")
    .argument("<errorText>", "The raw error text captured from the terminal")
    .action(debugAction);