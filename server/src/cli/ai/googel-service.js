import { google } from "@ai-sdk/google";
import { streamText, generateObject,jsonSchema } from "ai";
import { config as defaultConfig } from "../../config/google.config.js";
import chalk from "chalk";

/**
 * AIService handles all interactions with the Google Gemini API.
 * It is initialized with a user-provided API key to ensure
 * individual quota management for NPM package users.
 */
export class AIService {
    /**
     * @param {string} userProvidedKey - The Gemini API key from the user's local config.
     */
    constructor(userProvidedKey) {
        // Fallback to env if userProvidedKey isn't passed (for local testing)
        this.apiKey = userProvidedKey || defaultConfig.googleApiKey;
        
        if (!this.apiKey) {
            throw new Error("No Google API Key found. Please run 'orbitals config' to set your key.");
        }
        
        console.log(chalk.gray('[AIService] Initializing with User-Provided API Key'));
        
        // Initialize the model with the dynamic key
        this.model = google(defaultConfig.model || "gemini-2.0-flash", {
            apiKey: this.apiKey,
        });
    }

    /**
     * Sends a streaming message to the AI.
     * @param {Array} messages - Chat history.
     * @param {Function} onChunk - Callback for streaming text.
     * @param {Array} tools - Optional tools to enable.
     */
    async sendMessage(messages, onChunk, tools = undefined, onToolCall = null) {
        try {
            console.log(chalk.gray(`\n[AIService] Sending message to ${defaultConfig.model}`));
            
            const streamConfig = {
                model: this.model,
                messages: messages,
                maxSteps: 5,
            };
            
            // Tool Configuration
            if (tools && Array.isArray(tools) && tools.length > 0) {
                // Check specifically for google_search enablement
                const hasGoogleSearch = tools.some(tool => 
                    tool.name === "google_search" || 
                    (tool._def?.name && tool._def.name === "google_search")
                );
                
                if (hasGoogleSearch) {
                    console.log(chalk.gray('[AIService] Activating Google Search tool'));
                    streamConfig.tools = {
                        google_search: google.tools.googleSearch({
                            apiKey: this.apiKey,
                        })
                    };
                }
            }

            const result = streamText(streamConfig);
            let fullResponse = "";
            let toolCalls = [];
            
            // Consume the text stream
            for await (const chunk of result.textStream) {
                fullResponse += chunk;
                if (onChunk) onChunk(chunk);
            }
            
            // Capture Tool Calls
            if (result.toolCalls) {
                toolCalls = result.toolCalls;
                if (onToolCall && toolCalls.length > 0) {
                    toolCalls.forEach(tc => {
                        onToolCall({ toolName: tc.toolName, args: tc.args });
                    });
                }
            }
            
            return {
                content: fullResponse,
                finishResponse: result.finishReason,
                usage: result.usage,
                toolCalls: toolCalls,
                toolResults: result.toolResults || []
            };
        }
        catch (error) {
            // Specific handling for Quota Exceeded errors
            if (error.statusCode === 429 || error.message?.includes("quota")) {
                console.error(chalk.red("\n[AIService] Error: You have exceeded your Gemini API quota."));
                console.error(chalk.yellow("Please check your billing at: https://aistudio.google.com/"));
            } else {
                console.error(chalk.red(`[AIService] API Error: ${error.message}`));
            }
            throw error;
        }
    }

    /**
     * Non-streaming version for quick replies.
     */
    async getMessage(messages, tools = undefined) {
        let fullResponse = "";
        const result = await this.sendMessage(messages, (chunk) => {
            fullResponse += chunk;
        }, tools);
        return result.content;
    }

    /**
     * Analyzes terminal errors and returns structured location/solution data.
     */
   async simplifyError(errorText) {
    const prompt = `
    TASK: Analyze the terminal error.
    STRICT RULE: Be extremely brief. No full sentences.
    
    Error Text: ${errorText}
    
    Return JSON:
    {
      "location": "File path and line number only (e.g.,File-: DashboardPage.jsx on Line 99)",
      "solution": "The 1-line code fix (e.g., Change 'iff' to 'if')"
    }`;

    const schema = {
        type: "object",
        properties: {
            location: { type: "string" },
            solution: { type: "string" }
        },
        required: ["location", "solution"],
        additionalProperties: false
    };

    return await this.generateStructured(schema, prompt);
}
    /**
     * Used for structured data generation (e.g., Agent decision making).
     */
async generateStructured(schema, prompt) {
        try {
            const result = await generateObject({
                model: this.model,
                // 2. Wrap your schema in the jsonSchema() helper
                schema: jsonSchema(schema), 
                prompt: prompt,
            });
            return result.object;
        } catch (e) {
            console.error(chalk.red("[AIService] Structured Generation Error:"), e.message);
            throw e;
        }
    }
}